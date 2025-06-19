import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import serviceRoutes from "./routes/ServiceRoutes.js"
import multer from "multer" // Import multer

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
connectDB()

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Add your frontend URLs
    credentials: true,
  }),
)
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/services", serviceRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" })
    }
  }
  res.status(500).json({ error: error.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
