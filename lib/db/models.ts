// MongoDB Data Models for Two Diagram System

/**
 * User Model
 * Stores user profile and birth data
 */
export interface User {
  _id: string
  email: string
  passwordHash: string
  name: string
  birthData: {
    date: string // YYYY-MM-DD
    time: string // HH:MM
    location: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * Original Diagram Model
 * Immutable birth chart - generated once per user
 */
export interface OriginalDiagram {
  _id: string
  userId: string
  birthName: string
  birthDate: string
  birthTime: string
  birthLocation: string
  chartData: any // Astrology API response or placeholder data
  svgUrl?: string // Optional generated SVG
  createdAt: Date
  // NEVER modified or deleted
}

/**
 * User Constellation Inventory
 * Tracks collected constellations from QR scans
 */
export interface UserInventory {
  _id: string
  userId: string
  constellations: {
    id: string // Unique constellation ID
    name: string // e.g., "Aries"
    symbol: string // e.g., "♈"
    emoji: string // e.g., "🐏"
    acquiredAt: Date
    qrId: string // Which QR code was scanned
  }[]
  totalEnergies: number
  updatedAt: Date
}

/**
 * Desired Diagram Model
 * Editable 28-day energy diagram
 */
export interface DesiredDiagram {
  _id: string
  userId: string
  originalDiagramId: string // Reference to immutable original
  placements: {
    cellId: string // Format: "sign-house" e.g., "0-5"
    constellationId: string
    constellationName: string
    placedAt: Date
  }[]
  createdAt: Date
  expiresAt: Date // 28 days from first placement
  isLocked: boolean // Read-only after 28 days
  status: 'active' | 'expired' | 'locked'
  energyDensity?: {
    [zodiacSign: string]: number // Count by zodiac
  }
  updatedAt: Date
}

/**
 * QR Code Registry
 * Stores all valid QR codes and their associated constellations
 */
export interface QRCode {
  _id: string
  uniqueId: string // Unique identifier from QR
  constellationId: string
  constellationName: string
  constellationSymbol: string
  constellationEmoji: string
  productBatch: string // Which product batch this QR belongs to
  isActive: boolean
  createdAt: Date
  expiresAt?: Date // Optional: QR code expiration
}

/**
 * QR Redemption Log
 * Tracks which users have redeemed which QR codes
 * Prevents duplicate redemptions
 */
export interface QRRedemption {
  _id: string
  userId: string
  qrId: string
  constellationId: string
  constellationName: string
  redeemedAt: Date
  ipAddress?: string
  userAgent?: string
}

/**
 * Session Token (for auth)
 */
export interface SessionToken {
  _id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

/**
 * Nebula Matrix State
 * Tracks individual user's 144-cell grid
 */
export interface NebulaMatrixState {
  _id: string
  userId: string
  gridState: {
    coordinate: string // "sign-house"
    isActive: boolean
    activationDate?: Date
  }[]
  energyBalance: number
  firstActivationDate?: Date
  isLocked: boolean
  daysRemaining: number
  createdAt: Date
  updatedAt: Date
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
