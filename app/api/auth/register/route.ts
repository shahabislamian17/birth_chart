import { NextRequest, NextResponse } from 'next/server'
import { mockDb } from '@/lib/db/mock-db'

/**
 * POST /api/auth/register
 * Register a new user and generate their original diagram
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, birthData } = await request.json()

    if (!email || !password || !birthData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await mockDb.getUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create user
    const userId = Math.random().toString(36).substr(2, 9)
    const user = {
      _id: userId,
      email,
      passwordHash: Buffer.from(password).toString('base64'), // Mock hash
      name: birthData.name || 'User',
      birthData: {
        date: birthData.date,
        time: birthData.time,
        location: birthData.location,
        coordinates: birthData.coordinates,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await mockDb.saveUser(user)

    // Generate original diagram
    const originalDiagram = {
      _id: Math.random().toString(36).substr(2, 9),
      userId,
      birthName: birthData.name,
      birthDate: birthData.date,
      birthTime: birthData.time,
      birthLocation: birthData.location,
      chartData: {
        // Placeholder - in production, call astrology API
        zodiacSign: 'Placeholder',
        houses: 12,
      },
      createdAt: new Date(),
    }

    await mockDb.saveOriginalDiagram(originalDiagram)

    // Initialize inventory
    const inventory = {
      _id: Math.random().toString(36).substr(2, 9),
      userId,
      constellations: [],
      totalEnergies: 0,
      updatedAt: new Date(),
    }

    await mockDb.saveInventory(inventory)

    return NextResponse.json({
      success: true,
      data: {
        userId,
        email,
        originalDiagramId: originalDiagram._id,
      },
      message: 'User registered successfully',
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/login
 * User login (mock)
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const password = request.nextUrl.searchParams.get('password')

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      )
    }

    const user = await mockDb.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Mock password check
    const passwordHash = Buffer.from(password).toString('base64')
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    const original = await mockDb.getOriginalDiagramByUserId(user._id)

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        originalDiagramId: original?._id,
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
