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

  const escapePdfText = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

  const wrapText = (text: string, maxLength = 90) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach((word) => {
      if (!word) return
      const nextLine = currentLine ? `${currentLine} ${word}` : word
      if (nextLine.length <= maxLength) {
        currentLine = nextLine
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    })

    if (currentLine) lines.push(currentLine)
    return lines.length ? lines : [text]
  }

  const getCelestialSummary = () => {
    const month = Number(chartData?.month || 0)
    const day = Number(chartData?.date || 0)

    if (!month || !day) {
      return {
        sign: 'Unknown',
        description: 'The stars are still writing your cosmic story. Your birth chart is a unique signature of light, energy, and possibility.',
      }
    }

    const signData: Record<string, { name: string; element: string; trait: string; description: string }> = {
      aries: { name: 'Aries', element: 'fire', trait: 'bold', description: 'A bold and pioneering spirit, Aries brings courage, motion, and fresh beginnings to your path.' },
      taurus: { name: 'Taurus', element: 'earth', trait: 'grounded', description: 'A grounded and steady soul, Taurus brings calm strength, beauty, and lasting devotion to your journey.' },
      gemini: { name: 'Gemini', element: 'air', trait: 'curious', description: 'A curious and expressive mind, Gemini brings wit, movement, and a natural love of discovery.' },
      cancer: { name: 'Cancer', element: 'water', trait: 'nurturing', description: 'A nurturing and intuitive heart, Cancer brings emotional depth, protection, and deep inner wisdom.' },
      leo: { name: 'Leo', element: 'fire', trait: 'radiant', description: 'A radiant and confident presence, Leo brings warmth, creativity, and magnetic leadership.' },
      virgo: { name: 'Virgo', element: 'earth', trait: 'thoughtful', description: 'A thoughtful and discerning spirit, Virgo brings clarity, service, and elegant precision.' },
      libra: { name: 'Libra', element: 'air', trait: 'balanced', description: 'A balanced and harmonious soul, Libra brings charm, fairness, and a gift for meaningful connection.' },
      scorpio: { name: 'Scorpio', element: 'water', trait: 'intense', description: 'An intense and transformative presence, Scorpio brings depth, resilience, and powerful inner knowing.' },
      sagittarius: { name: 'Sagittarius', element: 'fire', trait: 'adventurous', description: 'An adventurous and visionary spirit, Sagittarius brings optimism, freedom, and a love of truth.' },
      capricorn: { name: 'Capricorn', element: 'earth', trait: 'disciplined', description: 'A disciplined and ambitious soul, Capricorn brings structure, purpose, and enduring strength.' },
      aquarius: { name: 'Aquarius', element: 'air', trait: 'visionary', description: 'A visionary and original mind, Aquarius brings insight, independence, and future-focused wisdom.' },
      pisces: { name: 'Pisces', element: 'water', trait: 'dreamy', description: 'A dreamy and compassionate heart, Pisces brings intuition, softness, and spiritual imagination.' },
    }

    const zodiac =
      (month === 1 && day >= 20) || (month === 2 && day <= 18)
        ? signData.aquarius
        : (month === 2 && day >= 19) || (month === 3 && day <= 20)
          ? signData.pisces
          : (month === 3 && day >= 21) || (month === 4 && day <= 19)
            ? signData.aries
            : (month === 4 && day >= 20) || (month === 5 && day <= 20)
              ? signData.taurus
              : (month === 5 && day >= 21) || (month === 6 && day <= 20)
                ? signData.gemini
                : (month === 6 && day >= 21) || (month === 7 && day <= 22)
                  ? signData.cancer
                  : (month === 7 && day >= 23) || (month === 8 && day <= 22)
                    ? signData.leo
                    : (month === 8 && day >= 23) || (month === 9 && day <= 22)
                      ? signData.virgo
                      : (month === 9 && day >= 23) || (month === 10 && day <= 22)
                        ? signData.libra
                        : (month === 10 && day >= 23) || (month === 11 && day <= 21)
                          ? signData.scorpio
                          : (month === 11 && day >= 22) || (month === 12 && day <= 21)
                            ? signData.sagittarius
                            : signData.capricorn

    return {
      sign: zodiac.name,
      description: `${zodiac.description} This ${zodiac.element} energy gives your life a ${zodiac.trait} rhythm.`,
    }
  }

  const downloadSummaryPdf = () => {
    const { sign, description } = getCelestialSummary()
    const summaryLines = [
      'Cosmos Breath Birth Chart',
      'Celestial Summary',
      '',
      `Name: ${chartData?.name || 'Unknown'}`,
      `Birth Date: ${chartData?.date || 'Unknown'} / ${chartData?.month || 'Unknown'} / ${chartData?.year || 'Unknown'}`,
      `Birth Time: ${chartData?.time || 'Unknown'}`,
      `Location: ${chartData?.location || 'Unknown'}`,
      '',
      `Your stars: ${sign}`,
      description,
      '',
      `Diagram Status: ${desiredDiagram?.status || 'Unknown'}`,
      `Locked: ${desiredDiagram?.isLocked ? 'Yes' : 'No'}`,
      `Placements: ${desiredDiagram?.placements?.length ?? 0}`,
      `Collected Constellations: ${collectedConstellations.length}`,
      `Constellations: ${
        collectedConstellations.length > 0
          ? collectedConstellations.map((entry) => entry.name).join(', ')
          : 'None yet'
      }`,
      '',
      'Generated from the Cosmos Breath Birth Chart experience',
    ]

    const contentCommands: string[] = []
    contentCommands.push('0.19 0.10 0.33 rg')
    contentCommands.push('50 690 512 92 re f')
    contentCommands.push('1 1 1 rg')
    contentCommands.push('BT /F2 18 Tf 70 748 Td (Cosmos Breath Birth Chart) Tj ET')
    contentCommands.push('BT /F1 10 Tf 70 728 Td (Your celestial signature) Tj ET')
    contentCommands.push('0.25 0.25 0.25 rg')
    contentCommands.push('50 670 512 1 re S')

    let yPosition = 635
    const addText = (text: string, size = 11, isBold = false, x = 60) => {
      const font = isBold ? 'F2' : 'F1'
      const escaped = escapePdfText(text)
      contentCommands.push(`BT /${font} ${size} Tf ${x} ${yPosition} Td (${escaped}) Tj ET`)
      yPosition -= size + 4
    }

    summaryLines.forEach((line, index) => {
      if (!line) {
        yPosition -= 6
        return
      }

      const wrapped = wrapText(line, 80)
      wrapped.forEach((wrappedLine, wrappedIndex) => {
        if (index === 0) {
          addText(wrappedLine, 18, true, 70)
        } else if (index === 1) {
          addText(wrappedLine, 12, false, 70)
        } else if (wrappedIndex === 0 && line.includes('Your stars:')) {
          addText(wrappedLine, 13, true, 60)
        } else if (wrappedIndex === 0 && line.includes('Name:')) {
          addText(wrappedLine, 11, true, 60)
        } else if (line.includes('Generated from')) {
          addText(wrappedLine, 9, false, 60)
        } else {
          addText(wrappedLine, 11, false, 60)
        }
      })
    })

    const contentStream = contentCommands.join('\n')
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ]

    const pdfParts: string[] = ['%PDF-1.4\n']
    const offsets: number[] = []

    objects.forEach((objectContent, index) => {
      offsets.push(pdfParts.join('').length)
      pdfParts.push(`${index + 1} 0 obj\n${objectContent}\nendobj\n`)
    })

    const xrefOffset = pdfParts.join('').length
    pdfParts.push(`xref\n0 ${objects.length + 1}\n`)
    pdfParts.push('0000000000 65535 f \n')
    offsets.forEach((offset) => {
      pdfParts.push(`${String(offset).padStart(10, '0')} 00000 n \n`)
    })
    pdfParts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

    const pdfBlob = new Blob([pdfParts.join('')], { type: 'application/pdf' })
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'birth-chart-summary.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
              <Button onClick={downloadSummaryPdf} $variant="secondary">
                ⬇️ Download PDF
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
