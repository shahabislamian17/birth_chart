import styled from 'styled-components'

export const ResultContainer = styled.div`
  min-height: 100vh;
  background-color: #0f0f0f;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
`

export const ChartSection = styled.div`
  position: sticky;
  top: 20px;
  background-color: #0f0f0f;
  z-index: 10;
  padding: 20px 0;
  
  @media (max-width: 767px) {
    position: relative;
    top: 0;
    margin-bottom: 40px;
  }
`

export const ToggleButtons = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  justify-content: flex-start;
  
  @media (max-width: 767px) {
    justify-content: center;
  }
`

export const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 8px 24px;
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) => (props.$active ? '#f5f5f5' : '#1a1a1a')};
  color: ${(props) => (props.$active ? '#0f0f0f' : '#f5f5f5')};
  border: 1px solid #333;
  border-right: none;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-right: 1px solid #333;
    border-radius: 0 4px 4px 0;
  }
  
  &:hover {
    background-color: ${(props) => (props.$active ? '#f5f5f5' : '#2a2a2a')};
  }
`

export const ChartWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  @media (max-width: 767px) {
    min-height: 400px;
    aspect-ratio: auto;
  }
`

export const TableWrapper = styled.div`
  width: 100%;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  max-height: 600px;
  overflow-y: auto;
  
  @media (max-width: 767px) {
    max-height: 500px;
  }
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'gt-america', sans-serif;
`

export const TableHeader = styled.thead`
  background-color: #2a2a2a;
  color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
`

export const TableHeaderRow = styled.tr``

export const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:first-child {
    padding-left: 20px;
  }
  
  &:last-child {
    padding-right: 20px;
  }
`

export const TableBody = styled.tbody``

export const TableRow = styled.tr`
  border-bottom: 1px solid #333;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  &:last-child {
    border-bottom: none;
  }
`

export const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #f5f5f5;
  
  &:first-child {
    padding-left: 20px;
    font-weight: 500;
  }
  
  &:last-child {
    padding-right: 20px;
  }
`

export const TableIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  vertical-align: middle;
  margin-right: 8px;
`

export const ChartPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ChartInstructions = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  p {
    font-family: 'gt-america', sans-serif;
    font-size: 0.75rem;
    color: #b0b0b0;
    margin: 0;
    text-align: center;
  }
`

export const WandIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`

export const ResultContent = styled.div`
  width: 100%;
  padding: 0;
  
  @media (max-width: 767px) {
    padding: 0;
  }
`

export const HeaderSection = styled.div`
  margin-bottom: 32px;
`

export const ChartTitle = styled.h1`
  font-family: 'gt-america', sans-serif;
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 24px;
  color: #f5f5f5;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`

export const InfoSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
`

export const InfoRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: baseline;
`

export const InfoLabel = styled.span`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #f5f5f5;
`

export const InfoValue = styled.span`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  color: #b0b0b0;
`

export const EditButton = styled.button`
  padding: 8px 16px;
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #f5f5f5;
  color: #0f0f0f;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: auto;
  
  &:hover {
    background-color: #e0e0e0;
  }
`

export const Divider = styled.img`
  width: 100%;
  max-width: 600px;
  margin: 32px auto;
  display: block;
`

export const AppSection = styled.div`
  margin: 40px 0;
  padding: 32px;
  background-color: #1a1a1a;
  border-radius: 8px;
`

export const AppContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`

export const AppLogo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 12px;
`

export const AppText = styled.p`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  color: #b0b0b0;
  margin: 0;
  text-align: center;
  
  @media (min-width: 768px) {
    text-align: left;
  }
`

export const AppButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`

export const AppButton = styled.button`
  padding: 12px 20px;
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #f5f5f5;
  color: #0f0f0f;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`

export const AppButtonText = styled.p`
  margin: 0;
  text-transform: lowercase;
`

export const AppButtonIcon = styled.img`
  width: 17px;
  height: 17px;
  object-fit: contain;
`

export const Section = styled.section`
  margin: 48px 0;
  
  &:first-of-type {
    margin-top: 0;
  }
`

export const SectionTitle = styled.h5`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 24px;
  color: #f5f5f5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const PlacementItem = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

export const PlacementHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`

export const PlacementIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`

export const PlacementInfo = styled.span`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #f5f5f5;
`

export const PlacementDesc = styled.p`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  color: #b0b0b0;
  margin: 8px 0;
`

export const PlacementDetail = styled.p`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  color: #888;
  margin: 4px 0 0;
  line-height: 1.6;
`

export const InterpretationSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #333;
`

export const InterpretationTitle = styled.h6`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f5f5f5;
  margin: 16px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:first-child {
    margin-top: 0;
  }
`

export const InterpretationText = styled.p`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  color: #e0e0e0;
  margin: 0 0 16px;
  line-height: 1.8;
  
  &:last-child {
    margin-bottom: 0;
  }
`

