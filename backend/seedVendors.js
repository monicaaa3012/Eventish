import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/User.js"
import Vendor from "./models/Vendor.js"
import Service from "./models/ServiceModel.js"
import bcrypt from "bcryptjs"

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for seeding")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

const sampleVendors = [
  {
    businessName: "Elite Catering Co.",
    description: "Premium catering services for weddings and corporate events. We specialize in gourmet cuisine and exceptional service.",
    location: "New York",
    priceRange: { min: 500, max: 5000 },
    rating: 4.8,
    reviewCount: 45,
    contactInfo: {
      phone: "+1-555-0101",
      email: "info@elitecatering.com",
      website: "www.elitecatering.com"
    },
    services: [
      { serviceType: "catering", description: "Full-service catering for all events", price: 1500 },
      { serviceType: "decoration", description: "Table setup and decoration", price: 800 }
    ]
  },
  {
    businessName: "Dreamscape Photography",
    description: "Professional wedding and event photography. Capturing your special moments with artistic flair.",
    location: "Los Angeles",
    priceRange: { min: 800, max: 3000 },
    rating: 4.9,
    reviewCount: 67,
    contactInfo: {
      phone: "+1-555-0102",
      email: "hello@dreamscapephoto.com",
      website: "www.dreamscapephoto.com"
    },
    services: [
      { serviceType: "photography", description: "Wedding photography package", price: 2000 },
      { serviceType: "photography", description: "Event photography", price: 1200 }
    ]
  },
  {
    businessName: "Harmony Music Events",
    description: "Live music and DJ services for weddings, parties, and corporate events. Creating the perfect atmosphere.",
    location: "Chicago",
    priceRange: { min: 400, max: 2500 },
    rating: 4.7,
    reviewCount: 32,
    contactInfo: {
      phone: "+1-555-0103",
      email: "bookings@harmonymusic.com",
      website: "www.harmonymusic.com"
    },
    services: [
      { serviceType: "music", description: "DJ services for parties", price: 800 },
      { serviceType: "music", description: "Live band performance", price: 1800 }
    ]
  },
  {
    businessName: "Glamour Beauty Studio",
    description: "Professional makeup and beauty services for weddings and special occasions. Making you look stunning.",
    location: "Miami",
    priceRange: { min: 200, max: 1200 },
    rating: 4.6,
    reviewCount: 28,
    contactInfo: {
      phone: "+1-555-0104",
      email: "appointments@glamourbeauty.com",
      website: "www.glamourbeauty.com"
    },
    services: [
      { serviceType: "makeup", description: "Bridal makeup package", price: 600 },
      { serviceType: "makeup", description: "Party makeup", price: 300 }
    ]
  },
  {
    businessName: "Elegant Decorations",
    description: "Stunning event decorations and floral arrangements. Transforming spaces into magical venues.",
    location: "San Francisco",
    priceRange: { min: 600, max: 4000 },
    rating: 4.5,
    reviewCount: 41,
    contactInfo: {
      phone: "+1-555-0105",
      email: "design@elegantdeco.com",
      website: "www.elegantdeco.com"
    },
    services: [
      { serviceType: "decoration", description: "Wedding decoration package", price: 2500 },
      { serviceType: "decoration", description: "Birthday party decorations", price: 1000 }
    ]
  },
  {
    businessName: "Gourmet Delights Catering",
    description: "Artisanal catering with farm-to-table ingredients. Perfect for intimate gatherings and large celebrations.",
    location: "Seattle",
    priceRange: { min: 400, max: 3500 },
    rating: 4.8,
    reviewCount: 53,
    contactInfo: {
      phone: "+1-555-0106",
      email: "orders@gourmetdelights.com",
      website: "www.gourmetdelights.com"
    },
    services: [
      { serviceType: "catering", description: "Corporate catering", price: 1200 },
      { serviceType: "catering", description: "Wedding catering", price: 2800 }
    ]
  },
  {
    businessName: "Moments Photography Studio",
    description: "Creative photography for all occasions. Specializing in candid moments and artistic compositions.",
    location: "Austin",
    priceRange: { min: 600, max: 2800 },
    rating: 4.7,
    reviewCount: 39,
    contactInfo: {
      phone: "+1-555-0107",
      email: "info@momentsstudio.com",
      website: "www.momentsstudio.com"
    },
    services: [
      { serviceType: "photography", description: "Corporate event photography", price: 1500 },
      { serviceType: "photography", description: "Birthday party photography", price: 900 }
    ]
  },
  {
    businessName: "Rhythm & Beats DJ Service",
    description: "High-energy DJ services and sound equipment rental. Keeping your party alive all night long.",
    location: "Las Vegas",
    priceRange: { min: 300, max: 2000 },
    rating: 4.4,
    reviewCount: 25,
    contactInfo: {
      phone: "+1-555-0108",
      email: "book@rhythmbeats.com",
      website: "www.rhythmbeats.com"
    },
    services: [
      { serviceType: "music", description: "Wedding DJ package", price: 1200 },
      { serviceType: "music", description: "Party DJ service", price: 600 }
    ]
  }
]

const seedVendors = async () => {
  try {
    console.log("Starting vendor seeding...")

    for (const vendorData of sampleVendors) {
      // Create a user account for each vendor
      const email = vendorData.contactInfo.email
      const password = "password123" // Default password for demo
      
      // Check if user already exists
      let user = await User.findOne({ email })
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10)
        user = new User({
          name: vendorData.businessName,
          email,
          password: hashedPassword,
          role: "vendor"
        })
        await user.save()
        console.log(`Created user: ${email}`)
      }

      // Check if vendor already exists
      let vendor = await Vendor.findOne({ userId: user._id })
      
      if (!vendor) {
        vendor = new Vendor({
          userId: user._id,
          businessName: vendorData.businessName,
          description: vendorData.description,
          location: vendorData.location,
          priceRange: vendorData.priceRange,
          rating: vendorData.rating,
          reviewCount: vendorData.reviewCount,
          contactInfo: vendorData.contactInfo
        })
        await vendor.save()
        console.log(`Created vendor: ${vendorData.businessName}`)
      }

      // Create services for this vendor
      for (const serviceData of vendorData.services) {
        const existingService = await Service.findOne({
          createdBy: user._id,
          serviceType: serviceData.serviceType,
          description: serviceData.description
        })

        if (!existingService) {
          const service = new Service({
            createdBy: user._id,
            serviceType: serviceData.serviceType,
            description: serviceData.description,
            price: serviceData.price,
            images: [`https://via.placeholder.com/400x300?text=${serviceData.serviceType}`] // Placeholder image
          })
          await service.save()
          console.log(`Created service: ${serviceData.serviceType} for ${vendorData.businessName}`)
        }
      }
    }

    console.log("Vendor seeding completed!")
    
    // Show final counts
    const totalUsers = await User.countDocuments({ role: "vendor" })
    const totalVendors = await Vendor.countDocuments()
    const totalServices = await Service.countDocuments()
    
    console.log(`Total vendor users: ${totalUsers}`)
    console.log(`Total vendor profiles: ${totalVendors}`)
    console.log(`Total services: ${totalServices}`)
    
  } catch (error) {
    console.error("Error seeding vendors:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seeding
connectDB().then(() => {
  seedVendors()
})