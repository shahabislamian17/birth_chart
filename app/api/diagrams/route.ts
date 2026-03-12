import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for diagrams
const diagramsStore = new Map()

interface DiagramPlacement {
  id: string
  constellationId: string
  position: {
    x: number
    y: number
  }
  zIndex: number
  scale: number
  rotation: number
}

interface CreateDiagramRequest {
  userId: string
  originalChartId: string
}

interface UpdateDiagramRequest {
  userId: string
  diagramId: string
  placements: DiagramPlacement[]
}

interface LockDiagramRequest {
  userId: string
  diagramId: string
}

interface ResetDiagramRequest {
  userId: string
  diagramId: string
}

/**
 * POST /api/diagrams/create
 * Create a new Desired Diagram for a user
 */
export async function POST(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname
    // Parse body once and support either body.action or path-based endpoints
    let payload: any = {}
    try {
      payload = await request.json()
    } catch (e) {
      // no body or invalid JSON
      payload = {}
    }

    const action = payload.action || (pathname.includes('/create') ? 'create' : pathname.includes('/update') ? 'update' : pathname.includes('/lock') ? 'lock' : pathname.includes('/reset') ? 'reset' : null)

    // Create new diagram
    if (action === 'create') {
      const { userId, originalChartId } = payload as CreateDiagramRequest

      if (!userId || !originalChartId) {
        return NextResponse.json(
          { error: 'Missing userId or originalChartId' },
          { status: 400 }
        )
      }

      const diagramId = uuidv4()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const diagram = {
        id: diagramId,
        userId,
        originalChartId,
        placements: [],
        createdAt: now,
        updatedAt: now,
        expiresAt,
        isLocked: false,
        status: 'active',
      }

      diagramsStore.set(diagramId, diagram)

      return NextResponse.json({
        success: true,
        diagram,
      })
    }

    // Update placements in diagram
    if (action === 'update') {
      const { userId, diagramId, placements } = payload as UpdateDiagramRequest

      if (!userId || !diagramId) {
        return NextResponse.json(
          { error: 'Missing userId or diagramId' },
          { status: 400 }
        )
      }

      const diagram = diagramsStore.get(diagramId)
      if (!diagram) {
        return NextResponse.json(
          { error: 'Diagram not found' },
          { status: 404 }
        )
      }

      // Verify ownership
      if (diagram.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      // Check if expired
      if (new Date() > diagram.expiresAt) {
        diagram.status = 'expired'
        return NextResponse.json(
          { error: 'Diagram has expired. Please reset or create a new one.' },
          { status: 410 }
        )
      }

      // Check if locked
      if (diagram.isLocked) {
        return NextResponse.json(
          { error: 'Diagram is locked and cannot be edited' },
          { status: 403 }
        )
      }

      diagram.placements = placements
      diagram.updatedAt = new Date()
      diagramsStore.set(diagramId, diagram)

      return NextResponse.json({
        success: true,
        diagram,
      })
    }

    // Lock diagram
    if (action === 'lock') {
      const { userId, diagramId } = payload as LockDiagramRequest

      const diagram = diagramsStore.get(diagramId)
      if (!diagram) {
        return NextResponse.json(
          { error: 'Diagram not found' },
          { status: 404 }
        )
      }

      if (diagram.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      diagram.isLocked = true
      diagram.updatedAt = new Date()
      diagramsStore.set(diagramId, diagram)

      return NextResponse.json({
        success: true,
        message: 'Diagram locked successfully',
        diagram,
      })
    }

    // Reset diagram
    if (action === 'reset') {
      const { userId, diagramId } = payload as ResetDiagramRequest

      const diagram = diagramsStore.get(diagramId)
      if (!diagram) {
        return NextResponse.json(
          { error: 'Diagram not found' },
          { status: 404 }
        )
      }

      if (diagram.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      // Reset to empty state and extend expiration
      diagram.placements = []
      diagram.isLocked = false
      diagram.status = 'active'
      diagram.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      diagram.updatedAt = new Date()
      diagramsStore.set(diagramId, diagram)

      return NextResponse.json({
        success: true,
        message: 'Diagram reset successfully',
        diagram,
      })
    }

    return NextResponse.json({ error: 'Invalid endpoint or action' }, { status: 400 })
  } catch (error) {
    console.error('Diagram operation error:', error)
    return NextResponse.json(
      { error: 'Failed to process diagram operation' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/diagrams?userId={userId}&diagramId={diagramId}
 * Retrieve diagram(s)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const diagramId = request.nextUrl.searchParams.get('diagramId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Get specific diagram
    if (diagramId) {
      const diagram = diagramsStore.get(diagramId)
      if (!diagram) {
        return NextResponse.json(
          { error: 'Diagram not found' },
          { status: 404 }
        )
      }

      if (diagram.userId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      // Check expiration status
      if (new Date() > diagram.expiresAt) {
        diagram.status = 'expired'
      }

      return NextResponse.json({
        success: true,
        diagram,
      })
    }

    // Get all diagrams for user
    const userDiagrams = Array.from(diagramsStore.values()).filter(
      (d: any) => d.userId === userId
    )

    return NextResponse.json({
      success: true,
      diagrams: userDiagrams,
      count: userDiagrams.length,
    })
  } catch (error) {
    console.error('Diagram fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch diagrams' },
      { status: 500 }
    )
  }
}

// Note: diagramsStore is stored in-memory. Replace with database in production.
