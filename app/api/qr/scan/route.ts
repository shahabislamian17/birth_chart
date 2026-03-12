import { NextRequest, NextResponse } from 'next/server'

// Map to store QR code to constellation associations
// In production, use a real database
const qrCodeRegistry = new Map<string, string>() // qrCode -> constellationId
const userCollections = new Map<string, Set<string>>() // userId -> Set of constellationIds

// Pre-populate with sample constellation QR codes
const constellations = [
  { id: 'const_aries', name: 'Aries', symbol: '♈', emoji: '🐏' },
  { id: 'const_taurus', name: 'Taurus', symbol: '♉', emoji: '🐂' },
  { id: 'const_gemini', name: 'Gemini', symbol: '♊', emoji: '👯' },
  { id: 'const_cancer', name: 'Cancer', symbol: '♋', emoji: '🦀' },
  { id: 'const_leo', name: 'Leo', symbol: '♌', emoji: '🦁' },
  { id: 'const_virgo', name: 'Virgo', symbol: '♍', emoji: '👩‍🌾' },
  { id: 'const_libra', name: 'Libra', symbol: '♎', emoji: '⚖️' },
  { id: 'const_scorpio', name: 'Scorpio', symbol: '♏', emoji: '🦂' },
  { id: 'const_sagittarius', name: 'Sagittarius', symbol: '♐', emoji: '🏹' },
  { id: 'const_capricorn', name: 'Capricorn', symbol: '♑', emoji: '🐐' },
  { id: 'const_aquarius', name: 'Aquarius', symbol: '♒', emoji: '🏺' },
  { id: 'const_pisces', name: 'Pisces', symbol: '♓', emoji: '🐟' },
]

// Initialize QR code registry with sample codes
constellations.forEach((constellation, index) => {
  qrCodeRegistry.set(`QR_${constellation.id}`, constellation.id)
})

interface QRScanRequest {
  qrCode: string
  userId: string
}

/**
 * POST /api/qr/scan
 * Scan a QR code and add constellation to user's collection
 * Prevents duplicate redemptions
 */
export async function POST(request: NextRequest) {
  try {
    const { qrCode, userId } = (await request.json()) as QRScanRequest

    if (!qrCode || !userId) {
      return NextResponse.json(
        { error: 'Missing qrCode or userId' },
        { status: 400 }
      )
    }

    // Look up constellation from QR code
    const constellationId = qrCodeRegistry.get(qrCode)
    if (!constellationId) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code' },
        { status: 404 }
      )
    }

    // Get user's constellation collection
    if (!userCollections.has(userId)) {
      userCollections.set(userId, new Set())
    }

    const userCollection = userCollections.get(userId)!
    const isNewConstellation = !userCollection.has(constellationId)

    // Add to collection (won't add duplicate)
    userCollection.add(constellationId)

    // Find constellation details
    const constellation = constellations.find((c) => c.id === constellationId)

    return NextResponse.json({
      success: true,
      constellationName: constellation?.name,
      message: isNewConstellation
        ? `✨ New constellation unlocked: ${constellation?.name}!`
        : `Already collected ${constellation?.name}. No duplicate rewards.`,
      isNewConstellation,
      constellation: {
        id: constellation?.id,
        name: constellation?.name,
        symbol: constellation?.symbol,
        emoji: constellation?.emoji,
      },
    })
  } catch (error) {
    console.error('QR scan error:', error)
    return NextResponse.json(
      { error: 'Failed to process QR code' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/qr/scan?userId={userId}
 * Get all constellations collected by a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const collectedIds = userCollections.get(userId) || new Set()
    const collected = constellations.filter((c) =>
      collectedIds.has(c.id)
    )

    return NextResponse.json({
      success: true,
      userId,
      collectedCount: collected.length,
      collected: collected.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        emoji: c.emoji,
      })),
    })
  } catch (error) {
    console.error('Collection fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

// Note: constellations and userCollections are stored in-memory. Replace with database in production.
