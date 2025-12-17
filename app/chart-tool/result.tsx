'use client'

import { useState } from 'react'
import {
  ResultContainer,
  ChartSection,
  ToggleButtons,
  ToggleButton,
  ChartWrapper,
  ChartPlaceholder,
  ChartInstructions,
  WandIcon,
  TableWrapper,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableIcon,
  ResultContent,
  HeaderSection,
  ChartTitle,
  InfoSection,
  InfoRow,
  InfoLabel,
  InfoValue,
  EditButton,
  Divider,
  AppSection,
  AppContent,
  AppLogo,
  AppText,
  AppButtons,
  AppButton,
  AppButtonText,
  AppButtonIcon,
  Section,
  SectionTitle,
  PlacementItem,
  PlacementHeader,
  PlacementIcon,
  PlacementInfo,
  PlacementDesc,
  PlacementDetail,
  InterpretationSection,
  InterpretationTitle,
  InterpretationText,
} from './result-styles'
import { generateInterpretation } from './interpretations'

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

interface ResultPageProps {
  chartData: ChartData
  apiChartData?: any
  onEdit: () => void
}

// Sample chart data - in a real app, this would come from an astrology API
const sampleChartData = {
  keys: [
    {
      icon: '/glyphs/placements/ac.png',
      name: 'Rising',
      sign: 'Taurus',
      degree: '12°',
      house: '1st House',
      desc: 'Your motivation for living life',
      detail: 'Ascendent in Taurus in the 1st House of self, appearance, vitality, and life force',
    },
    {
      icon: '/glyphs/placements/sun.png',
      name: 'Sun',
      sign: 'Capricorn',
      degree: '25°',
      house: '9th House',
      desc: 'Your identity and where you shine',
      detail: 'Sun in Capricorn in the 9th House of travel, education, publishing, religion, astrology, and philosophy',
    },
    {
      icon: '/glyphs/placements/moon.png',
      name: 'Moon',
      sign: 'Virgo',
      degree: '20°',
      house: '5th House',
      desc: 'Your body and emotions',
      detail: 'Moon in Virgo in the 5th House of pleasure, romance, creative energy, and children',
    },
  ],
  planets: [
    {
      icon: '/glyphs/placements/mercury.png',
      name: 'Mercury',
      sign: 'Capricorn',
      degree: '11°',
      house: '9th House',
      desc: 'How and where you communicate',
      detail: 'Mercury in Capricorn in the 9th House of travel, education, publishing, religion, astrology, and philosophy',
    },
    {
      icon: '/glyphs/placements/venus.png',
      name: 'Venus',
      sign: 'Aquarius',
      degree: '0°',
      house: '10th House',
      desc: 'How and where you connect',
      detail: 'Venus in Aquarius in the 10th House of career and public roles',
    },
    {
      icon: '/glyphs/placements/mars.png',
      name: 'Mars',
      sign: 'Sagittarius',
      degree: '20°',
      house: '8th House',
      desc: 'How and where you take action',
      detail: "Mars in Sagittarius in the 8th House of death, mental health, and other people's resources",
    },
    {
      icon: '/glyphs/placements/jupiter.png',
      name: 'Jupiter',
      sign: 'Cancer',
      degree: '3°',
      house: '3rd House',
      desc: 'How and where you create abundance',
      detail: 'Jupiter in Cancer in the 3rd House of communication, daily rituals, siblings, and extended family',
    },
    {
      icon: '/glyphs/placements/saturn.png',
      name: 'Saturn',
      sign: 'Capricorn',
      degree: '17°',
      house: '9th House',
      desc: 'How and where you create boundaries',
      detail: 'Saturn in Capricorn in the 9th House of travel, education, publishing, religion, astrology, and philosophy',
    },
    {
      icon: '/glyphs/placements/uranus.png',
      name: 'Uranus',
      sign: 'Capricorn',
      degree: '6°',
      house: '9th House',
      desc: 'How and where you innovate and disrupt',
      detail: 'Uranus in Capricorn in the 9th House of travel, education, publishing, religion, astrology, and philosophy',
    },
    {
      icon: '/glyphs/placements/neptune.png',
      name: 'Neptune',
      sign: 'Capricorn',
      degree: '12°',
      house: '9th House',
      desc: 'How and where you use your imagination',
      detail: 'Neptune in Capricorn in the 9th House of travel, education, publishing, religion, astrology, and philosophy',
    },
    {
      icon: '/glyphs/placements/pluto.png',
      name: 'Pluto',
      sign: 'Scorpio',
      degree: '17°',
      house: '7th House',
      desc: 'How and where you hold secret power',
      detail: 'Pluto in Scorpio in the 7th House of committed partnerships',
    },
  ],
  angles: [
    {
      icon: '/glyphs/placements/dc.png',
      name: 'DC',
      sign: 'Scorpio',
      degree: '12°',
      house: '7th House',
      desc: 'Your committed relationships',
      detail: 'DC in Scorpio in the 7th House of committed partnerships',
    },
    {
      icon: '/glyphs/placements/mc.png',
      name: 'MC',
      sign: 'Capricorn',
      degree: '23°',
      house: '9th House',
      desc: 'Your public image and vocation',
      detail: 'MC in Capricorn in the 9th House of travel, education, publishing, religion, astrology, and philosophy',
    },
    {
      icon: '/glyphs/placements/ic.png',
      name: 'IC',
      sign: 'Cancer',
      degree: '23°',
      house: '3rd House',
      desc: 'Your ancestry and home',
      detail: 'IC in Cancer in the 3rd House of communication, daily rituals, siblings, and extended family',
    },
  ],
  points: [
    {
      icon: '/glyphs/placements/northnode.png',
      name: 'North Node',
      sign: 'Aquarius',
      degree: '16°',
      house: '10th House',
      desc: "How and where you're insatiable",
      detail: 'North Node in Aquarius in the 10th House of career and public roles',
    },
    {
      icon: '/glyphs/placements/southnode.png',
      name: 'South Node',
      sign: 'Leo',
      degree: '16°',
      house: '4th House',
      desc: 'How and where you learn to let go',
      detail: 'South Node in Leo in the 4th House of parents, caregivers, foundations, and home',
    },
    {
      icon: '/glyphs/placements/lillith.png',
      name: 'Black Moon Lilith',
      sign: 'Scorpio',
      degree: '14°',
      house: '7th House',
      desc: "How and where you're defiant",
      detail: 'Black Moon Lilith in Scorpio in the 7th House of committed partnerships',
    },
    {
      icon: '/glyphs/placements/chiron.png',
      name: 'Chiron',
      sign: 'Cancer',
      degree: '12°',
      house: '3rd House',
      desc: 'How and where you find healing',
      detail: 'Chiron in Cancer in the 3rd House of communication, daily rituals, siblings, and extended family',
    },
    {
      icon: '/glyphs/placements/pallas-athena.png',
      name: 'Pallas Athena',
      sign: 'Aries',
      degree: '5°',
      house: '12th House',
      desc: 'How and where you strategize',
      detail: 'Pallas Athena in Aries in the 12th House of sorrow, loss, daemon, and hidden life',
    },
  ],
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function ResultPage({ chartData, apiChartData, onEdit }: ResultPageProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')
  
  // Debug: Log the API chart data (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('ResultPage - apiChartData:', apiChartData)
    console.log('ResultPage - chartSvgUrl:', apiChartData?.chartSvgUrl)
  }

  const formatDate = () => {
    const monthName = monthNames[parseInt(chartData.month) - 1] || ''
    return `${monthName} ${chartData.date}, ${chartData.year}`
  }

  const formatTime = () => {
    return `${chartData.hour}:${chartData.minute.padStart(2, '0')} ${chartData.ampm.toLowerCase()}`
  }

  const displayName = chartData.name.toUpperCase()

  return (
    <ResultContainer>
      <ChartSection>
        <ToggleButtons>
          <ToggleButton
            $active={viewMode === 'chart'}
            onClick={() => setViewMode('chart')}
          >
            CHART
          </ToggleButton>
          <ToggleButton
            $active={viewMode === 'table'}
            onClick={() => setViewMode('table')}
          >
            TABLE
          </ToggleButton>
        </ToggleButtons>

        {viewMode === 'chart' ? (
          <ChartWrapper>
            {(apiChartData?.chartSvgUrl || apiChartData?.output) ? (
              <>
                <img
                  src={apiChartData.chartSvgUrl || apiChartData.output}
                  alt="Birth Chart"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    console.error('Failed to load chart image:', apiChartData.chartSvgUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => {
                    console.log('Chart image loaded successfully')
                  }}
                />
                <ChartInstructions>
                  <WandIcon
                    src="https://production-chani-web-f5e5589aaeda.herokuapp.com/glyphs/icons/star-wand-blk.png"
                    alt="Black Star Wand"
                  />
                  <div>
                    <p>Click the chart to check the aspects</p>
                    <p>(aka the relationships between planets)</p>
                  </div>
                </ChartInstructions>
              </>
            ) : (
              <>
                <ChartPlaceholder>
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                      {apiChartData ? 'Loading chart...' : 'Birth Chart Visualization'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      {apiChartData 
                        ? 'Waiting for chart to generate...' 
                        : 'Chart visualization would appear here. In a production app, this would be generated using an astrology library or API.'}
                    </p>
                    {apiChartData && !apiChartData.chartSvgUrl && (
                      <p style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>
                        API Response: {JSON.stringify(apiChartData, null, 2)}
                      </p>
                    )}
                  </div>
                </ChartPlaceholder>
                <ChartInstructions>
                  <WandIcon
                    src="https://production-chani-web-f5e5589aaeda.herokuapp.com/glyphs/icons/star-wand-blk.png"
                    alt="Black Star Wand"
                  />
                  <div>
                    <p>Click the chart to check the aspects</p>
                    <p>(aka the relationships between planets)</p>
                  </div>
                </ChartInstructions>
              </>
            )}
          </ChartWrapper>
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <TableHeaderCell>Planet/Point</TableHeaderCell>
                  <TableHeaderCell>Sign</TableHeaderCell>
                  <TableHeaderCell>Degree</TableHeaderCell>
                  <TableHeaderCell>House</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {[
                  ...sampleChartData.keys,
                  ...sampleChartData.planets,
                  ...sampleChartData.angles,
                  ...sampleChartData.points,
                ].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TableIcon
                        src={`https://production-chani-web-f5e5589aaeda.herokuapp.com${item.icon}`}
                        alt={item.name}
                      />
                      {item.name}
                    </TableCell>
                    <TableCell>{item.sign}</TableCell>
                    <TableCell>{item.degree}</TableCell>
                    <TableCell>{item.house}</TableCell>
                    <TableCell>{item.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </ChartSection>

      <ResultContent>
        <HeaderSection>
          <ChartTitle>{displayName}'s Birth Chart</ChartTitle>
          <InfoSection>
            <InfoRow>
              <InfoLabel>Date:</InfoLabel>
              <InfoValue>{formatDate()}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Time:</InfoLabel>
              <InfoValue>{formatTime()}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Location:</InfoLabel>
              <InfoValue>{chartData.location}</InfoValue>
            </InfoRow>
            <EditButton onClick={onEdit}>Edit</EditButton>
          </InfoSection>
        </HeaderSection>


        <Section>
          <SectionTitle>The Keys to {chartData.name}'s Chart</SectionTitle>
          {sampleChartData.keys.map((item, index) => (
            <PlacementItem key={index}>
              <PlacementHeader>
                <PlacementIcon
                  src={`https://production-chani-web-f5e5589aaeda.herokuapp.com${item.icon}`}
                  alt={item.name}
                />
                <PlacementInfo>
                  {item.name} | {item.sign} | {item.degree} | {item.house}
                </PlacementInfo>
              </PlacementHeader>
              <PlacementDesc>{item.desc}</PlacementDesc>
              <PlacementDetail>{item.detail}</PlacementDetail>
              {(() => {
                const interpretation = generateInterpretation({
                  name: item.name,
                  sign: item.sign,
                  degree: item.degree,
                  house: item.house
                })
                return (
                  <InterpretationSection>
                    <InterpretationTitle>What You Are</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouAre}</InterpretationText>
                    
                    <InterpretationTitle>What You Become</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouBecome}</InterpretationText>
                    
                    <InterpretationTitle>Detailed Analysis</InterpretationTitle>
                    <InterpretationText>{interpretation.detailedAnalysis}</InterpretationText>
                  </InterpretationSection>
                )
              })()}
            </PlacementItem>
          ))}
        </Section>

        <Section>
          <SectionTitle>The Planets</SectionTitle>
          {sampleChartData.planets.map((item, index) => (
            <PlacementItem key={index}>
              <PlacementHeader>
                <PlacementIcon
                  src={`https://production-chani-web-f5e5589aaeda.herokuapp.com${item.icon}`}
                  alt={item.name}
                />
                <PlacementInfo>
                  {item.name} | {item.sign} | {item.degree} | {item.house}
                </PlacementInfo>
              </PlacementHeader>
              <PlacementDesc>{item.desc}</PlacementDesc>
              <PlacementDetail>{item.detail}</PlacementDetail>
              {(() => {
                const interpretation = generateInterpretation({
                  name: item.name,
                  sign: item.sign,
                  degree: item.degree,
                  house: item.house
                })
                return (
                  <InterpretationSection>
                    <InterpretationTitle>What You Are</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouAre}</InterpretationText>
                    
                    <InterpretationTitle>What You Become</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouBecome}</InterpretationText>
                    
                    <InterpretationTitle>Detailed Analysis</InterpretationTitle>
                    <InterpretationText>{interpretation.detailedAnalysis}</InterpretationText>
                  </InterpretationSection>
                )
              })()}
            </PlacementItem>
          ))}
        </Section>

        <Section>
          <SectionTitle>The Angles</SectionTitle>
          {sampleChartData.angles.map((item, index) => (
            <PlacementItem key={index}>
              <PlacementHeader>
                <PlacementIcon
                  src={`https://production-chani-web-f5e5589aaeda.herokuapp.com${item.icon}`}
                  alt={item.name}
                />
                <PlacementInfo>
                  {item.name} | {item.sign} | {item.degree} | {item.house}
                </PlacementInfo>
              </PlacementHeader>
              <PlacementDesc>{item.desc}</PlacementDesc>
              <PlacementDetail>{item.detail}</PlacementDetail>
              {(() => {
                const interpretation = generateInterpretation({
                  name: item.name,
                  sign: item.sign,
                  degree: item.degree,
                  house: item.house
                })
                return (
                  <InterpretationSection>
                    <InterpretationTitle>What You Are</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouAre}</InterpretationText>
                    
                    <InterpretationTitle>What You Become</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouBecome}</InterpretationText>
                    
                    <InterpretationTitle>Detailed Analysis</InterpretationTitle>
                    <InterpretationText>{interpretation.detailedAnalysis}</InterpretationText>
                  </InterpretationSection>
                )
              })()}
            </PlacementItem>
          ))}
        </Section>

        <Section>
          <SectionTitle>The Points, Minor Planets and Asteroids</SectionTitle>
          {sampleChartData.points.map((item, index) => (
            <PlacementItem key={index}>
              <PlacementHeader>
                <PlacementIcon
                  src={`https://production-chani-web-f5e5589aaeda.herokuapp.com${item.icon}`}
                  alt={item.name}
                />
                <PlacementInfo>
                  {item.name} | {item.sign} | {item.degree} | {item.house}
                </PlacementInfo>
              </PlacementHeader>
              <PlacementDesc>{item.desc}</PlacementDesc>
              <PlacementDetail>{item.detail}</PlacementDetail>
              {(() => {
                const interpretation = generateInterpretation({
                  name: item.name,
                  sign: item.sign,
                  degree: item.degree,
                  house: item.house
                })
                return (
                  <InterpretationSection>
                    <InterpretationTitle>What You Are</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouAre}</InterpretationText>
                    
                    <InterpretationTitle>What You Become</InterpretationTitle>
                    <InterpretationText>{interpretation.whatYouBecome}</InterpretationText>
                    
                    <InterpretationTitle>Detailed Analysis</InterpretationTitle>
                    <InterpretationText>{interpretation.detailedAnalysis}</InterpretationText>
                  </InterpretationSection>
                )
              })()}
            </PlacementItem>
          ))}
        </Section>
      </ResultContent>
    </ResultContainer>
  )
}

