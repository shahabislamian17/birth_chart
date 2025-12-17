# API Guide for Birth Chart Tool

This guide explains what APIs you need and where to get them for calculating actual birth chart data.

## Required APIs

### 1. **Astrology Calculation API**

To calculate actual birth chart positions, you need an astrology ephemeris API. Here are the main options:

#### Option A: Swiss Ephemeris (Recommended - Most Accurate)
- **What it does**: Calculates planetary positions, houses, aspects, and all astrological data
- **Where to get it**: 
  - **JavaScript Library**: [swisseph](https://www.astro.com/swisseph/swephinfo_e.htm)
  - **NPM Package**: `swisseph` or `swisseph-js`
  - **API Services**: 
    - [AstroAPI](https://www.astroapi.com/) - Paid service
    - [AstroAPI.io](https://astroapi.io/) - Free tier available
- **Cost**: Free (if using library directly) or paid (if using API service)
- **Setup**: Install via npm: `npm install swisseph`

#### Option B: AstroAPI.io (Easiest to Start)
- **Website**: https://astroapi.io/
- **What it provides**: 
  - Birth chart calculations
  - Planetary positions
  - House cusps
  - Aspects
  - Transits
- **Pricing**: Free tier available (limited requests), paid plans for production
- **API Endpoint Example**:
  ```
  POST https://api.astroapi.io/v1/chart
  {
    "datetime": "1990-01-15T12:00:00",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "house_system": "placidus"
  }
  ```

#### Option C: AstroAPI.com
- **Website**: https://www.astroapi.com/
- **What it provides**: Comprehensive astrology API
- **Pricing**: Paid service, various plans
- **Features**: Charts, transits, synastry, composite charts

#### Option D: Self-Hosted Solution (Advanced)
- **Library**: Swiss Ephemeris C library with Node.js bindings
- **NPM Packages**:
  - `swisseph` - Swiss Ephemeris for Node.js
  - `node-swisseph` - Alternative wrapper
- **Setup**: More complex, requires compiling C code
- **Cost**: Free (open source)

### 2. **Geocoding API** (Already Implemented)

You're already using **Google Maps Places API** for location autocomplete. This is perfect for:
- Converting city names to coordinates (latitude/longitude)
- Required for accurate birth chart calculations

**Current Setup**:
- API: Google Maps Places API
- Get API Key: https://console.cloud.google.com/
- Enable: "Places API" and "Maps JavaScript API"

### 3. **Time Zone API** (Optional but Recommended)

To handle birth times accurately across different time zones:

#### Option A: Google Time Zone API
- **Website**: https://developers.google.com/maps/documentation/timezone
- **Cost**: Included with Google Maps API (same API key)
- **Endpoint**: `https://maps.googleapis.com/maps/api/timezone/json`

#### Option B: TimeZoneDB API
- **Website**: https://timezonedb.com/api
- **Pricing**: Free tier available
- **Endpoint**: `http://api.timezonedb.com/v2.1/get-time-zone`

## Implementation Steps

### Step 1: Choose Your Astrology API

**For Quick Start (Recommended)**:
1. Sign up at [AstroAPI.io](https://astroapi.io/)
2. Get your API key
3. Use their REST API

**For Production (More Control)**:
1. Use Swiss Ephemeris library (`swisseph` npm package)
2. Build your own calculation service
3. More complex but free and unlimited

### Step 2: Update Your Form Submission

Replace the sample data in `app/chart-tool/result.tsx` with actual API calls:

```typescript
// Example with AstroAPI.io
const calculateChart = async (formData: FormData) => {
  // First, get coordinates from location
  const coords = await getCoordinates(formData.location)
  
  // Then calculate chart
  const response = await fetch('https://api.astroapi.io/v1/chart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ASTRO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      datetime: `${formData.year}-${formData.month}-${formData.date}T${formData.hour}:${formData.minute}:00`,
      latitude: coords.lat,
      longitude: coords.lng,
      house_system: 'placidus'
    })
  })
  
  return await response.json()
}
```

### Step 3: Environment Variables

Add to your `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_ASTRO_API_KEY=your_astro_api_key  # If using AstroAPI.io
```

### Step 4: Backend API Route (Recommended)

Create a Next.js API route to keep your API keys secure:

```typescript
// app/api/calculate-chart/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.json()
  
  // Call astrology API from server (keeps API key secure)
  const chartData = await calculateChart(formData)
  
  return NextResponse.json(chartData)
}
```

## Recommended Setup for Production

1. **Astrology Calculations**: Swiss Ephemeris library (self-hosted) or AstroAPI.io
2. **Location/Geocoding**: Google Maps Places API (already set up)
3. **Time Zone**: Google Time Zone API (same API key as Maps)

## Free Options Summary

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| AstroAPI.io | Yes | Limited requests/month |
| Swiss Ephemeris | Yes | Self-hosted, unlimited |
| Google Maps API | Yes | $200 credit/month |
| TimeZoneDB | Yes | Limited requests/day |

## Next Steps

1. **Choose an API** based on your needs (start with AstroAPI.io for simplicity)
2. **Create API route** in `app/api/calculate-chart/route.ts`
3. **Update result.tsx** to fetch real data instead of using sample data
4. **Test** with various birth dates and locations

## Example Implementation

See the updated `app/chart-tool/page.tsx` for how to integrate the API call in the form submission handler.

