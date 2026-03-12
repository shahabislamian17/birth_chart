'use client'

import { useState } from 'react'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Hook for user authentication endpoints
 */
export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = async (
    email: string,
    password: string,
    birthDate: string,
    birthTime: string,
    birthLocation: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          birthData: {
            date: birthDate,
            time: birthTime,
            location: birthLocation,
          },
        }),
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Registration failed')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/register?action=login', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${email}:${password}`)}`,
        },
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { register, login, loading, error }
}

/**
 * Hook for QR redemption
 */
export function useQRRedemption() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redeem = async (userId: string, qrCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/qr/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, qrUniqueId: qrCode }),
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) {
        if (response.status === 409 && (data as any).isDuplicate) {
          throw new Error('Already redeemed this constellation!')
        }
        throw new Error(data.error || 'Redemption failed')
      }
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getInventory = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/qr/inventory?userId=${userId}`)
      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch inventory')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { redeem, getInventory, loading, error }
}

/**
 * Hook for desired diagram management
 */
export function useDesiredDiagram() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrGet = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/desired-diagram/create-or-get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to get diagram')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const get = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/desired-diagram?userId=${userId}`)
      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch diagram')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addPlacement = async (
    userId: string,
    cellId: string,
    constellationId: string,
    constellationName: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/desired-diagram/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cellId,
          constellationId,
          constellationName,
        }),
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to add placement')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removePlacement = async (userId: string, cellId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/desired-diagram/placements?userId=${userId}&cellId=${cellId}`,
        { method: 'DELETE' }
      )

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to remove placement')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const lock = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/desired-diagram/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to lock diagram')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/desired-diagram/lock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to reset diagram')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getScores = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/desired-diagram/scores?userId=${userId}`)
      const data: ApiResponse = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch scores')
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createOrGet,
    get,
    addPlacement,
    removePlacement,
    lock,
    reset,
    getScores,
    loading,
    error,
  }
}
