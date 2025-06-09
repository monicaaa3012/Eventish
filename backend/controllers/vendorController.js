const Vendor = require("../models/Vendor")
const User = require("../models/User")

exports.createVendorProfile = async (req, res) => {
  try {
    const { businessName, description, services, location, priceRange, contactInfo } = req.body

    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({ userId: req.user.id })
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor profile already exists" })
    }

    const vendor = new Vendor({
      userId: req.user.id,
      businessName,
      description,
      services,
      location,
      priceRange,
      contactInfo,
    })

    const savedVendor = await vendor.save()
    res.status(201).json({ message: "Vendor profile created successfully", vendor: savedVendor })
  } catch (error) {
    res.status(500).json({ message: "Error creating vendor profile", error: error.message })
  }
}

exports.getAllVendors = async (req, res) => {
  try {
    const {
      service,
      location,
      minPrice,
      maxPrice,
      rating,
      page = 1,
      limit = 12,
      sortBy = "rating",
      sortOrder = "desc",
    } = req.query

    // Build filter object
    const filter = {}

    if (service) {
      filter.services = { $in: [new RegExp(service, "i")] }
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" }
    }

    if (minPrice || maxPrice) {
      filter.$or = []
      if (minPrice) {
        filter.$or.push({ "priceRange.min": { $gte: Number.parseInt(minPrice) } })
      }
      if (maxPrice) {
        filter.$or.push({ "priceRange.max": { $lte: Number.parseInt(maxPrice) } })
      }
    }

    if (rating) {
      filter.rating = { $gte: Number.parseFloat(rating) }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const vendors = await Vendor.find(filter)
      .populate("userId", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Vendor.countDocuments(filter)

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendors", error: error.message })
  }
}

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("userId", "name email")
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }
    res.json(vendor)
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendor", error: error.message })
  }
}

exports.updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" })
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, req.body, { new: true }).populate(
      "userId",
      "name email",
    )

    res.json({ message: "Vendor profile updated successfully", vendor: updatedVendor })
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor profile", error: error.message })
  }
}

exports.getVendorServices = async (req, res) => {
  try {
    const services = await Vendor.distinct("services")
    res.json(services)
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message })
  }
}

exports.getVendorLocations = async (req, res) => {
  try {
    const locations = await Vendor.distinct("location")
    res.json(locations)
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error: error.message })
  }
}
