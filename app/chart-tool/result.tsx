'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import TwoDiagramView from './two-diagram-view'
import NebulaMatrix from './nebula-matrix'

interface ChartData {
  name: string
  date: string
  time: string
  location: string
  month: string
  year: string
  hour: string
  minute: string
  ampm: string
}

interface Constellation {
  id: string
  name: string
  symbol: string
  emoji: string
}

interface DiagramPlacement {
  id: string
  constellationId: string
  position: { x: number; y: number }
  zIndex: number
  scale: number
  rotation: number
}

interface DesiredDiagram {
  id: string
  placements: DiagramPlacement[]
  expiresAt: Date
  isLocked: boolean
  status: 'active' | 'expired' | 'locked'
}

interface ResultPageProps {
  chartData: ChartData
  apiChartData?: any
  onEdit: () => void
}

// Styled Components
const ResultContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    margin: 0 0 10px 0;
  }

  p {
    color: #666;
    font-size: 16px;
    margin: 0;
  }
`

const Section = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;

  h2 {
    margin-top: 0;
    color: #333;
  }

  p {
    color: #555;
    line-height: 1.5;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: #ff6b6b;
          color: white;
          &:hover { background: #ff5252; }
        `
      case 'secondary':
        return `
          background: white;
          color: #667eea;
          border: 1.5px solid #667eea;
          &:hover { background: #f0f4ff; }
        `
      default:
        return `
          background: #667eea;
          color: white;
          &:hover { background: #5568d3; }
        `
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const StatusBox = styled.div<{ $type: 'info' | 'success' | 'warning' | 'error' }>`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid;
  font-size: 14px;

  ${(props) => {
    switch (props.$type) {
      case 'success':
        return `
          background: #d4edda;
          border-color: #28a745;
          color: #155724;
        `
      case 'warning':
        return `
          background: #fff3cd;
          border-color: #ffc107;
          color: #856404;
        `
      case 'error':
        return `
          background: #f8d7da;
          border-color: #dc3545;
          color: #721c24;
        `
      default:
        return `
          background: #d1ecf1;
          border-color: #17a2b8;
          color: #0c5460;
        `
    }
  }}
`

export default function ResultPage({ chartData, apiChartData, onEdit }: ResultPageProps) {
  const [desiredDiagram, setDesiredDiagram] = useState<DesiredDiagram | null>(null)
  const [collectedConstellations, setCollectedConstellations] = useState<Constellation[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [debugStatus, setDebugStatus] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Demo user ID based on chart location and name
  const DEMO_USER_ID = 'chart_' + (chartData?.location || 'demo').replace(/[^a-z0-9]/gi, '_').toLowerCase()

  // Ensure hydration completes before loading data
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      setDebugStatus('Starting load')
      loadData()
    }
  }, [isHydrated])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load constellations
      setDebugStatus('Loading collected constellations')
      const collRes = await fetch(`/api/qr/scan?userId=${DEMO_USER_ID}`)
      const collData = await collRes.json()
      if (collData.success) {
        setCollectedConstellations(collData.collected || [])
      }

      // Load diagram
      setDebugStatus('Loading diagrams')
      const diagRes = await fetch(`/api/diagrams?userId=${DEMO_USER_ID}`)
      const diagData = await diagRes.json()

      if (diagData.diagrams?.length > 0) {
        const diag = diagData.diagrams[0]
        setDesiredDiagram({
          id: diag.id,
          placements: diag.placements || [],
          expiresAt: new Date(diag.expiresAt),
          isLocked: diag.isLocked,
          status: diag.status,
        })
        setDebugStatus('Diagram loaded')
      } else {
        setDebugStatus('No diagrams found — creating new')
        await createDiagram()
      }
    } catch (err) {
      console.error('Load error:', err)
      setMessage({ type: 'error', text: 'Failed to load data' })
      setDebugStatus(`Load error: ${String(err)}`)
      await createDiagram()
    } finally {
      setLoading(false)
    }
  }

  // Helper: create a simple inline SVG data URL as a fallback original chart
  const generateFallbackSvgDataUrl = (data: any) => {
    const name = data?.name || 'Unknown'
    const date = data?.date || 'Unknown'
    const time = data?.time || 'Unknown'
    const location = data?.location || 'Unknown'

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>\n  <rect width='100%' height='100%' fill='#fff'/>\n  <text x='50%' y='18%' dominant-baseline='middle' text-anchor='middle' font-size='22' fill='#111' font-family='Arial'>Original Birth Chart</text>\n  <text x='50%' y='30%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='#333' font-family='Arial'>${name}</text>\n  <text x='50%' y='40%' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='#666' font-family='Arial'>${date} ${time}</text>\n  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='#666' font-family='Arial'>${location}</text>\n  <g transform='translate(300,360)'>\n    <circle r='160' fill='none' stroke='#e6e6e6' stroke-width='2'/>\n    <text x='0' y='0' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='#999'>Placeholder chart</text>\n  </g>\n</svg>`

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  const createDiagram = async () => {
    try {
      setDebugStatus('Creating desired diagram')
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: DEMO_USER_ID,
          originalChartId: 'chart_demo',
        }),
      })

      // If response is not JSON (e.g., HTML error page), capture the text for debugging
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const txt = await res.text()
        console.error('Create returned non-JSON response:', res.status, txt)
        setDebugStatus(`Create error: non-JSON response (status ${res.status})`)
        return
      }

      let data: any
      try {
        data = await res.json()
      } catch (jsonErr) {
        const txt = await res.text().catch(() => '<no body>')
        console.error('Create JSON parse error:', jsonErr, 'body:', txt)
        setDebugStatus(`Create error: SyntaxError parsing JSON`) 
        return
      }

      if (data && data.success) {
        setDesiredDiagram({
          id: data.diagram.id,
          placements: [],
          expiresAt: new Date(data.diagram.expiresAt),
          isLocked: false,
          status: 'active',
        })
        setMessage({ type: 'success', text: '✨ Desired Diagram created!' })
        setDebugStatus('Created new desired diagram')
      } else {
        console.error('Create API returned:', data)
        setDebugStatus('Create failed: API returned no success')
      }
    } catch (err) {
      console.error('Create error:', err)
      setDebugStatus(`Create error: ${String(err)}`)
    }
  }

  const scanQRCode = async (qrCode: string) => {
    try {
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          userId: DEMO_USER_ID,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({
          type: data.isNewConstellation ? 'success' : 'warning',
          text: data.message,
        })

        // Reload collections
        const collRes = await fetch(`/api/qr/scan?userId=${DEMO_USER_ID}`)
        const collData = await collRes.json()
        if (collData.success) {
          setCollectedConstellations(collData.collected || [])
        }
      }
    } catch (err) {
      console.error('QR error:', err)
      setMessage({ type: 'error', text: 'Failed to scan QR code' })
    }
  }

  const saveDiagram = async (placements: DiagramPlacement[]) => {
    if (!desiredDiagram) return

    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          userId: DEMO_USER_ID,
          diagramId: desiredDiagram.id,
          placements,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setDesiredDiagram({
          ...desiredDiagram,
          placements: data.diagram.placements || placements,
        })
        setShowEditor(false)
        setMessage({ type: 'success', text: '💾 Diagram saved!' })
      }
    } catch (err) {
      console.error('Save error:', err)
      setMessage({ type: 'error', text: 'Failed to save diagram' })
    }
  }

  const lockDiagram = async () => {
    if (!desiredDiagram) return

    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lock',
          userId: DEMO_USER_ID,
          diagramId: desiredDiagram.id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setDesiredDiagram({ ...desiredDiagram, isLocked: true })
        setMessage({ type: 'success', text: '🔒 Diagram locked!' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to lock diagram' })
    }
  }

  const resetDiagram = async () => {
    if (!desiredDiagram || !confirm('Reset diagram and collected constellations?')) return

    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          userId: DEMO_USER_ID,
          diagramId: desiredDiagram.id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setDesiredDiagram({
          ...desiredDiagram,
          placements: [],
          isLocked: false,
          status: 'active',
          expiresAt: new Date(data.diagram.expiresAt),
        })
        setShowEditor(true)
        setMessage({ type: 'success', text: '🔄 Diagram reset! 30 days added.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset diagram' })
    }
  }

  if (loading || !desiredDiagram) {
    return (
      <ResultContainer>
        <Header>
          <h1>✨ Two-Diagram System</h1>
          <p>Original Birth Chart (immutable) + Desired Diagram (editable with QR collection)</p>
        </Header>
        <Section style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>⏳ Loading your diagrams...</div>
          {debugStatus && (
            <div style={{ fontSize: 13, color: '#444' }}>Status: {debugStatus}</div>
          )}
          {!debugStatus && (
            <div style={{ fontSize: 12, color: '#999' }}>Starting...</div>
          )}
          {message && (
            <div style={{ marginTop: 12, color: message.type === 'error' ? '#721c24' : '#155724' }}>
              {message.text}
            </div>
          )}
        </Section>
      </ResultContainer>
    )
  }

  return (
    <ResultContainer>
      <Header>
        <h1>✨ Two-Diagram System</h1>
        <p>Original Birth Chart (immutable) + Desired Diagram (editable with QR collection)</p>
      </Header>

      {message && (
        <StatusBox $type={message.type as any}>
          {message.text}
        </StatusBox>
      )}

      {/* Diagram View - Original Chart + Nebula Matrix */}
      {desiredDiagram && (
        <>
          <TwoDiagramView
            originalChartData={{
              birthDate: chartData?.date || 'Unknown',
              birthTime: chartData?.time || 'Unknown',
              birthLocation: chartData?.location || 'Unknown',
              placements: [],
              chartSvgUrl:
                (apiChartData && apiChartData.chartSvgUrl) || generateFallbackSvgDataUrl(chartData),
            }}
            desiredDiagramData={desiredDiagram}
            collectedConstellations={collectedConstellations}
            onEditDesired={() => setShowEditor(true)}
            onCreateNewDesired={createDiagram}
          />

          {/* Nebula Energy Matrix - Replaces old desired diagram editor */}
          <NebulaMatrix diagramId={desiredDiagram.id} userId={DEMO_USER_ID} />
        </>
      )}

      {/* QR Scan Demo */}
      <Section>
        <h2>📱 Scan QR Codes to Collect Constellations</h2>
        <p>Click to simulate scanning a QR code (in production, use actual QR code scanner):</p>
        <ButtonGroup>
          {[
            { code: 'QR_const_aries', label: 'Aries ♈' },
            { code: 'QR_const_taurus', label: 'Taurus ♉' },
            { code: 'QR_const_gemini', label: 'Gemini ♊' },
            { code: 'QR_const_cancer', label: 'Cancer ♋' },
            { code: 'QR_const_leo', label: 'Leo ♌' },
            { code: 'QR_const_virgo', label: 'Virgo ♍' },
            { code: 'QR_const_libra', label: 'Libra ♎' },
            { code: 'QR_const_scorpio', label: 'Scorpio ♏' },
            { code: 'QR_const_sagittarius', label: 'Sagittarius ♐' },
            { code: 'QR_const_capricorn', label: 'Capricorn ♑' },
            { code: 'QR_const_aquarius', label: 'Aquarius ♒' },
            { code: 'QR_const_pisces', label: 'Pisces ♓' },
          ].map((item) => (
            <Button
              key={item.code}
              onClick={() => scanQRCode(item.code)}
              $variant="secondary"
            >
              {item.label}
            </Button>
          ))}
        </ButtonGroup>
        <p>
          <strong>📊 Collected:</strong> {collectedConstellations.length} constellation
          {collectedConstellations.length !== 1 ? 's' : ''}
          {collectedConstellations.length > 0 && (
            <>
              {' '}
              ({collectedConstellations
                .map((c) => c.name)
                .join(', ')})
            </>
          )}
        </p>
      </Section>

      {/* Editor - QR Scan Demo (kept for backward compatibility) */}
      {showEditor && desiredDiagram && (
        <Section>
          <h2>🎨 Collect Energies via QR Scan</h2>
          {collectedConstellations.length === 0 ? (
            <p style={{ color: '#666' }}>
              Scan QR codes below to collect constellation energies!
            </p>
          ) : (
            <>
              <p style={{ color: '#555' }}>
                You have {collectedConstellations.length} constellation
                {collectedConstellations.length !== 1 ? 's' : ''} collected.
              </p>
              <ButtonGroup style={{ marginTop: '20px' }}>
                <Button onClick={() => setShowEditor(false)}>✕ Close</Button>
              </ButtonGroup>
            </>
          )}
        </Section>
      )}

      {/* Controls */}
      <Section>
        <h2>🎮 Diagram Controls</h2>
        {desiredDiagram && (
          <>
            <p>
              <strong>Status:</strong> {desiredDiagram.status} | <strong>Locked:</strong>{' '}
              {desiredDiagram.isLocked ? '🔒 Yes' : '🔓 No'} | <strong>Placements:</strong>{' '}
              {desiredDiagram.placements.length}
            </p>
            <p>
              <strong>Expires:</strong> {desiredDiagram.expiresAt.toLocaleDateString()} at{' '}
              {desiredDiagram.expiresAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <ButtonGroup>
              <Button onClick={() => setShowEditor(!showEditor)}>
                {showEditor ? '✕ Close' : '✏️ Edit'} Diagram
              </Button>
              <Button
                onClick={lockDiagram}
                $variant={desiredDiagram.isLocked ? 'secondary' : 'primary'}
                disabled={desiredDiagram.isLocked}
              >
                🔒 Lock
              </Button>
              <Button onClick={resetDiagram} $variant="danger">
                🔄 Reset (30 days)
              </Button>
              <Button $variant="secondary" onClick={loadData}>
                🔃 Reload Data
              </Button>
            </ButtonGroup>
          </>
        )}
      </Section>
    </ResultContainer>
  )
}
