'use client'

import { useState, useRef, useEffect } from 'react'
import Script from 'next/script'
import {
  Container,
  FormContainer,
  Title,
  Subtitle,
  FormGroup,
  Label,
  Input,
  Select,
  SelectWrapper,
  BirthInfoSection,
  BirthInfoRow,
  TimeRow,
  LocationWrapper,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Button,
  ButtonIcon,
  InfoText,
  Link,
  DecorativeContainer,
  StarImage,
  ButterflyImage,
} from './styles'
import ResultPage from './result'

declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

export default function ChartToolPage() {
  const [formData, setFormData] = useState({
    name: '',
    month: '',
    date: '',
    year: '',
    hour: '',
    minute: '',
    ampm: '',
    location: '',
    email: '',
    subscribe: false,
  })
  const [showResult, setShowResult] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<any>(null)

  const locationInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && locationInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ['(cities)'],
        }
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place.formatted_address) {
          setFormData((prev) => ({
            ...prev,
            location: place.formatted_address,
          }))
        }
      })
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.month || !formData.date || !formData.year || 
        !formData.hour || !formData.minute || !formData.ampm || !formData.location) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Call the API route
      const response = await fetch('/api/calculate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log('API response:', result)
      
      if (result.success && result.data) {
        // Store the chart data
        console.log('Setting chart data:', result.data)
        setChartData(result.data)
        setShowResult(true)
      } else {
        // If API fails, still show result with sample data
        console.warn('API call failed, using sample data:', result.message || result.error)
        // Still pass the result data even if success is false, in case there's useful info
        if (result.data) {
          setChartData(result.data)
        } else {
          setChartData(null)
        }
        setShowResult(true)
      }
    } catch (error) {
      console.error('Error calculating chart:', error)
      // Still show result with sample data on error
      setShowResult(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setShowResult(false)
  }

  // Show result page if form is submitted
  if (showResult) {
    return (
      <ResultPage
        chartData={{
          name: formData.name,
          date: formData.date,
          time: `${formData.hour}:${formData.minute} ${formData.ampm}`,
          location: formData.location,
          month: formData.month,
          year: formData.year,
          hour: formData.hour,
          minute: formData.minute,
          ampm: formData.ampm,
        }}
        apiChartData={chartData}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.google && locationInputRef.current && !autocompleteRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
              locationInputRef.current,
              {
                types: ['(cities)'],
              }
            )

            autocompleteRef.current.addListener('place_changed', () => {
              const place = autocompleteRef.current.getPlace()
              if (place.formatted_address) {
                setFormData((prev) => ({
                  ...prev,
                  location: place.formatted_address,
                }))
              }
            })
          }
        }}
      />
      <Container>
        <FormContainer>
          <form onSubmit={handleSubmit}>
            <div>
              <Title>Birth Chart</Title>
              <Subtitle>
                Input your birth info to get a snapshot of the sky the moment you were born.
              </Subtitle>
            </div>

            <FormGroup>
              <Label>name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Your name (or whoever you're creeping 👀)"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormGroup>

            <BirthInfoSection>
              <h5>Birth Information</h5>
              <BirthInfoRow>
                <FormGroup>
                  <Label>month</Label>
                  <SelectWrapper>
                    <Select
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled hidden>
                        Select
                      </option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </Select>
                  </SelectWrapper>
                </FormGroup>

                <FormGroup>
                  <Label>date</Label>
                  <Input
                    type="number"
                    name="date"
                    placeholder="DD"
                    value={formData.date}
                    onChange={handleInputChange}
                    min="1"
                    max="31"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>year</Label>
                  <Input
                    type="number"
                    name="year"
                    placeholder="YYYY"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="1900"
                    max="2100"
                  />
                </FormGroup>
              </BirthInfoRow>
            </BirthInfoSection>

            <BirthInfoSection>
              <TimeRow>
                <FormGroup>
                  <Label>hour</Label>
                  <Input
                    type="number"
                    name="hour"
                    placeholder="HH"
                    value={formData.hour}
                    onChange={handleInputChange}
                    min="1"
                    max="12"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>minute</Label>
                  <Input
                    type="number"
                    name="minute"
                    placeholder="MM"
                    value={formData.minute}
                    onChange={handleInputChange}
                    min="0"
                    max="59"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>am/pm</Label>
                  <SelectWrapper>
                    <Select
                      name="ampm"
                      value={formData.ampm}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled hidden>
                        Select
                      </option>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </Select>
                  </SelectWrapper>
                </FormGroup>
              </TimeRow>

              <InfoText>
                FYI: Birth time determines key pieces of a chart, including rising sign. If you
                don't know the exact time,{' '}
                <Link
                  href="https://www.chani.com/astro-education/how-can-i-work-with-my-astrology-chart-if-i-dont-know-my-birth-time#:~:text=To%20do%20this%2C%20simply%20Google,including%20your%20birthdate%20and%20place"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  click here
                </Link>
                . You can also enter 12:00 pm, knowing that the reading will be less precise.
              </InfoText>
            </BirthInfoSection>

            <BirthInfoSection>
              <LocationWrapper>
                <Label>location</Label>
                <FormGroup>
                  <Input
                    ref={locationInputRef}
                    type="text"
                    name="location"
                    placeholder="I was born in…"
                    value={formData.location}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                </FormGroup>
              </LocationWrapper>
              <InfoText>
                Yes, we need this. Birthplace informs the position of the planets in a chart.
              </InfoText>
            </BirthInfoSection>

            <FormGroup>
              <Label>email</Label>
              <Input
                type="email"
                name="email"
                placeholder="yourname@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormGroup>

            <BirthInfoSection>
              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  id="subscribe"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleInputChange}
                />
                <CheckboxLabel htmlFor="subscribe">
                  Check this box to get astro wisdom in your inbox ✨
                </CheckboxLabel>
              </CheckboxWrapper>
              <InfoText style={{ marginLeft: '24px' }}>
                From personalized horoscopes to comprehensive guides and Astro 101 resources, we'll
                send you everything you need to navigate the current and upcoming astrology, and
                nothing more. By signing up, you agree to our{' '}
                <Link
                  href="https://www.chani.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
                .
              </InfoText>
            </BirthInfoSection>

            <Button type="submit" disabled={isLoading}>
              <ButtonIcon
                src="https://production-chani-web-f5e5589aaeda.herokuapp.com/glyphs/icons/star-wand.png"
                alt="wand icon"
              />
              {isLoading ? 'LOADING...' : 'Calculate Chart'}
            </Button>

            <div style={{ marginTop: '24px' }}>
              <InfoText>P.S. We respect your privacy and will not share your personal information.</InfoText>
            </div>
          </form>

          <DecorativeContainer>
            <ButterflyImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/enter-butterfly.png"
              alt=""
              width={259}
              height={264}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-1.png"
              alt=""
              className="star-1"
              width={24}
              height={21}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-5.png"
              alt=""
              className="star-5-upper"
              width={32}
              height={30}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-5.png"
              alt=""
              className="star-5-lower"
              width={32}
              height={30}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-1.png"
              alt=""
              className="star-1"
              width={24}
              height={21}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-5.png"
              alt=""
              className="star-5"
              width={32}
              height={29}
            />
          </DecorativeContainer>

          <DecorativeContainer className="bottom-stars">
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-1.png"
              alt=""
              className="star-1"
              width={24}
              height={21}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-5.png"
              alt=""
              className="star-5-upper"
              width={32}
              height={30}
            />
            <StarImage
              src="https://production-chani-web-f5e5589aaeda.herokuapp.com/stickers/star-5.png"
              alt=""
              className="star-5-lower"
              width={32}
              height={30}
            />
          </DecorativeContainer>
        </FormContainer>
      </Container>
    </>
  )
}

