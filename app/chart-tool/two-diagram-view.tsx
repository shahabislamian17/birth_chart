'use client'

import styled from 'styled-components'

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const DiagramCard = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const Title = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`

const Badge = styled.span<{ $variant: 'original' | 'desired' }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;

  ${(props) =>
    props.$variant === 'original'
      ? `
    background: #f0f4ff;
    color: #667eea;
  `
      : `
    background: #f0fff4;
    color: #10b981;
  `}
`

const Chart = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  margin: 15px 0;
`

const Info = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.6;

  p {
    margin: 5px 0;
  }
`

const PlacementsList = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
`

const PlacementItem = styled.div`
  padding: 8px 0;
  font-size: 13px;
  color: #555;

  &:before {
    content: '◆ ';
    color: #667eea;
  }
`

const StatusInfo = styled.div`
  background: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
`

interface DesiredDiagramData {
  id: string
  placements: Array<{
    id: string
    constellationId: string
    position: { x: number; y: number }
    scale: number
    rotation: number
  }>
  expiresAt: Date
  isLocked: boolean
  status: string
}

interface DiagramViewProps {
  originalChartData?: any
  desiredDiagramData: DesiredDiagramData
  collectedConstellations: Array<{ id: string; name: string; symbol: string; emoji: string }>
  onEditDesired: () => void
  onCreateNewDesired: () => void
}

export default function TwoDiagramView({
  originalChartData,
  desiredDiagramData,
  collectedConstellations,
  onEditDesired,
}: DiagramViewProps) {
  const timeRemaining = Math.ceil(
    (desiredDiagramData.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Container>
      {/* Original Diagram */}
      <DiagramCard>
        <Badge $variant="original">ORIGINAL</Badge>
        <Title>🔒 Original Birth Chart</Title>
        <Chart>
          {originalChartData?.chartSvgUrl ? (
            // Display SVG or image URL returned from chart API
            // Use img to load the SVG URL
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={originalChartData.chartSvgUrl}
              alt="Original Birth Chart"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }}
            />
          ) : (
            'Birth Chart Visualization'
          )}
        </Chart>
        <Info>
          <p>
            <strong>Date:</strong> {originalChartData?.birthDate || 'Unknown'}
          </p>
          <p>
            <strong>Time:</strong> {originalChartData?.birthTime || 'Unknown'}
          </p>
          <p>
            <strong>Location:</strong> {originalChartData?.birthLocation || 'Unknown'}
          </p>
        </Info>
        <StatusInfo>This diagram never changes and is immutable.</StatusInfo>
      </DiagramCard>

      {/* Desired Diagram */}
      <DiagramCard>
        <Badge $variant="desired">DESIRED</Badge>
        <Title>✨ Desired Diagram</Title>
        <Chart>Desired Diagram Canvas</Chart>
        <PlacementsList>
          <strong>Placements ({desiredDiagramData.placements.length})</strong>
          {desiredDiagramData.placements.length === 0 ? (
            <p style={{ color: '#999', marginTop: '8px' }}>No placements yet</p>
          ) : (
            desiredDiagramData.placements.map((placement) => {
              const constellation = collectedConstellations.find((c) => c.id === placement.constellationId)
              return (
                <PlacementItem key={placement.id}>
                  {constellation?.emoji} {constellation?.name}
                </PlacementItem>
              )
            })
          )}
        </PlacementsList>
        <StatusInfo>
          <div>
            <strong>Status:</strong> {desiredDiagramData.status} ({timeRemaining} days)
          </div>
          <div>
            <strong>Locked:</strong> {desiredDiagramData.isLocked ? '🔒 Yes' : '🔓 No'}
          </div>
        </StatusInfo>
      </DiagramCard>
    </Container>
  )
}
