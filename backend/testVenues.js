import fetch from 'node-fetch'

const testVenueEndpoint = async () => {
  try {
    console.log("Testing venue endpoint...")
    
    // Test venue filtering
    const response = await fetch('http://localhost:5000/api/vendors?service=venue&includeUnverified=true')
    console.log(`Venue endpoint status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      const venues = Array.isArray(data) ? data : data.vendors || []
      
      console.log(`\nFound ${venues.length} venues:`)
      venues.forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.businessName}`)
        console.log(`   Location: ${venue.location}`)
        console.log(`   Profile Image: ${venue.profileImage ? '✅ YES' : '❌ NO'}`)
        console.log(`   Portfolio: ${venue.portfolio?.length || 0} images`)
        console.log(`   Verified: ${venue.verified ? '✅ YES' : '❌ NO'}`)
        console.log('   ---')
      })
    } else {
      console.error("Failed to fetch venues")
    }
    
  } catch (error) {
    console.error("Test Error:", error.message)
  }
}

testVenueEndpoint()