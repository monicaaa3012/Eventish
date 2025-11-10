import Vendor from "../models/Vendor.js"
import User from "../models/User.js"

export const createVendorProfile = async (req, res) => {
  try {
    const { businessName, companyName, bio, profileImage, description, services, location, priceRange, contactInfo } =
      req.body

    const existingVendor = await Vendor.findOne({ userId: req.user.id })
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor profile already exists" })
    }

    const vendor = new Vendor({
      userId: req.user.id,
      businessName,
      companyName,
      bio,
      profileImage,
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

export const getAllVendors = async (req, res) => {
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
      currentPage: Number.parseInt(page),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendors", error: error.message })
  }
}

export const getVendorById = async (req, res) => {
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

export const getVendorByUserId = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.params.userId }).populate("userId", "name email")
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }
    res.json(vendor)
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendor", error: error.message })
  }
}

export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id }).populate("userId", "name email")
    if (!vendor) {
      // Return user data if no vendor profile exists yet
      const user = await User.findById(req.user.id)
      return res.status(200).json({
        name: user.name,
        email: user.email,
        companyName: "",
        phone: "",
        bio: "",
        profileImage: "",
        businessName: "",
        description: "",
        services: [],
        location: "",
        priceRange: { min: 0, max: 0 },
        contactInfo: { phone: "", email: user.email, website: "" },
      })
    }
    res.status(200).json(vendor)
  } catch (error) {
    console.error("Error in getVendorProfile:", error)
    res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

export const updateVendorProfile = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ userId: req.user.id })

    if (!vendor) {
      // Create new vendor profile if it doesn't exist
      const { businessName = "My Business", location = "Not specified", priceRange = { min: 0, max: 1000 } } = req.body

      vendor = new Vendor({
        userId: req.user.id,
        businessName,
        location,
        priceRange,
        ...req.body,
      })

      const savedVendor = await vendor.save()
      const populatedVendor = await Vendor.findById(savedVendor._id).populate("userId", "name email")

      return res.json({ message: "Vendor profile created successfully", vendor: populatedVendor })
    }

    // Update existing vendor profile
    const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, req.body, { new: true }).populate(
      "userId",
      "name email",
    )

    res.json({ message: "Vendor profile updated successfully", vendor: updatedVendor })
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor profile", error: error.message })
  }
}

export const getVendorServices = async (req, res) => {
  try {
    const services = await Vendor.distinct("services")
    res.json(services)
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message })
  }
}

export const getVendorLocations = async (req, res) => {
  try {
    const locations = await Vendor.distinct("location")
    res.json(locations)
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error: error.message })
  }
}
