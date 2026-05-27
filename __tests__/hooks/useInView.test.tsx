import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useRef } from 'react'
import { useInView } from '@/hooks/useInView'
import React from 'react'

let observerCallback: IntersectionObserverCallback
let observeTarget: Element | null = null
let disconnectCalled = false

class MockIntersectionObserverWithCallback {
  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    observerCallback = callback
  }
  observe(el: Element) { observeTarget = el }
  unobserve = vi.fn()
  disconnect() { disconnectCalled = true }
}

beforeEach(() => {
  observeTarget = null
  disconnectCalled = false
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserverWithCallback)
})

function TestComponent({ threshold }: { threshold?: number }) {
  const { ref, inView } = useInView(threshold)
  return <div ref={ref} data-testid="target">{inView ? 'visible' : 'hidden'}</div>
}

describe('useInView', () => {
  it('inView starts as false', () => {
    const { getByTestId } = render(<TestComponent />)
    expect(getByTestId('target').textContent).toBe('hidden')
  })

  it('inView becomes true when entry isIntersecting', () => {
    const { getByTestId } = render(<TestComponent />)
    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(getByTestId('target').textContent).toBe('visible')
  })

  it('inView stays false when entry is not intersecting', () => {
    const { getByTestId } = render(<TestComponent />)
    act(() => {
      observerCallback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(getByTestId('target').textContent).toBe('hidden')
  })

  it('observer disconnects after element becomes visible', () => {
    render(<TestComponent />)
    act(() => {
      observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(disconnectCalled).toBe(true)
  })

  it('observer observes the ref element', () => {
    const { getByTestId } = render(<TestComponent />)
    expect(observeTarget).toBe(getByTestId('target'))
  })
})
