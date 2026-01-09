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
      search, // We added this specifically for the search bar
      minPrice,
      maxPrice,
      rating,
      page = 1,
      limit = 12,
      sortBy = "rating",
      sortOrder = "desc",
    } = req.query

    const filter = {}

    // 1. Unified Search (Business Name OR Location OR Description)
    // This is what the search bar in your app will trigger
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } }
      ]
    }

    // 2. Service Category Filtering
    if (service) {
      try {
        const Service = (await import("../models/ServiceModel.js")).default
        const servicesWithType = await Service.find({ serviceType: service }).distinct("createdBy")
        
        if (servicesWithType.length > 0) {
          filter.userId = { $in: servicesWithType }
        } else {
          filter._id = { $in: [] }
        }
      } catch (error) {
        filter._id = { $in: [] }
      }
    }

    // 3. Specific Location Filtering (if user uses a location-specific filter)
    if (location && !search) {
      filter.location = { $regex: location, $options: "i" }
    }

    // 4. Price & Rating
    if (minPrice || maxPrice) {
      if (minPrice) filter["priceRange.max"] = { $gte: Number.parseInt(minPrice) }
      if (maxPrice) filter["priceRange.min"] = { $lte: Number.parseInt(maxPrice) }
    }

    if (rating) {
      filter.rating = { $gte: Number.parseFloat(rating) }
    }

    // IMPORTANT: Ensure public browsing only sees verified vendors
    filter.verified = true

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
    console.log("updateVendorProfile called by user:", req.user.id)
    console.log("Request body:", req.body)
    
    let vendor = await Vendor.findOne({ userId: req.user.id })
    console.log("Existing vendor found:", vendor ? "Yes" : "No")

    if (!vendor) {
      // Create new vendor profile if it doesn't exist
      const { businessName = "My Business", location = "Not specified", priceRange = { min: 0, max: 1000 } } = req.body

      console.log("Creating new vendor profile...")
      
      vendor = new Vendor({
        userId: req.user.id,
        businessName,
        location,
        priceRange,
        ...req.body,
      })

      const savedVendor = await vendor.save()
      console.log("Vendor created successfully:", savedVendor._id)
      
      const populatedVendor = await Vendor.findById(savedVendor._id).populate("userId", "name email")

      return res.json({ message: "Vendor profile created successfully", vendor: populatedVendor })
    }

    // Update existing vendor profile
    console.log("Updating existing vendor profile:", vendor._id)
    
    const updatedVendor = await Vendor.findByIdAndUpdate(vendor._id, req.body, { new: true, runValidators: true }).populate(
      "userId",
      "name email",
    )

    console.log("Vendor updated successfully")
    res.json({ message: "Vendor profile updated successfully", vendor: updatedVendor })
  } catch (error) {
    console.error("Error in updateVendorProfile:", error)
    console.error("Error stack:", error.stack)
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

// Admin functions for vendor management
export const verifyVendor = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const { id } = req.params
    const { verified } = req.body

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { verified: verified },
      { new: true }
    ).populate("userId", "name email")

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    res.json({ 
      message: `Vendor ${verified ? 'verified' : 'unverified'} successfully`, 
      vendor 
    })
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor verification", error: error.message })
  }
}

export const featureVendor = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const { id } = req.params
    const { featured } = req.body

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { featured: featured },
      { new: true }
    ).populate("userId", "name email")

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    res.json({ 
      message: `Vendor ${featured ? 'featured' : 'unfeatured'} successfully`, 
      vendor 
    })
  } catch (error) {
    res.status(500).json({ message: "Error updating vendor featured status", error: error.message })
  }
}

export const getPendingVendors = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const pendingVendors = await Vendor.find({ verified: false })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })

    res.json({
      vendors: pendingVendors,
      count: pendingVendors.length
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending vendors", error: error.message })
  }
}


