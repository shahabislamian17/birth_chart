'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useQRRedemption } from '@/lib/hooks/useApi'

const Container = styled.div`
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  border: 2px solid #8b7355;
  border-radius: 8px;
  padding: 24px;
  margin: 16px 0;
  color: #e8d4b8;
`

const Title = styled.h3`
  font-size: 1.5rem;
  color: #d4af37;
  margin-bottom: 16px;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`

const ConstellationCard = styled.div`
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid #d4af37;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(30, 50, 90, 0.9);
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    transform: translateY(-2px);
  }

  .emoji {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .name {
    font-weight: bold;
    color: #d4af37;
    margin-bottom: 4px;
  }

  .symbol {
    font-size: 0.9rem;
    color: #b8860b;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #8b7355;

  p {
    margin: 8px 0;
    font-style: italic;
  }
`

const Stats = styled.div`
  background: rgba(20, 20, 40, 0.6);
  border: 1px solid #5a4a3a;
  border-radius: 6px;
  padding: 12px;
  margin-top: 16px;

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 0.9rem;

    .label {
      color: #8b7355;
    }

    .value {
      color: #d4af37;
      font-weight: bold;
    }
  }
`

interface Constellation {
  id: string
  name: string
  symbol?: string
  emoji?: string
  redeemedAt?: string
}

interface InventoryProps {
  userId?: string
  onConstellationSelect?: (constellation: Constellation) => void
}

export function InventoryDisplay({ userId, onConstellationSelect }: InventoryProps) {
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getInventory } = useQRRedemption()

  const constellationData: Record<string, { symbol: string; emoji: string }> = {
    Aries: { symbol: '♈', emoji: '🐏' },
    Taurus: { symbol: '♉', emoji: '🐂' },
    Gemini: { symbol: '♊', emoji: '👯' },
    Cancer: { symbol: '♋', emoji: '🦀' },
    Leo: { symbol: '♌', emoji: '🦁' },
    Virgo: { symbol: '♍', emoji: '👩‍🌾' },
    Libra: { symbol: '♎', emoji: '⚖️' },
    Scorpio: { symbol: '♏', emoji: '🦂' },
    Sagittarius: { symbol: '♐', emoji: '🏹' },
    Capricorn: { symbol: '♑', emoji: '🐐' },
    Aquarius: { symbol: '♒', emoji: '🏺' },
    Pisces: { symbol: '♓', emoji: '🐟' },
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchInventory = async () => {
      try {
        setLoading(true)
        const data = await getInventory(userId)
        const enriched = data.constellations.map((c: any) => ({
          ...c,
          ...constellationData[c.name],
        }))
        setConstellations(enriched)
        setError(null)
      } catch (err: any) {
        setError(err.message)
        setConstellations([])
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [userId, getInventory])

  if (!userId) {
    return (
      <Container>
        <Title>✨ Constellation Inventory</Title>
        <EmptyState>
          <p>Register to collect constellations</p>
        </EmptyState>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container>
        <Title>✨ Constellation Inventory</Title>
        <EmptyState>
          <p>Loading inventory...</p>
        </EmptyState>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Title>✨ Constellation Inventory</Title>
        <EmptyState>
          <p style={{ color: '#d45555' }}>Error: {error}</p>
        </EmptyState>
      </Container>
    )
  }

  if (constellations.length === 0) {
    return (
      <Container>
        <Title>✨ Constellation Inventory</Title>
        <EmptyState>
          <p>🎫 Scan QR codes to collect constellations</p>
          <p>Each constellation grants 1 energy point</p>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      <Title>✨ Constellation Inventory ({constellations.length}/12)</Title>

      <Grid>
        {constellations.map((constellation) => (
          <ConstellationCard
            key={constellation.id}
            onClick={() => onConstellationSelect?.(constellation)}
          >
            <div className="emoji">{constellation.emoji}</div>
            <div className="name">{constellation.name}</div>
            <div className="symbol">{constellation.symbol}</div>
          </ConstellationCard>
        ))}
      </Grid>

      <Stats>
        <div className="stat-row">
          <span className="label">Total Constellations:</span>
          <span className="value">{constellations.length}/12</span>
        </div>
        <div className="stat-row">
          <span className="label">Available Energy Points:</span>
          <span className="value">{constellations.length}</span>
        </div>
        <div className="stat-row">
          <span className="label">Collection Rate:</span>
          <span className="value">{((constellations.length / 12) * 100).toFixed(0)}%</span>
        </div>
        <div className="stat-row">
          <span className="label">Remaining to Collect:</span>
          <span className="value">{12 - constellations.length}</span>
        </div>
      </Stats>
    </Container>
  )
}
