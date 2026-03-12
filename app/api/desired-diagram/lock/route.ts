import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

/**
 * POST /api/desired-diagram/lock
 * Lock the diagram (finalize placements)
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

    const desired = await mockDb.getDesiredDiagramByUserId(userId)
    if (!desired) {
      return NextResponse.json(
        { success: false, error: 'Desired diagram not found' },
        { status: 404 }
      )
    }

    if (desired.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Already locked' },
        { status: 409 }
      )
    }

    const now = new Date()
    if (now > new Date(desired.expiresAt)) {
      return NextResponse.json(
        { success: false, error: 'Diagram has expired' },
        { status: 410 }
      )
    }

    // Lock the diagram
    desired.isLocked = true
    desired.status = 'completed'
    desired.lockedAt = now
    desired.updatedAt = now

    await mockDb.saveDesiredDiagram(desired)

    return NextResponse.json({
      success: true,
      data: {
        status: desired.status,
        isLocked: desired.isLocked,
        totalPlacements: desired.placements.length,
        energyDensity: desired.energyDensity,
        lockedAt: desired.lockedAt,
      },
      message: 'Diagram locked successfully',
    })
  } catch (error: any) {
    console.error('Lock diagram error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/desired-diagram/lock
 * Create new 28-day diagram (reset cycle)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Get user's original diagram
    const original = await mockDb.getOriginalDiagramByUserId(userId)
    if (!original) {
      return NextResponse.json(
        { success: false, error: 'Original diagram not found' },
        { status: 404 }
      )
    }

    // Create fresh diagram
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)

    const newDesired = {
      id: `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      originalDiagramId: original.id,
      placements: [],
      energyDensity: {},
      status: 'active' as const,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      lockedAt: null,
    }

    await mockDb.saveDesiredDiagram(newDesired)

    return NextResponse.json({
      success: true,
      data: newDesired,
      message: 'New 28-day cycle started',
    })
  } catch (error: any) {
    console.error('Reset diagram error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
