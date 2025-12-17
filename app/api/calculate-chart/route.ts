import { NextRequest, NextResponse } from 'next/server'

// Astrology API configuration - Free Astrology API
// Documentation: https://freeastrologyapi.com/api-reference/western-astrology/natal-wheel-chart
const ASTRO_API_KEY = process.env.ASTRO_API_KEY || 'gtExAhB9gS9pD7unOcrYV9vRM0hMQjkn8VbSDWio'
const ASTRO_API_BASE_URL = 'https://json.freeastrologyapi.com'

interface ChartRequest {
  name: string
  month: string
  date: string
  year: string
  hour: string
  minute: string
  ampm: string
  location: string
  email?: string
}

// Helper function to get coordinates from location
async function getCoordinates(location: string): Promise<{ lat: number; lng: number }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }
    throw new Error('Location not found')
  } catch (error) {
    console.error('Geocoding error:', error)
    // Default to New York if geocoding fails
    return { lat: 40.7128, lng: -74.0060 }
  }
}

// Helper function to convert 12-hour to 24-hour format
function convertTo24Hour(hour: string, minute: string, ampm: string): { hour24: number; minute: number } {
  let hour24 = parseInt(hour)
  const min = parseInt(minute)
  
  if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
    hour24 += 12
  } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
    hour24 = 0
  }
  
  return { hour24, minute: min }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChartRequest = await request.json()
    
    // Validate required fields
    if (!body.month || !body.date || !body.year || !body.hour || !body.minute || !body.ampm || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get coordinates from location
    const coords = await getCoordinates(body.location)
    
    // Convert time to 24-hour format
    const { hour24, minute } = convertTo24Hour(body.hour, body.minute, body.ampm)
    
    // Format date for Free Astrology API
    const day = parseInt(body.date)
    const monthNum = parseInt(body.month)
    const year = parseInt(body.year)
    
    // Get timezone from coordinates (simplified - can use timezone API for accuracy)
    // Estimate timezone from longitude (rough approximation: 15 degrees = 1 hour)
    // Note: timezone should be a float (e.g., 5.5 for India), not rounded
    const estimatedTimezone = coords.lng / 15
    
    // Prepare birth data for Free Astrology API
    // Documentation: https://freeastrologyapi.com/api-reference/western-astrology/natal-wheel-chart
    const birthData = {
      year: year,
      month: monthNum,
      date: day,
      hours: hour24,
      minutes: minute,
      seconds: 0,
      latitude: coords.lat,
      longitude: coords.lng,
      timezone: estimatedTimezone,
      config: {
        observation_point: 'topocentric', // geocentric or topocentric
        ayanamsha: 'tropical', // tropical or sayana or lahiri
        house_system: 'Placidus', // Porphyry, Placidus, Koch, Whole Signs, Equal Houses, Regiomontanus, Vehlow
        language: 'en', // en, es, fr, pt, ru, de, ja, pl, tr
        exclude_planets: [], // Array of planets to exclude
        allowed_aspects: [
          'Conjunction',
          'Opposition',
          'Trine',
          'Square',
          'Sextile',
          'Semi-Sextile',
          'Quintile',
          'Septile',
          'Octile',
          'Novile',
          'Quincunx',
          'Sesquiquadrate'
        ],
        aspect_line_colors: {
          'Conjunction': '#558B6E',
          'Opposition': '#88A09E',
          'Square': '#704C5E',
          'Trine': '#B88C9E',
          'Sextile': '#F1C8DB',
          'Semi-Sextile': '#A799B7',
          'Quintile': '#9888A5',
          'Septile': '#776472',
          'Octile': '#445552',
          'Novile': '#294D4A',
          'Quincunx': '#49306B',
          'Sesquiquadrate': '#E1CDB5'
        },
        wheel_chart_colors: {
          zodiac_sign_background_color: '#303036',
          chart_background_color: '#303036',
          zodiac_signs_text_color: '#FFFFFF',
          dotted_line_color: '#FFFAFF',
          planets_icon_color: '#FFFAFF'
        },
        orb_values: {
          'Conjunction': 3,
          'Opposition': 5,
          'Square': 5,
          'Trine': 5,
          'Sextile': 5,
          'Semi-Sextile': 5,
          'Quintile': 5,
          'Septile': 5,
          'Octile': 5,
          'Novile': 5,
          'Quincunx': 5,
          'Sesquiquadrate': 5
        }
      }
    }
    
    // Call Free Astrology API - Natal Wheel Chart endpoint
    // Uses x-api-key header for authentication (not Basic Auth)
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let chartResponse
    try {
      chartResponse = await fetch(`${ASTRO_API_BASE_URL}/western/natal-wheel-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ASTRO_API_KEY,
        },
        body: JSON.stringify(birthData),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('API request timed out after 30 seconds')
        return NextResponse.json({
          success: false,
          message: 'API request timed out. Please try again.',
          error: 'Request timeout',
          data: null,
          requestData: {
            day,
            month: monthNum,
            year,
            hour: hour24,
            minute,
            latitude: coords.lat,
            longitude: coords.lng,
            timezone: estimatedTimezone,
          }
        }, { status: 504 })
      }
      throw fetchError
    }

    if (!chartResponse.ok) {
      const errorText = await chartResponse.text()
      let errorJson
      try {
        errorJson = JSON.parse(errorText)
      } catch {
        errorJson = { msg: errorText }
      }
      
      console.error('Free Astrology API error:', errorText)
      
      return NextResponse.json({
        success: false,
        message: 'API call failed, using sample data',
        error: errorJson.msg || errorJson.message || 'API request failed',
        data: null,
        requestData: {
          day,
          month: monthNum,
          year,
          hour: hour24,
          minute,
          latitude: coords.lat,
          longitude: coords.lng,
          timezone: estimatedTimezone,
        }
      })
    }

    const chartData = await chartResponse.json()
    
    // The API returns an SVG chart URL in the response
    // Response format: { "statusCode": 200, "output": "https://...svg" }
    console.log('Free Astrology API response:', chartData)
    
    const astroData = {
      chartSvgUrl: chartData.output || chartData.chart_url || null,
      statusCode: chartData.statusCode,
      birthData: {
        year,
        month: monthNum,
        date: day,
        hours: hour24,
        minutes: minute,
        latitude: coords.lat,
        longitude: coords.lng,
        timezone: estimatedTimezone,
      }
    }
    
    console.log('Processed chart data:', astroData)
    
    return NextResponse.json({
      success: true,
      data: astroData,
      requestData: {
        day,
        month: monthNum,
        year,
        hour: hour24,
        minute,
        latitude: coords.lat,
        longitude: coords.lng,
        timezone: estimatedTimezone,
      }
    })
    
  } catch (error: any) {
    console.error('Chart calculation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to calculate chart',
        data: null
      },
      { status: 500 }
    )
  }
}

