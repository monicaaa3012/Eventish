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
