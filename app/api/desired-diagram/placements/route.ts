import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

/**
 * POST /api/desired-diagram/placements
 * Add a placement to desired diagram
 * Consumes one energy point
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, cellId, constellationId, constellationName } = await request.json()

    if (!userId || !cellId || !constellationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get desired diagram
    const desired = await mockDb.getDesiredDiagramByUserId(userId)
    if (!desired) {
      return NextResponse.json(
        { success: false, error: 'Desired diagram not found' },
        { status: 404 }
      )
    }

    // Check if locked or expired
    const now = new Date()
    if (now > new Date(desired.expiresAt)) {
      desired.isLocked = true
      desired.status = 'expired'
    }

    if (desired.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Diagram is locked or expired' },
        { status: 403 }
      )
    }

    // Check for duplicate placement in same cell
    const existingPlacement = desired.placements.find((p: any) => p.cellId === cellId)
    if (existingPlacement) {
      return NextResponse.json(
        { success: false, error: 'Cell already occupied' },
        { status: 409 }
      )
    }

    // Verify user owns the constellation
    const inventory = await mockDb.getInventoryByUserId(userId)
    if (!inventory) {
      return NextResponse.json(
        { success: false, error: 'Inventory not found' },
        { status: 404 }
      )
    }

    const hasConstellation = inventory.constellations.some(
      (c: any) => c.id === constellationId
    )
    if (!hasConstellation) {
      return NextResponse.json(
        { success: false, error: 'You do not own this constellation' },
        { status: 403 }
      )
    }

    // Add placement
    const placement = {
      cellId,
      constellationId,
      constellationName: constellationName || 'Unknown',
      placedAt: now,
    }

    desired.placements.push(placement)

    // Calculate energy density
    const density: Record<string, number> = {}
    desired.placements.forEach((p: any) => {
      const sign = parseInt(p.cellId.split('-')[0])
      const zodiacIndex = sign
      const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
      const zodiacName = zodiacSigns[zodiacIndex] || 'Unknown'
      density[zodiacName] = (density[zodiacName] || 0) + 1
    })

    desired.energyDensity = density
    desired.updatedAt = now

    await mockDb.saveDesiredDiagram(desired)

    return NextResponse.json({
      success: true,
      data: {
        placement,
        totalPlacements: desired.placements.length,
        energyDensity: density,
      },
      message: `${constellationName} placed at cell ${cellId}`,
    })
  } catch (error: any) {
    console.error('Placement error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/desired-diagram/placements?userId={userId}&cellId={cellId}
 * Remove a placement from desired diagram
 * Returns energy point
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const cellId = request.nextUrl.searchParams.get('cellId')

    if (!userId || !cellId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or cellId' },
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

    const index = desired.placements.findIndex((p: any) => p.cellId === cellId)
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Placement not found' },
        { status: 404 }
      )
    }

    const removed = desired.placements.splice(index, 1)[0]

    // Recalculate energy density
    const density: Record<string, number> = {}
    desired.placements.forEach((p: any) => {
      const sign = parseInt(p.cellId.split('-')[0])
      const zodiacIndex = sign
      const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
      const zodiacName = zodiacSigns[zodiacIndex] || 'Unknown'
      density[zodiacName] = (density[zodiacName] || 0) + 1
    })

    desired.energyDensity = density
    desired.updatedAt = new Date()

    await mockDb.saveDesiredDiagram(desired)

    return NextResponse.json({
      success: true,
      data: {
        removedPlacement: removed,
        totalPlacements: desired.placements.length,
      },
      message: 'Placement removed',
    })
  } catch (error: any) {
    console.error('Remove placement error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
