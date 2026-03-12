import { NextRequest, NextResponse } from 'next/server'
import { hash, compare } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// In production, use a real database (PostgreSQL, MongoDB, etc.)
// For now, this uses an in-memory store. Replace with actual DB calls.
const users = new Map()
const sessions = new Map()

interface RegisterRequest {
  email: string
  name: string
  password: string
}

interface LoginRequest {
  email: string
  password: string
}

// Register endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (request.nextUrl.pathname.includes('/register')) {
      const { email, name, password } = body as RegisterRequest

      // Validate inputs
      if (!email || !name || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = Array.from(users.values()).find(
        (u: any) => u.email === email
      )
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash password
      const passwordHash = await hash(password, 10)

      // Create user
      const userId = uuidv4()
      const user = {
        id: userId,
        email,
        name,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      users.set(userId, user)

      // Create session token
      const token = uuidv4()
      const sessionId = uuidv4()
      sessions.set(sessionId, {
        id: sessionId,
        userId,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token,
      })
    }

    // Login endpoint
    if (request.nextUrl.pathname.includes('/login')) {
      const { email, password } = body as LoginRequest

      // Validate inputs
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Find user by email
      const user = Array.from(users.values()).find(
        (u: any) => u.email === email
      ) as any

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Compare passwords
      const passwordMatch = await compare(password, user.passwordHash)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Create session token
      const token = uuidv4()
      const sessionId = uuidv4()
      sessions.set(sessionId, {
        id: sessionId,
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token,
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Note: users and sessions are stored in-memory. Replace with database in production.
