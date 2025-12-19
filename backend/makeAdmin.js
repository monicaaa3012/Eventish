import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for admin creation")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

const makeAdmin = async () => {
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log("Usage: node makeAdmin.js <email>")
      console.log("Example: node makeAdmin.js admin@example.com")
      process.exit(1)
    }

    const user = await User.findOne({ email })
    
    if (!user) {
      console.log(`User with email ${email} not found`)
      process.exit(1)
    }

    if (user.role === "admin") {
      console.log(`User ${email} is already an admin`)
      process.exit(0)
    }

    await User.findByIdAndUpdate(user._id, { role: "admin" })
    console.log(`Successfully made ${email} an admin`)
    
  } catch (error) {
    console.error("Error making user admin:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the script
connectDB().then(() => {
  makeAdmin()
})