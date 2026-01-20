import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"
import Vendor from "./models/Vendor.js"
import Service from "./models/ServiceModel.js"

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for clearing and reseeding")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

const clearSeedData = async () => {
  try {
    console.log("Clearing existing seed data...")

    // Get all vendor users (those with emails from seed data)
    const seedEmails = [
      "info@elitecatering.com",
      "hello@dreamscapephoto.com", 
      "bookings@harmonymusic.com",
      "appointments@glamourbeauty.com",
      "design@elegantdeco.com",
      "orders@gourmetdelights.com",
      "info@momentsstudio.com",
      "book@rhythmbeats.com"
    ]

    const seedUsers = await User.find({ email: { $in: seedEmails } })
    const seedUserIds = seedUsers.map(user => user._id)

    if (seedUserIds.length > 0) {
      // Delete services created by seed users
      const deletedServices = await Service.deleteMany({ createdBy: { $in: seedUserIds } })
      console.log(`Deleted ${deletedServices.deletedCount} seed services`)

      // Delete vendor profiles for seed users
      const deletedVendors = await Vendor.deleteMany({ userId: { $in: seedUserIds } })
      console.log(`Deleted ${deletedVendors.deletedCount} seed vendor profiles`)

      // Delete seed users
      const deletedUsers = await User.deleteMany({ _id: { $in: seedUserIds } })
      console.log(`Deleted ${deletedUsers.deletedCount} seed users`)
    }

    console.log("Seed data cleared successfully!")
    
  } catch (error) {
    console.error("Error clearing seed data:", error)
  }
}

const runClearAndReseed = async () => {
  await connectDB()
  await clearSeedData()
  
  console.log("\nNow run: node seedVendors.js")
  console.log("This will create fresh seed data with proper images")
  
  mongoose.connection.close()
}

runClearAndReseed()