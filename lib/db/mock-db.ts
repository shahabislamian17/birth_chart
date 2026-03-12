/**
 * Mock MongoDB Connection & Utilities
 * For development/demo - replace with real MongoDB in production
 */

// In-memory "database" for demo purposes
const mockDatabase = {
  users: new Map(),
  originals: new Map(),
  inventories: new Map(),
  desired: new Map(),
  qrcodes: new Map(),
  redemptions: new Map(),
  nebula: new Map(),
}

/**
 * Generate mock MongoDB _id
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Mock DB operations (replace with real MongoDB calls in production)
 */
export const mockDb = {
  // User operations
  async saveUser(user: any) {
    const id = user._id || generateId()
    mockDatabase.users.set(id, { ...user, _id: id })
    return { ...user, _id: id }
  },

  async getUserById(userId: string) {
    return mockDatabase.users.get(userId) || null
  },

  async getUserByEmail(email: string) {
    for (const user of Array.from(mockDatabase.users.values())) {
      if (user.email === email) return user
    }
    return null
  },

  // Original Diagram operations
  async saveOriginalDiagram(diagram: any) {
    const id = diagram._id || generateId()
    mockDatabase.originals.set(id, { ...diagram, _id: id })
    return { ...diagram, _id: id }
  },

  async getOriginalDiagramByUserId(userId: string) {
    for (const diag of Array.from(mockDatabase.originals.values())) {
      if (diag.userId === userId) return diag
    }
    return null
  },

  // Inventory operations
  async saveInventory(inventory: any) {
    const id = inventory._id || generateId()
    mockDatabase.inventories.set(id, { ...inventory, _id: id })
    return { ...inventory, _id: id }
  },

  async getInventoryByUserId(userId: string) {
    for (const inv of Array.from(mockDatabase.inventories.values())) {
      if (inv.userId === userId) return inv
    }
    return null
  },

  // Desired Diagram operations
  async saveDesiredDiagram(diagram: any) {
    const id = diagram._id || generateId()
    mockDatabase.desired.set(id, { ...diagram, _id: id })
    return { ...diagram, _id: id }
  },

  async getDesiredDiagramByUserId(userId: string) {
    for (const diag of Array.from(mockDatabase.desired.values())) {
      if (diag.userId === userId) return diag
    }
    return null
  },

  // QR Code operations
  async saveQRCode(qr: any) {
    const id = qr._id || generateId()
    mockDatabase.qrcodes.set(id, { ...qr, _id: id })
    return { ...qr, _id: id }
  },

  async getQRCodeByUniqueId(uniqueId: string) {
    for (const qr of Array.from(mockDatabase.qrcodes.values())) {
      if (qr.uniqueId === uniqueId) return qr
    }
    return null
  },

  // QR Redemption operations
  async saveRedemption(redemption: any) {
    const id = redemption._id || generateId()
    mockDatabase.redemptions.set(id, { ...redemption, _id: id })
    return { ...redemption, _id: id }
  },

  async hasRedeemedQR(userId: string, qrId: string) {
    for (const redemption of Array.from(mockDatabase.redemptions.values())) {
      if (redemption.userId === userId && redemption.qrId === qrId) return true
    }
    return false
  },

  async getRedemptionsByUserId(userId: string) {
    const userRedemptions = []
    for (const redemption of Array.from(mockDatabase.redemptions.values())) {
      if (redemption.userId === userId) userRedemptions.push(redemption)
    }
    return userRedemptions
  },

  // Nebula Matrix operations
  async saveNebulaState(state: any) {
    const id = state._id || generateId()
    mockDatabase.nebula.set(id, { ...state, _id: id })
    return { ...state, _id: id }
  },

  async getNebulaStateByUserId(userId: string) {
    for (const state of Array.from(mockDatabase.nebula.values())) {
      if (state.userId === userId) return state
    }
    return null
  },
}

/**
 * Pre-populate mock QR codes for testing
 */
export function initializeMockQRCodes() {
  const constellations = [
    { id: 'const_aries', name: 'Aries', symbol: '♈', emoji: '🐏' },
    { id: 'const_taurus', name: 'Taurus', symbol: '♉', emoji: '🐂' },
    { id: 'const_gemini', name: 'Gemini', symbol: '♊', emoji: '👯' },
    { id: 'const_cancer', name: 'Cancer', symbol: '♋', emoji: '🦀' },
    { id: 'const_leo', name: 'Leo', symbol: '♌', emoji: '🦁' },
    { id: 'const_virgo', name: 'Virgo', symbol: '♍', emoji: '👩‍🌾' },
    { id: 'const_libra', name: 'Libra', symbol: '♎', emoji: '⚖️' },
    { id: 'const_scorpio', name: 'Scorpio', symbol: '♏', emoji: '🦂' },
    { id: 'const_sagittarius', name: 'Sagittarius', symbol: '♐', emoji: '🏹' },
    { id: 'const_capricorn', name: 'Capricorn', symbol: '♑', emoji: '🐐' },
    { id: 'const_aquarius', name: 'Aquarius', symbol: '♒', emoji: '🏺' },
    { id: 'const_pisces', name: 'Pisces', symbol: '♓', emoji: '🐟' },
  ]

  constellations.forEach((const_, index) => {
    const qr = {
      _id: generateId(),
      uniqueId: `QR_CONST_${const_.name.toUpperCase()}`,
      constellationId: const_.id,
      constellationName: const_.name,
      constellationSymbol: const_.symbol,
      constellationEmoji: const_.emoji,
      productBatch: 'BATCH_001',
      isActive: true,
      createdAt: new Date(),
    }
    mockDatabase.qrcodes.set(qr._id, qr)
  })
}

// Initialize on module load
if (typeof window === 'undefined') {
  // Server-side only
  initializeMockQRCodes()
}
