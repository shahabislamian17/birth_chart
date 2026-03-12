import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

/**
 * GET /api/desired-diagram/scores?userId={userId}
 * Get energy density scores by zodiac sign
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const desired = await mockDb.getDesiredDiagramByUserId(userId)
    if (!desired) {
      return NextResponse.json(
        { success: false, error: 'Desired diagram not found' },
        { status: 404 }
      )
    }

    // Zodiac signs in order (12 houses, 12 zodiac signs)
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ]

    // Build score distribution
    const scores: Record<string, number> = {}
    zodiacSigns.forEach(sign => {
      scores[sign] = 0
    })

    // Aggregate placements by zodiac
    desired.placements.forEach((placement: any) => {
      const [zodiacIndex] = placement.cellId.split('-').map(Number)
      const zodiacName = zodiacSigns[zodiacIndex] || 'Unknown'
      scores[zodiacName] = (scores[zodiacName] || 0) + 1
    })

    // Calculate statistics
    const totalPlacements = desired.placements.length
    const avgScore = totalPlacements > 0 ? totalPlacements / 12 : 0
    const maxScore = Math.max(...Object.values(scores))
    const minScore = Math.min(...Object.values(scores))

    return NextResponse.json({
      success: true,
      data: {
        scores,
        statistics: {
          totalPlacements,
          avgScore: Number(avgScore.toFixed(2)),
          maxScore,
          minScore,
          balanced: maxScore - minScore <= 2, // Consider balanced if diff ≤ 2
        },
        status: desired.status,
        isLocked: desired.isLocked,
        expiresAt: desired.expiresAt,
        daysRemaining: Math.ceil(
          (new Date(desired.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      },
    })
  } catch (error: any) {
    console.error('Get scores error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
