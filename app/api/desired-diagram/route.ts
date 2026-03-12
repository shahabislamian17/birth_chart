import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

/**
 * POST /api/desired-diagram/create-or-get
 * Create or get user's desired diagram (editable 28-day energy diagram)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Check if desired diagram already exists
    let desired = await mockDb.getDesiredDiagramByUserId(userId)

    if (desired) {
      // Check if expired
      const now = new Date()
      if (now > new Date(desired.expiresAt)) {
        desired.status = 'expired'
      }

      return NextResponse.json({
        success: true,
        data: desired,
        isNew: false,
      })
    }

    // Get original diagram
    const original = await mockDb.getOriginalDiagramByUserId(userId)
    if (!original) {
      return NextResponse.json(
        { success: false, error: 'Original diagram not found' },
        { status: 404 }
      )
    }

    // Create new desired diagram
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)

    const newDesired = {
      _id: Math.random().toString(36).substr(2, 9),
      userId,
      originalDiagramId: original._id,
      placements: [],
      createdAt: now,
      expiresAt,
      isLocked: false,
      status: 'active',
      energyDensity: {},
      updatedAt: now,
    }

    await mockDb.saveDesiredDiagram(newDesired)

    return NextResponse.json({
      success: true,
      data: newDesired,
      isNew: true,
      message: 'Desired diagram created. 28 days to manifest your nebula!',
    })
  } catch (error: any) {
    console.error('Desired diagram create error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/desired-diagram?userId={userId}
 * Get user's desired diagram
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
        { success: true, data: null },
        { status: 200 }
      )
    }

    // Check expiration
    const now = new Date()
    if (now > new Date(desired.expiresAt)) {
      desired.status = 'expired'
      desired.isLocked = true
    }

    return NextResponse.json({
      success: true,
      data: desired,
    })
  } catch (error: any) {
    console.error('Desired diagram fetch error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
