import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import Service from "../models/ServiceModel.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
})

// Add service
const addService = async (req, res) => {
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
    const services = await Service.find().populate("createdBy", "name email").sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching services:", err)
    res.status(500).json({ error: "Failed to fetch services" })
  }
}

// Get services by user
const getUserServices = async (req, res) => {
  try {
    const services = await Service.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(services)
  } catch (err) {
    console.error("Error fetching user services:", err)
    res.status(500).json({ error: "Failed to fetch user services" })
  }
}

// Get single service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params
    const service = await Service.findById(id).populate("createdBy", "name email")

    if (!service) {
      return res.status(404).json({ error: "Service not found" })
    }

    res.json(service)
  } catch (err) {
    console.error("Error fetching service:", err)
    res.status(500).json({ error: "Failed to fetch service" })
  }
}

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params
    const service = await Service.findById(id)

    if (!service) {
      return res.status(404).json({ error: "Service not found" })
    }

    // Check if user owns the service
    if (service.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this service" })
    }

    // Delete associated image files
    if (service.images && service.images.length > 0) {
      service.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
      })
    }

    await Service.findByIdAndDelete(id)
    res.json({ message: "Service deleted successfully" })
  } catch (err) {
    console.error("Error deleting service:", err)
    res.status(500).json({ error: "Failed to delete service" })
  }
}

// Routes
router.post("/add", authMiddleware, upload.array("images", 4), addService)
router.get("/", getAllServices)
router.get("/my-services", authMiddleware, getUserServices)
router.get("/:id", getServiceById)
router.delete("/:id", authMiddleware, deleteService)

export default router
