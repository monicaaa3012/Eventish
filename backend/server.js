const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const connectDB = require("./config/db.js")
const authRoutes = require("./routes/authRoutes.js")
const eventRoutes = require("./routes/eventRoutes.js")
const vendorRoutes = require("./routes/vendorRoutes.js")
const serviceRoutes = require("./routes/ServiceRoutes.js")
const multer = require("multer")

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
app.use("/api/vendors", vendorRoutes)
app.use("/api/services", serviceRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error)
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" })
    }
  }
  res.status(500).json({ error: error.message })
})

// 404 handler
app.use((req, res) => {
  console.log("404 - Route not found:", req.method, req.path)
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
