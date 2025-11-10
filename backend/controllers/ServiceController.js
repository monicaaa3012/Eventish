import Service from "../models/ServiceModel.js"

// Add service
const addService = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" })
    }

    const imagePaths = req.files.map((file) => file.path)
    const { description, price } = req.body

    if (!description || !price) {
      return res.status(400).json({ error: "Description and price are required" })
    }

    const numericPrice = Number.parseFloat(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" })
    }

    const newService = new Service({
      images: imagePaths,
      description,
      price: numericPrice,
      createdBy: req.user.id,
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

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching services:", err)
    res.status(500).json({ error: "Failed to fetch services" })
  }
}

// Get services created by logged-in user
const getUserServices = async (req, res) => {
  try {
    const services = await Service.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching user services:", err)
    res.status(500).json({ error: "Failed to fetch user services" })
  }
}

export { addService, getAllServices, getUserServices }
