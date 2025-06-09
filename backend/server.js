const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const eventRoutes = require("./routes/eventRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const vendorRoutes = require("./routes/vendorRoutes")
dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/vendors", vendorRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
