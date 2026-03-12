/**
 * Desired Diagram Management Utilities
 * Handles expiration, locking, and reset logic
 */

export interface DiagramStatus {
  isExpired: boolean
  daysRemaining: number
  hoursRemaining: number
  minutesRemaining: number
  canEdit: boolean
  status: 'active' | 'expired' | 'locked' | 'reset'
}

/**
 * Calculate time remaining until expiration
 */
export function getTimeRemaining(expiresAt: Date): DiagramStatus {
  const now = new Date()
  const expirationDate = new Date(expiresAt)
  const diff = expirationDate.getTime() - now.getTime()

  const isExpired = diff <= 0
  const totalSeconds = Math.floor(diff / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const daysRemaining = Math.floor(totalHours / 24)

  const minutesRemaining = totalMinutes % 60
  const hoursRemaining = totalHours % 24

  return {
    isExpired,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    canEdit: !isExpired,
    status: isExpired ? 'expired' : 'active',
  }
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(expiresAt: Date): string {
  const status = getTimeRemaining(expiresAt)

  if (status.isExpired) {
    return 'Expired'
  }

  if (status.daysRemaining > 0) {
    return `${status.daysRemaining} day${status.daysRemaining > 1 ? 's' : ''}`
  }

  if (status.hoursRemaining > 0) {
    return `${status.hoursRemaining} hour${status.hoursRemaining > 1 ? 's' : ''}`
  }

  if (status.minutesRemaining > 0) {
    return `${status.minutesRemaining} minute${status.minutesRemaining > 1 ? 's' : ''}`
  }

  return 'Expiring soon'
}

/**
 * Calculate expiration date (30 days from now)
 */
export function calculateExpirationDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date
}

/**
 * Check if diagram should be auto-locked on expiration
 */
export function shouldAutoLock(expiresAt: Date, isLocked: boolean): boolean {
  if (isLocked) return false
  const status = getTimeRemaining(expiresAt)
  return status.isExpired
}

/**
 * Generate expiration warning message
 */
export function getExpirationMessage(expiresAt: Date, isLocked: boolean): string | null {
  const status = getTimeRemaining(expiresAt)

  if (status.isExpired && !isLocked) {
    return '⏰ This diagram has expired. You can reset it to start fresh or lock it to preserve the current design.'
  }

  if (status.isExpired && isLocked) {
    return '🔒 This diagram has expired and is locked. Create a new diagram to continue building your desired chart.'
  }

  if (status.daysRemaining === 0 && status.hoursRemaining <= 6) {
    return `⚠️ This diagram expires in ${formatTimeRemaining(expiresAt)}`
  }

  if (status.daysRemaining <= 3) {
    return `📅 This diagram expires in ${formatTimeRemaining(expiresAt)}`
  }

  return null
}

/**
 * Suggested actions based on diagram status
 */
export function getSuggestedActions(
  expiresAt: Date,
  isLocked: boolean,
  hasConstellations: boolean
): string[] {
  const actions: string[] = []
  const status = getTimeRemaining(expiresAt)

  if (!hasConstellations) {
    actions.push('Scan QR codes to collect constellation energies')
  }

  if (!isLocked && hasConstellations) {
    actions.push('Save your desired diagram')
  }

  if (!isLocked && status.daysRemaining <= 3) {
    actions.push('Lock this diagram to preserve it')
  }

  if (status.isExpired) {
    actions.push('Reset to create a new diagram')
  }

  if (!isLocked && !status.isExpired) {
    actions.push('Continue editing your aspirational chart')
  }

  return actions
}

/**
 * Background job simulation - in production, use a task queue (Bull, Celery, etc.)
 * Automatically expires diagrams at 30 days
 */
export function checkAndUpdateDiagramStatus(diagram: any): any {
  const status = getTimeRemaining(diagram.expiresAt)

  if (status.isExpired && !diagram.isLocked) {
    return {
      ...diagram,
      status: 'expired',
      isLocked: true, // Auto-lock on expiration
    }
  }

  return diagram
}

/**
 * Validation before reset
 */
export function canResetDiagram(expiresAt: Date, isLocked: boolean): boolean {
  const status = getTimeRemaining(expiresAt)
  // Can only reset expired or nearly-expired diagrams
  return status.isExpired || status.daysRemaining === 0
}

/**
 * Calculate new expiration date after reset
 */
export function getNewExpirationAfterReset(): Date {
  return calculateExpirationDate()
}
