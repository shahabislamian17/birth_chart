'use client'

import { useState, useRef } from 'react'
import styled from 'styled-components'

const EditorContainer = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`

const Canvas = styled.div`
  flex: 1;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 2px solid #ddd;
  border-radius: 8px;
  position: relative;
  cursor: grab;
  overflow: hidden;
  min-height: 400px;

  &:active {
    cursor: grabbing;
  }
`

const Constellation = styled.div<{ $isDragging?: boolean }>`
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  cursor: grab;
  transition: ${(props) => (props.$isDragging ? 'none' : 'transform 0.2s')};
  user-select: none;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:active {
    cursor: grabbing;
  }
`

const Controls = styled.div`
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1024px) {
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
  }
`

const ControlGroup = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
`

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-transform: uppercase;
`

const Slider = styled.input`
  width: 100%;
  cursor: pointer;
`

const ConstellationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
`

const ConstellationItem = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 5px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f0f4ff;
    border-color: #667eea;
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const ValueDisplay = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
`

interface Placement {
  id: string
  constellationId: string
  position: { x: number; y: number }
  zIndex: number
  scale: number
  rotation: number
}

interface EditorProps {
  diagramId: string
  userId: string
  collectedConstellations: Array<{ id: string; name: string; emoji: string }>
  onSave: (placements: Placement[]) => void
  initialPlacements?: Placement[]
  isLocked?: boolean
  expiresAt?: Date
}

export default function DesiredDiagramEditor({
  collectedConstellations,
  onSave,
  initialPlacements = [],
  isLocked = false,
}: EditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements)
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const selectedPlacement = placements.find((p) => p.id === selectedPlacementId)

  const addConstellation = (constellationId: string) => {
    const newPlacement: Placement = {
      id: 'place_' + Date.now(),
      constellationId,
      position: { x: 50, y: 50 },
      zIndex: placements.length,
      scale: 1,
      rotation: 0,
    }
    setPlacements([...placements, newPlacement])
    setSelectedPlacementId(newPlacement.id)
  }

  const updatePlacement = (id: string, updates: Partial<Placement>) => {
    setPlacements(placements.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const removePlacement = (id: string) => {
    setPlacements(placements.filter((p) => p.id !== id))
    if (selectedPlacementId === id) setSelectedPlacementId(null)
  }

  const handleMouseDown = (e: React.MouseEvent, placementId: string) => {
    if (isLocked) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const placement = placements.find((p) => p.id === placementId)
    if (!placement) return

    const rect = canvas.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top
    const placementX = (placement.position.x / 100) * rect.width
    const placementY = (placement.position.y / 100) * rect.height

    setDraggingId(placementId)
    setDragOffset({
      x: canvasX - placementX,
      y: canvasY - placementY,
    })
    setSelectedPlacementId(placementId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100))

    updatePlacement(draggingId, { position: { x, y } })
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  if (isLocked) {
    return (
      <ControlGroup style={{ textAlign: 'center', color: '#666' }}>
        🔒 This diagram is locked and cannot be edited.
      </ControlGroup>
    )
  }

  return (
    <EditorContainer
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Canvas ref={canvasRef}>
        {placements.map((placement) => {
          const constellation = collectedConstellations.find((c) => c.id === placement.constellationId)
          return (
            <Constellation
              key={placement.id}
              $isDragging={draggingId === placement.id}
              style={{
                left: `calc(${placement.position.x}% - 30px)`,
                top: `calc(${placement.position.y}% - 30px)`,
                transform: `scale(${placement.scale}) rotate(${placement.rotation}deg)`,
                zIndex: selectedPlacementId === placement.id ? 10 : 1,
                border: selectedPlacementId === placement.id ? '2px solid #ff6b6b' : '2px solid #667eea',
              }}
              onMouseDown={(e) => handleMouseDown(e, placement.id)}
              onClick={() => setSelectedPlacementId(placement.id)}
            >
              {constellation?.emoji}
            </Constellation>
          )
        })}
      </Canvas>

      <Controls>
        <ControlGroup>
          <Label>Available Constellations ({collectedConstellations.length})</Label>
          {collectedConstellations.length === 0 ? (
            <ValueDisplay>Scan QR codes to collect constellations</ValueDisplay>
          ) : (
            <ConstellationList>
              {collectedConstellations.map((c) => (
                <ConstellationItem key={c.id} onClick={() => addConstellation(c.id)}>
                  {c.emoji} {c.name}
                </ConstellationItem>
              ))}
            </ConstellationList>
          )}
        </ControlGroup>

        {selectedPlacement && (
          <>
            <ControlGroup>
              <Label>Scale</Label>
              <Slider
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={selectedPlacement.scale}
                onChange={(e) =>
                  updatePlacement(selectedPlacementId!, { scale: parseFloat(e.target.value) })
                }
              />
              <ValueDisplay>{(selectedPlacement.scale * 100).toFixed(0)}%</ValueDisplay>
            </ControlGroup>

            <ControlGroup>
              <Label>Rotation</Label>
              <Slider
                type="range"
                min="0"
                max="360"
                value={selectedPlacement.rotation}
                onChange={(e) =>
                  updatePlacement(selectedPlacementId!, { rotation: parseInt(e.target.value) })
                }
              />
              <ValueDisplay>{selectedPlacement.rotation}°</ValueDisplay>
            </ControlGroup>

            <ControlGroup>
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => removePlacement(selectedPlacementId!)}
              >
                Remove
              </button>
            </ControlGroup>
          </>
        )}

        <ControlGroup>
          <button
            style={{
              width: '100%',
              padding: '12px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
            onClick={() => onSave(placements)}
          >
            💾 Save
          </button>
          <button
            style={{
              width: '100%',
              padding: '12px',
              background: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
            onClick={() => setPlacements([])}
          >
            Clear All
          </button>
        </ControlGroup>
      </Controls>
    </EditorContainer>
  )
}
