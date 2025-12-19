import Event from "../models/Event.js"
import Vendor from "../models/Vendor.js"
import Service from "../models/ServiceModel.js"

// Jaccard Similarity Algorithm
const jaccardSimilarity = (setA, setB) => {
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// Extract service types from user's events
const extractUserPreferences = (events) => {
  const preferences = new Set()
  
  events.forEach(event => {
    // Add event type
    if (event.eventType) {
      preferences.add(event.eventType.toLowerCase())
    }
    
    // Add location
    if (event.location) {
      preferences.add(event.location.toLowerCase())
    }
    
    // Add keywords from title and description
    if (event.title) {
      event.title.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) preferences.add(word)
      })
    }
    
    if (event.description) {
      event.description.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) preferences.add(word)
      })
    }
  })
  
  return preferences
}

// Extract vendor features
const extractVendorFeatures = (vendor, services) => {
  const features = new Set()
  
  // Add business name keywords
  if (vendor.businessName) {
    vendor.businessName.toLowerCase().split(' ').forEach(word => {
      if (word.length > 3) features.add(word)
    })
  }
  
  // Add location
  if (vendor.location) {
    features.add(vendor.location.toLowerCase())
  }
  
  // Add description keywords
  if (vendor.description) {
    vendor.description.toLowerCase().split(' ').forEach(word => {
      if (word.length > 3) features.add(word)
    })
  }
  
  // Add service types
  services.forEach(service => {
    if (service.serviceType) {
      features.add(service.serviceType.toLowerCase())
    }
    
    // Add service description keywords
    if (service.description) {
      service.description.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) features.add(word)
      })
    }
  })
  
  return features
}

export const getJaccardRecommendations = async (req, res) => {
  try {
    const userId = req.user.id
    const { eventIds } = req.body

    // 1. Get user's selected events or all events if none specified
    let userEvents
    if (eventIds && eventIds.length > 0) {
      userEvents = await Event.find({ 
        _id: { $in: eventIds }, 
        createdBy: userId 
      }).sort({ createdAt: -1 })
    } else {
      userEvents = await Event.find({ createdBy: userId }).sort({ createdAt: -1 })
    }

    if (userEvents.length === 0) {
      return res.json({ 
        recommendations: [],
        message: "Create some events first to get personalized recommendations"
      })
    }

    // 2. Enhanced preference extraction with weights
    const userPreferences = extractEnhancedUserPreferences(userEvents)
    
    // 3. Get all vendors with their services
    const vendors = await Vendor.find()
    const vendorRecommendations = []
    const similarityScores = {}
    const analysisDetails = {
      eventsAnalyzed: userEvents.length,
      selectedEventTitles: userEvents.map(e => e.title),
      extractedPreferences: Array.from(userPreferences.features),
      preferenceWeights: userPreferences.weights,
      totalVendorsAnalyzed: vendors.length
    }

    // 4. Calculate enhanced similarity for each vendor
    for (const vendor of vendors) {
      // Get vendor's services
      const vendorServices = await Service.find({ createdBy: vendor.userId })
      
      if (vendorServices.length === 0) continue // Skip vendors with no services
      
      // Extract vendor features with categories
      const vendorFeatures = extractEnhancedVendorFeatures(vendor, vendorServices)
      
      // Calculate weighted Jaccard similarity
      const similarity = calculateWeightedJaccardSimilarity(userPreferences, vendorFeatures)
      
      // Only include vendors with meaningful similarity (> 0.1)
      if (similarity > 0.1) {
        vendorRecommendations.push({
          ...vendor.toObject(),
          similarity,
          services: vendorServices.map(s => s.serviceType),
          serviceCount: vendorServices.length,
          priceRange: vendorServices.length > 0 ? {
            min: Math.min(...vendorServices.map(s => s.price)),
            max: Math.max(...vendorServices.map(s => s.price))
          } : { min: 0, max: 0 },
          matchingFeatures: getMatchingFeatures(userPreferences.features, vendorFeatures.features)
        })
        
        similarityScores[vendor._id] = similarity
      }
    }

    // 5. Sort by similarity score (highest first)
    vendorRecommendations.sort((a, b) => b.similarity - a.similarity)

    // 6. Return enhanced recommendations
    res.json({
      recommendations: vendorRecommendations.slice(0, 12),
      similarityScores,
      analysisDetails,
      message: `Found ${vendorRecommendations.length} matching vendors based on ${userEvents.length} selected events`
    })

  } catch (error) {
    console.error("Jaccard Recommendation Error:", error)
    res.status(500).json({ message: "Server error in recommendations", error: error.message })
  }
}

// Enhanced preference extraction with weights and categories
const extractEnhancedUserPreferences = (events) => {
  const features = new Set()
  const weights = {}
  const categories = {
    eventTypes: new Set(),
    locations: new Set(),
    requirements: new Set(),
    keywords: new Set()
  }
  
  events.forEach(event => {
    // Event types (high weight)
    if (event.eventType) {
      const eventType = event.eventType.toLowerCase()
      features.add(`type:${eventType}`)
      categories.eventTypes.add(eventType)
      weights[`type:${eventType}`] = (weights[`type:${eventType}`] || 0) + 3
    }
    
    // Locations (medium weight)
    if (event.location) {
      const location = event.location.toLowerCase()
      features.add(`location:${location}`)
      categories.locations.add(location)
      weights[`location:${location}`] = (weights[`location:${location}`] || 0) + 2
    }
    
    // Requirements (high weight)
    if (event.requirements && Array.isArray(event.requirements)) {
      event.requirements.forEach(req => {
        const requirement = req.toLowerCase()
        features.add(`requirement:${requirement}`)
        categories.requirements.add(requirement)
        weights[`requirement:${requirement}`] = (weights[`requirement:${requirement}`] || 0) + 3
      })
    }
    
    // Keywords from title and description (low weight)
    const text = `${event.title || ''} ${event.description || ''}`.toLowerCase()
    const words = text.split(/\s+/).filter(word => word.length > 3)
    words.forEach(word => {
      features.add(`keyword:${word}`)
      categories.keywords.add(word)
      weights[`keyword:${word}`] = (weights[`keyword:${word}`] || 0) + 1
    })
  })
  
  return { features, weights, categories }
}

// Enhanced vendor feature extraction
const extractEnhancedVendorFeatures = (vendor, services) => {
  const features = new Set()
  const categories = {
    serviceTypes: new Set(),
    locations: new Set(),
    keywords: new Set()
  }
  
  // Service types (high importance)
  services.forEach(service => {
    if (service.serviceType) {
      const serviceType = service.serviceType.toLowerCase()
      features.add(`type:${serviceType}`)
      features.add(`service:${serviceType}`)
      categories.serviceTypes.add(serviceType)
    }
    
    // Service description keywords
    if (service.description) {
      const words = service.description.toLowerCase().split(/\s+/).filter(word => word.length > 3)
      words.forEach(word => {
        features.add(`keyword:${word}`)
        categories.keywords.add(word)
      })
    }
  })
  
  // Vendor location
  if (vendor.location) {
    const location = vendor.location.toLowerCase()
    features.add(`location:${location}`)
    categories.locations.add(location)
  }
  
  // Vendor description keywords
  if (vendor.description) {
    const words = vendor.description.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    words.forEach(word => {
      features.add(`keyword:${word}`)
      categories.keywords.add(word)
    })
  }
  
  // Business name keywords
  if (vendor.businessName) {
    const words = vendor.businessName.toLowerCase().split(/\s+/).filter(word => word.length > 3)
    words.forEach(word => {
      features.add(`keyword:${word}`)
      categories.keywords.add(word)
    })
  }
  
  return { features, categories }
}

// Weighted Jaccard similarity calculation
const calculateWeightedJaccardSimilarity = (userPrefs, vendorFeatures) => {
  const intersection = new Set([...userPrefs.features].filter(x => vendorFeatures.features.has(x)))
  const union = new Set([...userPrefs.features, ...vendorFeatures.features])
  
  if (union.size === 0) return 0
  
  // Calculate weighted intersection
  let weightedIntersection = 0
  let totalWeight = 0
  
  intersection.forEach(feature => {
    const weight = userPrefs.weights[feature] || 1
    weightedIntersection += weight
  })
  
  userPrefs.features.forEach(feature => {
    totalWeight += userPrefs.weights[feature] || 1
  })
  
  // Weighted Jaccard = weighted intersection / (total user weight + vendor features - weighted intersection)
  const weightedJaccard = weightedIntersection / (totalWeight + vendorFeatures.features.size - weightedIntersection)
  
  return Math.min(weightedJaccard, 1) // Cap at 1
}

// Get matching features for explanation
const getMatchingFeatures = (userFeatures, vendorFeatures) => {
  return [...userFeatures].filter(feature => vendorFeatures.has(feature))
}

// Legacy endpoint for backward compatibility
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id

    // Get user's latest event
    const latestEvent = await Event.findOne({ createdBy: userId }).sort({ createdAt: -1 })

    if (!latestEvent) {
      return res.json({ recommendations: [] })
    }

    // Build event feature set
    const eventSet = new Set([
      latestEvent.location?.toLowerCase(),
      latestEvent.title?.toLowerCase(),
      ...(latestEvent.requirements || []).map(r => r.toLowerCase()),
    ])

    // Get all vendors
    const vendors = await Vendor.find()

    // Compute similarity
    const results = vendors.map(vendor => {
      const vendorSet = new Set([
        vendor.location?.toLowerCase(),
        vendor.category?.toLowerCase(),
        vendor.businessName?.toLowerCase(),
        ...(vendor.services || []).map(s => s.toLowerCase()),
      ])

      const similarity = jaccardSimilarity(eventSet, vendorSet)

      return { vendor, similarity }
    })

    // Sort vendors by similarity score
    results.sort((a, b) => b.similarity - a.similarity)

    // Send best 5 vendors
    res.json({
      event: latestEvent,
      recommendations: results.slice(0, 5),
    })

  } catch (error) {
    console.error("Recommendation Error:", error)
    res.status(500).json({ message: "Server error in recommendations" })
  }
}
