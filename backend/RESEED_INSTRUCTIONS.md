# Reseed Vendors with Images

The dummy vendors in the database don't have proper images. Here's how to fix it:

## Problem
- Seeded vendors have no `profileImage` or `portfolio` images
- Service images use placeholder URLs that don't load properly
- Browse-vendors and vendor-details screens show no images

## Solution
Updated seed data with:
- ✅ Real Unsplash images for all vendors
- ✅ Profile images for each vendor
- ✅ Portfolio images (2 per vendor)
- ✅ Service images with proper titles
- ✅ Auto-verification for seeded vendors
- ✅ Updated service types (dj, band, flowers, etc.)

## How to Reseed

### Option 1: Clear and Reseed (Recommended)
```bash
# 1. Clear existing seed data
node clearAndReseed.js

# 2. Create fresh seed data with images
node seedVendors.js
```

### Option 2: Just Add New Data
```bash
# This will add new vendors alongside existing ones
node seedVendors.js
```

## What You'll Get

**8 Professional Vendors with Images**:
1. **Elite Catering Co.** - Catering & Decoration
2. **Dreamscape Photography** - Wedding & Event Photography  
3. **Harmony Music Events** - DJ & Live Band
4. **Glamour Beauty Studio** - Makeup & Beauty
5. **Elegant Decorations** - Decoration & Flowers
6. **Gourmet Delights Catering** - Premium Catering
7. **Moments Photography Studio** - Creative Photography
8. **Rhythm & Beats DJ Service** - DJ & Sound

**Each Vendor Has**:
- Professional profile image
- 2 portfolio images
- 2 services with images
- Complete contact information
- Realistic ratings and reviews
- Auto-verified status

## Image Sources
All images are from Unsplash (free to use):
- High-quality professional photos
- Relevant to each service type
- Properly sized (400x400 for profiles, 400x300 for services)
- Fast loading and reliable

## After Reseeding
- Browse-vendors will show vendor images
- Vendor-details will show profile and portfolio images
- Service cards will have proper images
- Recommendations will work better with more diverse vendors