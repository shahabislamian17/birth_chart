import styled from 'styled-components'

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #0f0f0f;
`

export const FormContainer = styled.div`
  max-width: 600px;
  width: 100%;
  position: relative;
  padding: 40px 20px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: 60px 40px;
  }
  
  form {
    position: relative;
    z-index: 1;
  }
`

export const Title = styled.h1`
  font-family: 'gt-america', sans-serif;
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: #f5f5f5;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

export const Subtitle = styled.p`
  font-family: 'gt-america', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #b0b0b0;
  margin-bottom: 32px;
  text-align: center;
`

export const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &.text {
    margin-bottom: 24px;
  }
  
  &.location {
    margin-bottom: 8px;
  }
`

export const Label = styled.label`
  display: block;
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #f5f5f5;
  text-transform: lowercase;
`

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-family: 'gt-america', sans-serif;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #f5f5f5;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  &::placeholder {
    color: #666;
  }
  
  &[type='number'] {
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`

export const SelectWrapper = styled.div`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #f5f5f5;
    pointer-events: none;
  }
`

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  font-family: 'gt-america', sans-serif;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #f5f5f5;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
  
  option {
    padding: 8px;
    background-color: #1a1a1a;
    color: #f5f5f5;
  }
`

export const BirthInfoSection = styled.div`
  margin-bottom: 32px;
  
  h5 {
    font-family: 'gt-america', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 16px;
    color: #f5f5f5;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

export const BirthInfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

export const TimeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

export const LocationWrapper = styled.div`
  margin-bottom: 8px;
`

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
`

export const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #f5f5f5;
`

export const CheckboxLabel = styled.label`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #f5f5f5;
  cursor: pointer;
  line-height: 1.5;
`

export const Button = styled.button`
  width: 100%;
  padding: 16px 24px;
  font-family: 'gt-america', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  background-color: #f5f5f5;
  color: #0f0f0f;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: background-color 0.2s;
  margin-top: 32px;
  
  &:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
  
  &:active:not(:disabled) {
    background-color: #f5f5f5;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const ButtonIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`

export const InfoText = styled.p`
  font-family: 'gt-america', sans-serif;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #b0b0b0;
  margin-top: 8px;
  
  &.centered {
    text-align: center;
  }
  
  &.indented {
    margin-left: 24px;
  }
`

export const Link = styled.a`
  color: #f5f5f5;
  text-decoration: underline;
  text-underline-offset: 2px;
  
  &:hover {
    text-decoration: none;
    color: #e0e0e0;
  }
`

export const DecorativeContainer = styled.div`
  position: absolute;
  pointer-events: none;
  z-index: 0;
  
  &:first-of-type {
    right: -120px;
    top: 50%;
    transform: translateY(-50%);
    width: 300px;
    height: 300px;
  }
  
  &.bottom-stars {
    bottom: 20px;
    right: -80px;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  @media (max-width: 1200px) {
    display: none;
  }
`

export const ButterflyImage = styled.img`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 0;
  width: 259px;
  height: 264px;
  object-fit: contain;
`

export const StarImage = styled.img`
  position: absolute;
  z-index: 1;
  object-fit: contain;
  
  &.star-1 {
    top: 15%;
    right: 20px;
  }
  
  &.star-5-upper {
    top: 5%;
    right: 10px;
  }
  
  &.star-5-lower {
    top: 25%;
    right: 10px;
  }
  
  &.star-5 {
    bottom: 25%;
    right: 20px;
  }
  
  .bottom-stars & {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
  }
`

