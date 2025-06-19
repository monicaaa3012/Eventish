import express from "express"
import multer from "multer"
import path from "path"
import { addService, getAllServices, getUserServices } from "../controllers/ServiceController.js"
import authMiddleware from "../middleware/authMiddleware.js"

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

// Routes
router.post("/add", authMiddleware, upload.array("images", 4), addService)
router.get("/", getAllServices)
router.get("/my-services", authMiddleware, getUserServices)

export default router
