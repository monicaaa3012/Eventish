import mongoose from "mongoose"
import dotenv from "dotenv"
import Vendor from "./models/Vendor.js"

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for vendor verification")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

const verifyAllVendors = async () => {
  try {
    const result = await Vendor.updateMany(
      { verified: false },
      { verified: true }
    )
    
    console.log(`Verified ${result.modifiedCount} vendors`)
    
    // Also make some vendors featured for testing
    const featuredResult = await Vendor.updateMany(
      { businessName: { $in: ["Elite Catering Co.", "Dreamscape Photography", "Harmony Music Events"] } },
      { featured: true }
    )
    
    console.log(`Made ${featuredResult.modifiedCount} vendors featured`)
    
  } catch (error) {
    console.error("Error verifying vendors:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the script
connectDB().then(() => {
  verifyAllVendors()
})