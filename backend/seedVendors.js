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
    profileImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0101",
      email: "info@elitecatering.com",
      website: "www.elitecatering.com"
    },
    services: [
      { 
        serviceType: "catering", 
        title: "Wedding Catering Package",
        description: "Full-service catering for all events", 
        price: 1500,
        images: ["https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "decoration", 
        title: "Table Setup & Decoration",
        description: "Table setup and decoration", 
        price: 800,
        images: ["https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Dreamscape Photography",
    description: "Professional wedding and event photography. Capturing your special moments with artistic flair.",
    location: "Los Angeles",
    priceRange: { min: 800, max: 3000 },
    rating: 4.9,
    reviewCount: 67,
    profileImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0102",
      email: "hello@dreamscapephoto.com",
      website: "www.dreamscapephoto.com"
    },
    services: [
      { 
        serviceType: "photography", 
        title: "Wedding Photography Package",
        description: "Wedding photography package", 
        price: 2000,
        images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "photography", 
        title: "Event Photography",
        description: "Event photography", 
        price: 1200,
        images: ["https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Harmony Music Events",
    description: "Live music and DJ services for weddings, parties, and corporate events. Creating the perfect atmosphere.",
    location: "Chicago",
    priceRange: { min: 400, max: 2500 },
    rating: 4.7,
    reviewCount: 32,
    profileImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0103",
      email: "bookings@harmonymusic.com",
      website: "www.harmonymusic.com"
    },
    services: [
      { 
        serviceType: "dj", 
        title: "DJ Services for Parties",
        description: "DJ services for parties", 
        price: 800,
        images: ["https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "band", 
        title: "Live Band Performance",
        description: "Live band performance", 
        price: 1800,
        images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Glamour Beauty Studio",
    description: "Professional makeup and beauty services for weddings and special occasions. Making you look stunning.",
    location: "Miami",
    priceRange: { min: 200, max: 1200 },
    rating: 4.6,
    reviewCount: 28,
    profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0104",
      email: "appointments@glamourbeauty.com",
      website: "www.glamourbeauty.com"
    },
    services: [
      { 
        serviceType: "makeup", 
        title: "Bridal Makeup Package",
        description: "Bridal makeup package", 
        price: 600,
        images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "makeup", 
        title: "Party Makeup",
        description: "Party makeup", 
        price: 300,
        images: ["https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Elegant Decorations",
    description: "Stunning event decorations and floral arrangements. Transforming spaces into magical venues.",
    location: "San Francisco",
    priceRange: { min: 600, max: 4000 },
    rating: 4.5,
    reviewCount: 41,
    profileImage: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0105",
      email: "design@elegantdeco.com",
      website: "www.elegantdeco.com"
    },
    services: [
      { 
        serviceType: "decoration", 
        title: "Wedding Decoration Package",
        description: "Wedding decoration package", 
        price: 2500,
        images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "flowers", 
        title: "Birthday Party Decorations",
        description: "Birthday party decorations", 
        price: 1000,
        images: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Gourmet Delights Catering",
    description: "Artisanal catering with farm-to-table ingredients. Perfect for intimate gatherings and large celebrations.",
    location: "Seattle",
    priceRange: { min: 400, max: 3500 },
    rating: 4.8,
    reviewCount: 53,
    profileImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0106",
      email: "orders@gourmetdelights.com",
      website: "www.gourmetdelights.com"
    },
    services: [
      { 
        serviceType: "catering", 
        title: "Corporate Catering",
        description: "Corporate catering", 
        price: 1200,
        images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "catering", 
        title: "Wedding Catering",
        description: "Wedding catering", 
        price: 2800,
        images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Moments Photography Studio",
    description: "Creative photography for all occasions. Specializing in candid moments and artistic compositions.",
    location: "Austin",
    priceRange: { min: 600, max: 2800 },
    rating: 4.7,
    reviewCount: 39,
    profileImage: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0107",
      email: "info@momentsstudio.com",
      website: "www.momentsstudio.com"
    },
    services: [
      { 
        serviceType: "photography", 
        title: "Corporate Event Photography",
        description: "Corporate event photography", 
        price: 1500,
        images: ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "photography", 
        title: "Birthday Party Photography",
        description: "Birthday party photography", 
        price: 900,
        images: ["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"]
      }
    ]
  },
  {
    businessName: "Rhythm & Beats DJ Service",
    description: "High-energy DJ services and sound equipment rental. Keeping your party alive all night long.",
    location: "Las Vegas",
    priceRange: { min: 300, max: 2000 },
    rating: 4.4,
    reviewCount: 25,
    profileImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    portfolio: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    ],
    contactInfo: {
      phone: "+1-555-0108",
      email: "book@rhythmbeats.com",
      website: "www.rhythmbeats.com"
    },
    services: [
      { 
        serviceType: "dj", 
        title: "Wedding DJ Package",
        description: "Wedding DJ package", 
        price: 1200,
        images: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop"]
      },
      { 
        serviceType: "dj", 
        title: "Party DJ Service",
        description: "Party DJ service", 
        price: 600,
        images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"]
      }
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
          contactInfo: vendorData.contactInfo,
          profileImage: vendorData.profileImage,
          portfolio: vendorData.portfolio,
          verified: true // Auto-verify seeded vendors
        })
        await vendor.save()
        console.log(`Created vendor: ${vendorData.businessName}`)
      }

      // Create services for this vendor
      for (const serviceData of vendorData.services) {
        const existingService = await Service.findOne({
          createdBy: user._id,
          serviceType: serviceData.serviceType,
          title: serviceData.title
        })

        if (!existingService) {
          const service = new Service({
            createdBy: user._id,
            title: serviceData.title,
            serviceType: serviceData.serviceType,
            description: serviceData.description,
            price: serviceData.price,
            images: serviceData.images
          })
          await service.save()
          console.log(`Created service: ${serviceData.title} for ${vendorData.businessName}`)
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