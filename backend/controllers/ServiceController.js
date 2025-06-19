import Service from "../models/ServiceModel.js"

export const addService = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" })
    }

    const imagePaths = req.files.map((file) => file.path)
    const { description, price } = req.body

    // Validate required fields
    if (!description || !price) {
      return res.status(400).json({ error: "Description and price are required" })
    }

    // Validate price
    const numericPrice = Number.parseFloat(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" })
    }

    const newService = new Service({
      images: imagePaths,
      description,
      price: numericPrice,
      createdBy: req.user.id, // Add user reference if you want to track who created the service
    })

    await newService.save()
    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    })
  } catch (err) {
    console.error("Error adding service:", err)
    res.status(500).json({ error: "Something went wrong while adding the service" })
  }
}

// Add a function to get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching services:", err)
    res.status(500).json({ error: "Failed to fetch services" })
  }
}

// Add a function to get services by user (if you add createdBy field)
export const getUserServices = async (req, res) => {
  try {
    const services = await Service.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching user services:", err)
    res.status(500).json({ error: "Failed to fetch user services" })
  }
}
