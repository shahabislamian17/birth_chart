// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

// Constellation Types
export interface Constellation {
  id: string
  name: string
  symbol: string // e.g., "♈" for Aries
  emoji?: string
  description?: string
  imageUrl?: string
  createdAt: Date
}

// QR Code Types
export interface QRCode {
  id: string
  code: string // Unique QR code identifier
  constellationId: string // Which constellation this QR unlocks
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
}

// User Constellation Collection (owned constellations)
export interface UserConstellation {
  id: string
  userId: string
  constellationId: string
  qrCodeId: string // Track which QR was scanned
  acquiredAt: Date
  isRedeemed: boolean // To prevent duplicate redemptions
}

// Desired Diagram - user's aspirational chart
export interface DesiredDiagram {
  id: string
  userId: string
  originalChartId: string // Link to the Original Diagram
  placements: DiagramPlacement[]
  createdAt: Date
  updatedAt: Date
  expiresAt: Date // Auto-expires after ~30 days
  isLocked: boolean // Whether it can still be edited
  status: 'active' | 'expired' | 'reset'
}

// Placement of a constellation in a diagram
export interface DiagramPlacement {
  id: string
  constellationId: string
  position: {
    x: number // 0-100 (percentage)
    y: number // 0-100 (percentage)
  }
  zIndex: number // Layer order
  scale: number // Size scaling
  rotation: number // Rotation in degrees
}

// Original Chart (from birth data)
export interface OriginalChart {
  id: string
  userId: string
  birthName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  birthCoordinates: {
    lat: number
    lng: number
  }
  chartData: any // Full astrology API response
  createdAt: Date
  // Never modified after creation
}

// Session/Auth Token
export interface SessionToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

// API Response Types
export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface QRScanResponse {
  success: boolean
  constellationName?: string
  message?: string
  error?: string
  isNewConstellation?: boolean
}

export interface DiagramResponse {
  original: OriginalChart
  desired: DesiredDiagram | null
}
