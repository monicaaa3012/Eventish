import Booking from "../models/BookingModel.js"
import Service from "../models/ServiceModel.js"
import Vendor from "../models/Vendor.js"
import User from "../models/User.js"

// Get vendor analytics data
export const getVendorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id
    console.log("📊 Analytics request for user:", userId)

    // Find vendor profile
    let vendor = await Vendor.findOne({ userId })
    if (!vendor) {
      console.log("⚠️ Vendor profile not found for user:", userId, "- Creating default profile")
      
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
        console.log("✅ Created new vendor profile for user:", userId)
      } catch (saveError) {
        console.error("❌ Error creating vendor profile:", saveError)
        return res.status(500).json({ message: "Error creating vendor profile", error: saveError.message })
      }
    }

    console.log("✅ Found/Created vendor:", vendor._id)
    const vendorId = vendor._id

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

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

    console.log("📈 Booking stats:", bookingStats[0])

    // 2. Revenue Analytics with Payment Details
    const revenueData = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          servicePrice: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          // Total revenue from all bookings with prices
          totalPotentialRevenue: { $sum: "$servicePrice" },
          
          // Completed payments
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$servicePrice",
                0
              ]
            }
          },
          
          // Pending payments
          pendingRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "pending"] },
                "$servicePrice",
                0
              ]
            }
          },
          
          // This month revenue
          thisMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfMonth] },
                    { $eq: ["$paymentStatus", "completed"] }
                  ]
                },
                "$servicePrice",
                0
              ]
            }
          },
          
          // Last month revenue
          lastMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfLastMonth] },
                    { $lte: ["$createdAt", endOfLastMonth] },
                    { $eq: ["$paymentStatus", "completed"] }
                  ]
                },
                "$servicePrice",
                0
              ]
            }
          },
          
          // Year to date revenue
          yearToDateRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYear] },
                    { $eq: ["$paymentStatus", "completed"] }
                  ]
                },
                "$servicePrice",
                0
              ]
            }
          },
          
          completedBookingsCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] }
          },
          
          pendingPaymentsCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] }
          }
        }
      }
    ])

    // 3. Payment Method Analytics
    const paymentMethodStats = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          paymentMethod: { $exists: true, $ne: null },
          paymentStatus: "completed"
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$servicePrice" }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ])

    // 4. Advance Payment Analytics
    const advancePaymentStats = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          advancePayment: { $exists: true, $ne: null, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalAdvancePayments: { $sum: "$advancePayment" },
          advancePaymentsCount: { $sum: 1 },
          averageAdvancePayment: { $avg: "$advancePayment" },
          completedAdvancePayments: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$advancePayment",
                0
              ]
            }
          },
          pendingAdvancePayments: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "pending"] },
                "$advancePayment",
                0
              ]
            }
          }
        }
      }
    ])

    // 5. Service Performance Analytics
    const servicePerformance = await Booking.aggregate([
      {
        $match: { vendorId: vendorId }
      },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service"
        }
      },
      {
        $unwind: { path: "$service", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: {
            serviceId: "$serviceId",
            serviceType: "$service.serviceType",
            description: "$service.description"
          },
          bookingCount: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$servicePrice",
                0
              ]
            }
          },
          potentialRevenue: { $sum: "$servicePrice" },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          averagePrice: { $avg: "$servicePrice" },
          advancePaymentsReceived: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ["$advancePayment", null] },
                  { $eq: ["$paymentStatus", "completed"] }
                ]},
                "$advancePayment",
                0
              ]
            }
          }
        }
      },
      {
        $sort: { bookingCount: -1 }
      }
    ])

    // 6. Monthly Trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const monthlyTrend = await Booking.aggregate([
      {
        $match: {
          vendorId: vendorId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          bookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$servicePrice",
                0
              ]
            }
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ])

    // Calculate derived metrics
    const bookings = bookingStats[0] || {}
    const revenue = revenueData[0] || {}
    const advancePayments = advancePaymentStats[0] || {}
    
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

    // Find top performing service and calculate performance scores
    const topPerformingService = servicePerformance[0] || null
    const servicesWithScores = servicePerformance.map((service, index) => {
      // Calculate performance score based on bookings, revenue, and completion rate
      const completionRate = service.bookingCount > 0 ? (service.completedBookings / service.bookingCount) * 100 : 0
      const revenueWeight = 0.4
      const bookingWeight = 0.4
      const completionWeight = 0.2
      
      // Normalize scores (using max values from the dataset)
      const maxBookings = servicePerformance[0]?.bookingCount || 1
      const maxRevenue = Math.max(...servicePerformance.map(s => s.revenue || 0)) || 1
      
      const normalizedBookings = (service.bookingCount / maxBookings) * 100
      const normalizedRevenue = ((service.revenue || 0) / maxRevenue) * 100
      
      const performanceScore = (
        (normalizedBookings * bookingWeight) +
        (normalizedRevenue * revenueWeight) +
        (completionRate * completionWeight)
      ).toFixed(1)

      return {
        ...service,
        completionRate: completionRate.toFixed(1),
        performanceScore: parseFloat(performanceScore),
        rank: index + 1
      }
    })

    // Calculate active bookings
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
      totalPotentialRevenue: revenue.totalPotentialRevenue || 0,
      pendingRevenue: revenue.pendingRevenue || 0,
      monthlyRevenue: revenue.thisMonthRevenue || 0,
      lastMonthRevenue: revenue.lastMonthRevenue || 0,
      yearToDateRevenue: revenue.yearToDateRevenue || 0,
      monthlyRevenueGrowth: monthlyRevenueGrowth,
      averageEarningPerBooking: averageEarningPerBooking,
      pendingPaymentsCount: revenue.pendingPaymentsCount || 0,

      // Advance payment metrics
      totalAdvancePayments: advancePayments.totalAdvancePayments || 0,
      advancePaymentsCount: advancePayments.advancePaymentsCount || 0,
      averageAdvancePayment: advancePayments.averageAdvancePayment || 0,
      completedAdvancePayments: advancePayments.completedAdvancePayments || 0,
      pendingAdvancePayments: advancePayments.pendingAdvancePayments || 0,

      // Payment method breakdown
      paymentMethods: paymentMethodStats.map(pm => ({
        method: pm._id || 'Unknown',
        count: pm.count,
        totalAmount: pm.totalAmount || 0,
        percentage: completedBookingsForRevenue > 0 
          ? ((pm.count / completedBookingsForRevenue) * 100).toFixed(1)
          : 0
      })),

      // Review metrics
      averageRating: vendor.rating || 0,
      totalReviews: vendor.reviewCount || 0,

      // Service performance metrics
      topPerformingService: topPerformingService ? {
        name: topPerformingService._id.serviceType || topPerformingService._id.description || 'Unknown Service',
        bookingCount: topPerformingService.bookingCount,
        revenue: topPerformingService.revenue || 0,
        potentialRevenue: topPerformingService.potentialRevenue || 0,
        completionRate: servicesWithScores[0]?.completionRate || 0,
        performanceScore: servicesWithScores[0]?.performanceScore || 0,
        advancePaymentsReceived: topPerformingService.advancePaymentsReceived || 0
      } : null,
      
      servicePerformance: servicesWithScores.map(service => ({
        serviceName: service._id.serviceType || service._id.description || 'Unknown Service',
        serviceType: service._id.serviceType,
        bookingCount: service.bookingCount,
        revenue: service.revenue || 0,
        potentialRevenue: service.potentialRevenue || 0,
        completedBookings: service.completedBookings,
        completionRate: service.completionRate,
        performanceScore: service.performanceScore,
        rank: service.rank,
        averagePrice: service.averagePrice || 0,
        advancePaymentsReceived: service.advancePaymentsReceived || 0
      })),

      // Monthly trend
      monthlyTrend: monthlyTrend.map(month => ({
        month: `${month._id.year}-${String(month._id.month).padStart(2, '0')}`,
        bookings: month.bookings,
        revenue: month.revenue
      })),

      totalServices: servicePerformance.length
    }

    console.log("✅ Analytics compiled successfully")
    res.json(analytics)
  } catch (error) {
    console.error("❌ Error fetching vendor analytics:", error)
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

// Get platform-wide analytics (Admin only)
export const getPlatformAnalytics = async (req, res) => {
  try {
    console.log("📊 Platform analytics request from admin")

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // 1. User Statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ])

    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0)
    const usersByRole = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count
      return acc
    }, {})

    // 2. Vendor Statistics
    const vendorStats = await Vendor.aggregate([
      {
        $group: {
          _id: null,
          totalVendors: { $sum: 1 },
          verifiedVendors: {
            $sum: { $cond: ["$verified", 1, 0] }
          },
          featuredVendors: {
            $sum: { $cond: ["$featured", 1, 0] }
          }
        }
      }
    ])

    // 3. Service Statistics
    const serviceCount = await Service.countDocuments()

    // 4. Booking Statistics
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          activeBookings: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", ["Pending", "Accepted", "Scheduled", "Booked", "In Progress"]]
                },
                1,
                0
              ]
            }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] }
          }
        }
      }
    ])

    // 5. Revenue Statistics
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          servicePrice: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$servicePrice",
                0
              ]
            }
          },
          pendingRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "pending"] },
                "$servicePrice",
                0
              ]
            }
          },
          monthlyRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfMonth] },
                    { $eq: ["$paymentStatus", "completed"] }
                  ]
                },
                "$servicePrice",
                0
              ]
            }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] }
          }
        }
      }
    ])

    // 6. Payment Method Statistics
    const paymentMethodStats = await Booking.aggregate([
      {
        $match: {
          paymentMethod: { $exists: true, $ne: null },
          paymentStatus: "completed"
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$servicePrice" }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ])

    const totalPayments = paymentMethodStats.reduce((sum, pm) => sum + pm.count, 0)

    // Compile platform analytics
    const analytics = {
      // User metrics
      totalUsers,
      usersByRole,
      
      // Vendor metrics
      totalVendors: vendorStats[0]?.totalVendors || 0,
      verifiedVendors: vendorStats[0]?.verifiedVendors || 0,
      featuredVendors: vendorStats[0]?.featuredVendors || 0,
      pendingVendors: (vendorStats[0]?.totalVendors || 0) - (vendorStats[0]?.verifiedVendors || 0),
      
      // Service metrics
      totalServices: serviceCount,
      
      // Booking metrics
      totalBookings: bookingStats[0]?.totalBookings || 0,
      activeBookings: bookingStats[0]?.activeBookings || 0,
      completedBookings: bookingStats[0]?.completedBookings || 0,
      cancelledBookings: bookingStats[0]?.cancelledBookings || 0,
      
      // Revenue metrics
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      pendingRevenue: revenueStats[0]?.pendingRevenue || 0,
      monthlyRevenue: revenueStats[0]?.monthlyRevenue || 0,
      pendingPayments: revenueStats[0]?.pendingPayments || 0,
      
      // Payment methods
      paymentMethods: paymentMethodStats.map(pm => ({
        method: pm._id || 'Unknown',
        count: pm.count,
        totalAmount: pm.totalAmount || 0,
        percentage: totalPayments > 0 ? ((pm.count / totalPayments) * 100).toFixed(1) : 0
      }))
    }

    console.log("✅ Platform analytics compiled successfully")
    res.json(analytics)
  } catch (error) {
    console.error("❌ Error fetching platform analytics:", error)
    res.status(500).json({ message: "Error fetching platform analytics", error: error.message })
  }
}