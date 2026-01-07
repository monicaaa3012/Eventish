import Booking from "../models/BookingModel.js"
import Service from "../models/ServiceModel.js"
import Vendor from "../models/Vendor.js"

// Get vendor analytics data
export const getVendorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id
    console.log("Analytics request for user:", userId)

    // Find vendor profile
    let vendor = await Vendor.findOne({ userId })
    if (!vendor) {
      console.log("Vendor profile not found for user:", userId, "- Creating default profile")
      
      // Create a basic vendor profile if it doesn't exist
      vendor = new Vendor({
        userId: userId,
        businessName: "My Business",
        description: "Welcome to my business",
        location: "Nepal",
        contactInfo: {
          phone: "",
          email: req.user.email || ""
        },
        services: [],
        priceRange: {
          min: 0,
          max: 0
        },
        portfolio: [],
        verified: false,
        featured: false,
        rating: 0,
        reviewCount: 0,
        reviews: []
      })
      
      try {
        await vendor.save()
        console.log("Created new vendor profile for user:", userId)
      } catch (saveError) {
        console.error("Error creating vendor profile:", saveError)
        return res.status(500).json({ message: "Error creating vendor profile", error: saveError.message })
      }
    }

    console.log("Found/Created vendor:", vendor._id)
    const vendorId = vendor._id

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // 1. Booking Analytics
    const bookingStats = await Booking.aggregate([
      {
        $match: { vendorId: vendorId }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] }
          },
          rejectedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] }
          },
          acceptedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
          },
          scheduledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Scheduled"] }, 1, 0] }
          },
          bookedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] }
          },
          inProgressBookings: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          }
        }
      }
    ])

    console.log("Booking stats result:", bookingStats)

    // 2. Revenue Analytics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          paymentStatus: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$servicePrice" },
          thisMonthRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", startOfMonth] },
                "$servicePrice",
                0
              ]
            }
          },
          lastMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfLastMonth] },
                    { $lte: ["$createdAt", endOfLastMonth] }
                  ]
                },
                "$servicePrice",
                0
              ]
            }
          },
          completedBookingsCount: { $sum: 1 }
        }
      }
    ])

    // Calculate derived metrics
    const bookings = bookingStats[0] || {}
    const revenue = revenueData[0] || {}
    
    const totalBookings = bookings.totalBookings || 0
    const totalRevenue = revenue.totalRevenue || 0
    const completedBookingsForRevenue = revenue.completedBookingsCount || 0
    
    // Average earning per booking (only from completed bookings with payment)
    const averageEarningPerBooking = completedBookingsForRevenue > 0 
      ? totalRevenue / completedBookingsForRevenue 
      : 0

    // Monthly revenue growth
    const monthlyRevenueGrowth = revenue.lastMonthRevenue > 0 
      ? ((revenue.thisMonthRevenue - revenue.lastMonthRevenue) / revenue.lastMonthRevenue * 100)
      : 0

    // Calculate active bookings to match VendorDashboard logic
    // Active bookings = Total - (Completed + Cancelled + Rejected)
    const activeBookings = totalBookings - (bookings.completedBookings || 0) - (bookings.cancelledBookings || 0) - (bookings.rejectedBookings || 0)

    // Compile analytics response
    const analytics = {
      // Basic booking metrics
      totalBookings: totalBookings,
      activeBookings: activeBookings,
      completedBookings: bookings.completedBookings || 0,
      cancelledBookings: bookings.cancelledBookings || 0,
      pendingBookings: bookings.pendingBookings || 0,
      rejectedBookings: bookings.rejectedBookings || 0,
      acceptedBookings: bookings.acceptedBookings || 0,
      scheduledBookings: bookings.scheduledBookings || 0,
      bookedBookings: bookings.bookedBookings || 0,
      inProgressBookings: bookings.inProgressBookings || 0,

      // Revenue metrics
      totalRevenue: totalRevenue,
      monthlyRevenue: revenue.thisMonthRevenue || 0,
      lastMonthRevenue: revenue.lastMonthRevenue || 0,
      monthlyRevenueGrowth: monthlyRevenueGrowth,
      averageEarningPerBooking: averageEarningPerBooking,

      // Review metrics
      averageRating: vendor.rating || 0,
      totalReviews: vendor.reviewCount || 0
    }

    console.log("Final analytics data:", analytics)
    res.json(analytics)
  } catch (error) {
    console.error("Error fetching vendor analytics:", error)
    res.status(500).json({ message: "Error fetching analytics", error: error.message })
  }
}

// Get analytics for a specific date range
export const getAnalyticsByDateRange = async (req, res) => {
  try {
    const userId = req.user.id
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" })
    }

    const vendor = await Vendor.findOne({ userId })
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const analytics = await Booking.aggregate([
      {
        $match: {
          vendorId: vendor._id,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$servicePrice" },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] }
          }
        }
      }
    ])

    res.json(analytics[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      completedBookings: 0,
      cancelledBookings: 0
    })
  } catch (error) {
    console.error("Error fetching date range analytics:", error)
    res.status(500).json({ message: "Error fetching analytics", error: error.message })
  }
}