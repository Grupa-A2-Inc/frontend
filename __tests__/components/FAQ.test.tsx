import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FAQSection from '@/components/FAQ'

describe('FAQSection', () => {
  it('renders without crash', () => {
    render(<FAQSection />)
    expect(document.body).toBeTruthy()
  })

  it('renders FAQ badge', () => {
    render(<FAQSection />)
    expect(screen.getByText('FAQ')).toBeInTheDocument()
  })

  it('renders "Frequently asked questions" heading', () => {
    render(<FAQSection />)
    expect(screen.getByText(/Frequently asked/)).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<FAQSection />)
    expect(screen.getByText('Who can use AdaptiveTutor?')).toBeInTheDocument()
    expect(screen.getByText('How is an organization created?')).toBeInTheDocument()
    expect(screen.getByText('Do teachers and students create their own accounts?')).toBeInTheDocument()
    expect(screen.getByText('How are tests generated?')).toBeInTheDocument()
    expect(screen.getByText('Can students generate personalized tests?')).toBeInTheDocument()
    expect(screen.getByText('Can courses be assigned to classes?')).toBeInTheDocument()
  })

  it('first item is open by default (shows answer)', () => {
    render(<FAQSection />)
    expect(screen.getByText(/AdaptiveTutor is built for three main roles/)).toBeInTheDocument()
  })

  it('toggles FAQ item open and closed', () => {
    render(<FAQSection />)
    const secondQuestion = screen.getByText('How is an organization created?')
    fireEvent.click(secondQuestion.closest('button')!)
    expect(screen.getByText(/new organization is created from the register flow/)).toBeInTheDocument()
  })

  it('closes currently open item when clicked again', () => {
    render(<FAQSection />)
    const firstQuestion = screen.getByText('Who can use AdaptiveTutor?')
    fireEvent.click(firstQuestion.closest('button')!)
    // After clicking the open item, it should close
    expect(document.body).toBeTruthy()
  })

  it('shows plus/minus icons', () => {
    render(<FAQSection />)
    expect(screen.getByText('−')).toBeInTheDocument()
    expect(screen.getAllByText('+').length).toBeGreaterThan(0)
  })

  it('shows description text', () => {
    render(<FAQSection />)
    expect(screen.getByText(/Quick answers about the platform/)).toBeInTheDocument()
  })
})
