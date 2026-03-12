import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

/**
 * POST /api/qr/redeem
 * Redeem a QR code and add constellation to user inventory
 *
 * Prevents duplicate redemptions
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, qrUniqueId } = await request.json()

    if (!userId || !qrUniqueId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or QR ID' },
        { status: 400 }
      )
    }

    // Validate QR code exists
    const qrCode = await mockDb.getQRCodeByUniqueId(qrUniqueId)
    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired QR code' },
        { status: 404 }
      )
    }

    if (!qrCode.isActive) {
      return NextResponse.json(
        { success: false, error: 'QR code is inactive' },
        { status: 410 }
      )
    }

    // Check for duplicate redemption
    const alreadyRedeemed = await mockDb.hasRedeemedQR(userId, qrUniqueId)
    if (alreadyRedeemed) {
      return NextResponse.json(
        { success: false, error: 'You have already redeemed this QR code', isDuplicate: true },
        { status: 409 }
      )
    }

    // Get user inventory
    let inventory = await mockDb.getInventoryByUserId(userId)
    if (!inventory) {
      inventory = {
        _id: Math.random().toString(36).substr(2, 9),
        userId,
        constellations: [],
        totalEnergies: 0,
        updatedAt: new Date(),
      }
    }

    // Check if constellation already in inventory
    const alreadyOwned = inventory.constellations.some(
      (c: any) => c.id === qrCode.constellationId
    )

    // Add constellation to inventory
    const constellationEntry = {
      id: qrCode.constellationId,
      name: qrCode.constellationName,
      symbol: qrCode.constellationSymbol,
      emoji: qrCode.constellationEmoji,
      acquiredAt: new Date(),
      qrId: qrUniqueId,
    }

    if (!alreadyOwned) {
      inventory.constellations.push(constellationEntry)
      inventory.totalEnergies++
    }

    inventory.updatedAt = new Date()
    await mockDb.saveInventory(inventory)

    // Log redemption
    const redemption = {
      _id: Math.random().toString(36).substr(2, 9),
      userId,
      qrId: qrUniqueId,
      constellationId: qrCode.constellationId,
      constellationName: qrCode.constellationName,
      redeemedAt: new Date(),
    }

    await mockDb.saveRedemption(redemption)

    return NextResponse.json({
      success: true,
      data: {
        constellation: qrCode.constellationName,
        symbol: qrCode.constellationSymbol,
        emoji: qrCode.constellationEmoji,
        isNew: !alreadyOwned,
        totalEnergies: inventory.totalEnergies,
      },
      message: alreadyOwned
        ? `You already own ${qrCode.constellationName}`
        : `${qrCode.constellationName} energy acquired!`,
    })
  } catch (error: any) {
    console.error('QR redemption error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/qr/inventory?userId={userId}
 * Get user's constellation inventory
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

    const inventory = await mockDb.getInventoryByUserId(userId)

    if (!inventory) {
      return NextResponse.json(
        { success: true, data: { constellations: [], totalEnergies: 0 } },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        constellations: inventory.constellations,
        totalEnergies: inventory.totalEnergies,
      },
    })
  } catch (error: any) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
