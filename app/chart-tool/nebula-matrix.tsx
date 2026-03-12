'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'

// Zodiac Signs (X-axis, 12 columns)
const ZODIAC_SIGNS = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces']

// Astrological Houses (Y-axis, 12 rows)
const HOUSES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

// Styled Components
const MatrixContainer = styled.div`
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0f0820 100%);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.15);
  margin-bottom: 30px;
  border: 2px solid rgba(255, 215, 0, 0.2);
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    color: #ffd700;
    font-size: 28px;
    margin: 0 0 10px 0;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  
  p {
    color: #b0a080;
    font-size: 14px;
    margin: 5px 0;
  }
`

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
  flex-wrap: wrap;
`

const EnergyDisplay = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 15px 20px;
  color: #ffd700;
  font-weight: 600;
  font-size: 16px;
  min-width: 180px;
  text-align: center;
`

const CountdownDisplay = styled.div<{ $locked: boolean }>`
  background: ${(props) => props.$locked ? 'rgba(220, 20, 60, 0.15)' : 'rgba(0, 200, 100, 0.15)'};
  border: 2px solid ${(props) => props.$locked ? '#dc143c' : '#00c864'};
  border-radius: 8px;
  padding: 15px 20px;
  color: ${(props) => props.$locked ? '#ff6b6b' : '#00e67e'};
  font-weight: 600;
  font-size: 16px;
  min-width: 200px;
  text-align: center;
`

const QRButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const SimulateButton = styled.button`
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  color: #1a0a2e;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(255, 215, 0, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const GridWrapper = styled.div`
  position: relative;
  margin: 20px 0;
  
  svg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(12, 1fr);
  grid-template-rows: 40px repeat(12, 1fr);
  gap: 2px;
  background: rgba(255, 215, 0, 0.05);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.1);
`

const HeaderLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  font-size: 12px;
  font-weight: 600;
  padding: 5px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 4px;
`

const HouseLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd700;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 4px;
  min-height: 50px;
`

const Cell = styled.div<{ $isActive: boolean; $isLocked: boolean }>`
  min-height: 50px;
  background: ${(props) =>
    props.$isActive
      ? 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 215, 0, 0.3) 100%)'
      : 'rgba(100, 80, 150, 0.1)'};
  border: 2px solid ${(props) =>
    props.$isActive
      ? '#ffd700'
      : 'rgba(255, 215, 0, 0.1)'};
  border-radius: 6px;
  cursor: ${(props) => (props.$isLocked ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${(props) =>
      props.$isActive
        ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent)'
        : 'none'};
    pointer-events: none;
  }

  &:hover {
    ${(props) =>
      !props.$isLocked
        ? `
      border-color: #ffed4e;
      background: ${props.$isActive ? 'radial-gradient(circle, rgba(255, 237, 78, 0.9) 0%, rgba(255, 215, 0, 0.4) 100%)' : 'rgba(120, 100, 170, 0.2)'};
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
    `
        : 'opacity: 0.6;'}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const StatusMessage = styled.div<{ $type: 'info' | 'success' | 'warning' | 'error' }>`
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  background: ${(props) => {
    switch (props.$type) {
      case 'success':
        return 'rgba(0, 200, 100, 0.15)'
      case 'error':
        return 'rgba(220, 20, 60, 0.15)'
      default:
        return 'rgba(255, 215, 0, 0.15)'
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case 'success':
        return '#00e67e'
      case 'error':
        return '#ff6b6b'
      default:
        return '#ffd700'
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.$type) {
      case 'success':
        return '#00c864'
      case 'error':
        return '#dc143c'
      default:
        return '#ffd700'
    }
  }};
`

const SummaryBox = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  color: #ffd700;
  
  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
  }
  
  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }
  
  .score-item {
    background: rgba(255, 215, 0, 0.05);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 215, 0, 0.2);
    font-size: 13px;
  }
`

interface CellState {
  coordinate: string
  isActive: boolean
  activationDate?: Date
}

interface DesiredDiagramProps {
  diagramId: string
  userId: string
}

export default function DesiredDiagram({ diagramId, userId }: DesiredDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // State Management
  const [energyPoints, setEnergyPoints] = useState(5)
  const [activeCells, setActiveCells] = useState<Set<string>>(new Set())
  const [usedQRIds, setUsedQRIds] = useState<Set<string>>(new Set())
  const [firstActivationDate, setFirstActivationDate] = useState<Date | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(28)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null)

  // Calculate if grid is locked based on 28-day lifecycle
  useEffect(() => {
    if (!firstActivationDate) return

    const checkLockStatus = () => {
      const now = new Date()
      const elapsedMs = now.getTime() - firstActivationDate.getTime()
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24))
      const remaining = Math.max(0, 28 - elapsedDays)

      setDaysRemaining(remaining)

      if (remaining === 0) {
        setIsLocked(true)
      }
    }

    checkLockStatus()
    const interval = setInterval(checkLockStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [firstActivationDate])

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`nebula-matrix-${userId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setActiveCells(new Set(parsed.activeCells))
        setUsedQRIds(new Set(parsed.usedQRIds))
        setEnergyPoints(parsed.energyPoints)
        if (parsed.firstActivationDate) {
          setFirstActivationDate(new Date(parsed.firstActivationDate))
        }
        if (parsed.isLocked) {
          setIsLocked(parsed.isLocked)
        }
      } catch (e) {
        console.error('Failed to load saved state:', e)
      }
    }
  }, [userId])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(
      `nebula-matrix-${userId}`,
      JSON.stringify({
        activeCells: Array.from(activeCells),
        usedQRIds: Array.from(usedQRIds),
        energyPoints,
        firstActivationDate,
        isLocked,
      })
    )
  }, [activeCells, usedQRIds, energyPoints, firstActivationDate, isLocked, userId])

  // Handle cell click
  const handleCellClick = (sign: number, house: number) => {
    if (isLocked || energyPoints <= 0) return

    const coordinate = `${sign}-${house}`

    if (activeCells.has(coordinate)) {
      // Deactivate cell
      const newActiveCells = new Set(activeCells)
      newActiveCells.delete(coordinate)
      setActiveCells(newActiveCells)
      setEnergyPoints(energyPoints + 1)
      setStatusMessage({ text: 'Energy point returned', type: 'info' })
    } else {
      // Activate cell
      const newActiveCells = new Set(activeCells)
      newActiveCells.add(coordinate)
      setActiveCells(newActiveCells)
      setEnergyPoints(energyPoints - 1)

      // Set first activation date if this is the first cell
      if (activeCells.size === 0) {
        setFirstActivationDate(new Date())
      }

      setStatusMessage({ text: `Energy placed at Sign ${sign + 1}, House ${house + 1}`, type: 'success' })
    }
  }

  // Handle QR scan
  const handleQRScan = (uniqueId: string) => {
    if (usedQRIds.has(uniqueId)) {
      setStatusMessage({ text: 'This QR code has already been redeemed', type: 'warning' })
      return
    }

    const newUsedQRIds = new Set(usedQRIds)
    newUsedQRIds.add(uniqueId)
    setUsedQRIds(newUsedQRIds)
    setEnergyPoints(energyPoints + 1)
    setStatusMessage({ text: `Energy gained from ${uniqueId}!`, type: 'success' })
  }

  // Simulate QR scans
  const simulateQRScans = () => {
    const qrIds = ['QR_CONST_ARIES', 'QR_CONST_TAURUS', 'QR_CONST_GEMINI', 'QR_CONST_CANCER', 'QR_CONST_LEO', 'QR_CONST_VIRGO']
    qrIds.forEach((id) => {
      if (!usedQRIds.has(id)) {
        handleQRScan(id)
      }
    })
  }

  // Calculate active cell coordinates for SVG lines
  const activeCellCoordinates = useMemo(() => {
    const coords: Array<{ x: number; y: number; coordinate: string }> = []

    activeCells.forEach((coordinate) => {
      const [sign, house] = coordinate.split('-').map(Number)
      // Calculate pixel position (approximate grid cell center)
      const cellWidth = 60
      const cellHeight = 60
      const startX = 90
      const startY = 50
      const x = startX + sign * cellWidth + cellWidth / 2
      const y = startY + house * cellHeight + cellHeight / 2

      coords.push({ x, y, coordinate })
    })

    return coords
  }, [activeCells])

  // Draw SVG constellation lines
  useEffect(() => {
    if (!svgRef.current || activeCellCoordinates.length < 2) {
      if (svgRef.current) {
        svgRef.current.innerHTML = ''
      }
      return
    }

    const svg = svgRef.current
    const width = svg.parentElement?.clientWidth || 800
    const height = svg.parentElement?.clientHeight || 800

    svg.setAttribute('width', width.toString())
    svg.setAttribute('height', height.toString())
    svg.innerHTML = ''

    // Add glow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', 'glow')
    filter.innerHTML = `
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    `
    defs.appendChild(filter)
    svg.appendChild(defs)

    // Draw connecting lines
    for (let i = 0; i < activeCellCoordinates.length - 1; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      const from = activeCellCoordinates[i]
      const to = activeCellCoordinates[i + 1]

      line.setAttribute('x1', from.x.toString())
      line.setAttribute('y1', from.y.toString())
      line.setAttribute('x2', to.x.toString())
      line.setAttribute('y2', to.y.toString())
      line.setAttribute('stroke', '#ffd700')
      line.setAttribute('stroke-width', '2')
      line.setAttribute('opacity', '0.7')
      line.setAttribute('filter', 'url(#glow)')
      line.setAttribute('stroke-linecap', 'round')

      svg.appendChild(line)
    }

    // Draw active cell markers
    activeCellCoordinates.forEach((coord) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', coord.x.toString())
      circle.setAttribute('cy', coord.y.toString())
      circle.setAttribute('r', '6')
      circle.setAttribute('fill', '#ffed4e')
      circle.setAttribute('filter', 'url(#glow)')

      svg.appendChild(circle)
    })
  }, [activeCellCoordinates])

  // Calculate energy scores per zodiac sign
  const energyScores = useMemo(() => {
    const scores: Record<string, number> = {}

    ZODIAC_SIGNS.forEach((sign, index) => {
      scores[sign] = 0
    })

    activeCells.forEach((coordinate) => {
      const [sign] = coordinate.split('-').map(Number)
      const signName = ZODIAC_SIGNS[sign]
      scores[signName]++
    })

    return scores
  }, [activeCells])

  return (
    <MatrixContainer>
      <Header>
        <h2>✨ Nebula Energy Matrix</h2>
        <p>Place cosmic energies in the 144-cell matrix over 28 days to manifest your digital nebula</p>
      </Header>

      <ControlsRow>
        <EnergyDisplay>
          ⚡ Energy Points: {energyPoints}
        </EnergyDisplay>

        <CountdownDisplay $locked={isLocked}>
          {isLocked ? `🔒 LOCKED - Asset Generated` : `⏰ Days Remaining: ${daysRemaining}/28`}
        </CountdownDisplay>

        <QRButtonGroup>
          <SimulateButton onClick={simulateQRScans} disabled={isLocked}>
            📱 Simulate QR Scans
          </SimulateButton>
        </QRButtonGroup>
      </ControlsRow>

      {statusMessage && (
        <StatusMessage $type={statusMessage.type}>
          {statusMessage.text}
        </StatusMessage>
      )}

      <GridWrapper>
        <svg ref={svgRef} />
        <GridContainer>
          {/* Empty corner cell */}
          <HeaderLabel />

          {/* Zodiac header */}
          {ZODIAC_SIGNS.map((sign, index) => (
            <HeaderLabel key={`header-${index}`}>{sign.substring(0, 1)}</HeaderLabel>
          ))}

          {/* Grid rows */}
          {HOUSES.map((house, houseIndex) => (
            <>
              <HouseLabel key={`house-${houseIndex}`}>House {house}</HouseLabel>
              {ZODIAC_SIGNS.map((_, signIndex) => {
                const coordinate = `${signIndex}-${houseIndex}`
                const isActive = activeCells.has(coordinate)

                return (
                  <Cell
                    key={coordinate}
                    $isActive={isActive}
                    $isLocked={isLocked}
                    onClick={() => handleCellClick(signIndex, houseIndex)}
                    title={`${ZODIAC_SIGNS[signIndex]} - House ${HOUSES[houseIndex]}`}
                  >
                    {isActive && '●'}
                  </Cell>
                )
              })}
            </>
          ))}
        </GridContainer>
      </GridWrapper>

      {isLocked && (
        <SummaryBox>
          <h3>🎆 Digital Nebula Asset Generated</h3>
          <p>Energy Distribution by Zodiac Sign:</p>
          <div className="score-grid">
            {ZODIAC_SIGNS.map((sign, index) => {
              const count = energyScores[sign]
              return count > 0 ? (
                <div key={sign} className="score-item">
                  <strong>{sign}</strong>: +{count} Energy
                </div>
              ) : null
            })}
          </div>
          <p style={{ marginTop: '15px', fontSize: '14px', fontStyle: 'italic' }}>
            Total Cosmic Density: {activeCells.size} / 144 cells activated
          </p>
        </SummaryBox>
      )}
    </MatrixContainer>
  )
}
