import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: "Email already in use" })

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    })

    // No token returned here
    res.status(201).json({ message: "Registration successful, please log in." })
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "Invalid credentials" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.json({ 
      token, 
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: "User not found" })

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    })
  } catch (err) {
    res.status(500).json({ message: "Failed to get profile", error: err.message })
  }
}

export const addToWishlist = async (req, res) => {
  try {
    const { vendorId } = req.body
    const user = await User.findById(req.user.id)
    
    if (!user) return res.status(404).json({ message: "User not found" })

    if (user.wishlist.includes(vendorId)) {
      return res.status(400).json({ message: "Vendor already in wishlist" })
    }

    user.wishlist.push(vendorId)
    await user.save()

    res.json({ message: "Vendor added to wishlist", wishlist: user.wishlist })
  } catch (err) {
    res.status(500).json({ message: "Failed to add to wishlist", error: err.message })
  }
}

export const removeFromWishlist = async (req, res) => {
  try {
    const { vendorId } = req.params
    const user = await User.findById(req.user.id)
    
    if (!user) return res.status(404).json({ message: "User not found" })

    user.wishlist = user.wishlist.filter(id => id.toString() !== vendorId)
    await user.save()

    res.json({ message: "Vendor removed from wishlist", wishlist: user.wishlist })
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from wishlist", error: err.message })
  }
}

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'businessName services location description profileImage portfolio rating reviewCount userId',
      populate: {
        path: 'userId',
        select: 'name'
      }
    })
    
    if (!user) return res.status(404).json({ message: "User not found" })

    // For each vendor, if they don't have images, try to get images from their services
    const Service = (await import('../models/ServiceModel.js')).default
    
    const wishlistWithImages = await Promise.all(
      user.wishlist.map(async (vendor) => {
        const vendorObj = vendor.toObject()
        
        // Create an images array from profileImage and portfolio
        let images = []
        if (vendorObj.profileImage) {
          images.push(vendorObj.profileImage)
        }
        if (vendorObj.portfolio && vendorObj.portfolio.length > 0) {
          images = [...images, ...vendorObj.portfolio]
        }
        
        // If vendor still has no images, try to get from their services
        if (images.length === 0 && vendorObj.userId) {
          const services = await Service.find({ 
            createdBy: vendorObj.userId._id 
          }).select('images').limit(1)
          
          if (services.length > 0 && services[0].images && services[0].images.length > 0) {
            images = [services[0].images[0]]
          }
        }
        
        vendorObj.images = images
        // Use first service as category if available
        vendorObj.category = vendorObj.services && vendorObj.services.length > 0 ? vendorObj.services[0] : 'Service Provider'
        return vendorObj
      })
    )

    res.json({ wishlist: wishlistWithImages })
  } catch (err) {
    res.status(500).json({ message: "Failed to get wishlist", error: err.message })
  }
}

// Save push token
export const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body
    
    if (!pushToken) {
      return res.status(400).json({ message: "Push token is required" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    user.pushToken = pushToken
    await user.save()

    res.json({ message: "Push token saved successfully" })
  } catch (err) {
    res.status(500).json({ message: "Failed to save push token", error: err.message })
  }
}
