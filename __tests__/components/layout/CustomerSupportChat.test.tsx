import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDispatch = vi.fn()
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/customerSupportSlice', () => ({
  sendMessageThunk: vi.fn(() => ({ type: 'support/send' })),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return ({ children, ...rest }: { children?: React.ReactNode; [key: string]: unknown }) => {
          const { initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh, whileTap: _wt, ...domProps } = rest
          return React.createElement(prop, domProps, children)
        }
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  }
})

// jsdom doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

import CustomerSupportChat from '@/components/layout/CustomerSupportChat'

function setup(overrides = {}) {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({
      customerSupport: { messages: [], isSending: false, error: null, ...overrides },
      auth: { user: { firstName: 'Alice' } },
    })
  )
}

describe('CustomerSupportChat', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders FAB button', () => {
    setup()
    render(<CustomerSupportChat />)
    expect(screen.getByLabelText('Customer support chat')).toBeInTheDocument()
  })

  it('opens chat window when FAB clicked', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByText('AdaptiveTutor Support')).toBeInTheDocument()
  })

  it('closes chat window when close button clicked', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByText('AdaptiveTutor Support')).toBeInTheDocument()
    // Click the close button in the header
    const closeButtons = screen.getAllByText('close')
    fireEvent.click(closeButtons[0])
    expect(screen.queryByText('AdaptiveTutor Support')).not.toBeInTheDocument()
  })

  it('shows greeting with user name when chat is open and empty', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
  })

  it('renders message input when chat is open', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    const sendBtn = screen.getByText('send')
    expect(sendBtn.closest('button')).toBeDisabled()
  })

  it('send button is enabled when input has text', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    const sendBtn = screen.getByText('send')
    expect(sendBtn.closest('button')).not.toBeDisabled()
  })

  it('dispatches sendMessageThunk when send clicked', () => {
    setup()
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(screen.getByText('send').closest('button')!)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('renders messages list header when open', () => {
    setup({ messages: [{ role: 'user', content: 'Test' }] })
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByText("We're here to help")).toBeInTheDocument()
  })

  it('renders existing messages', () => {
    setup({
      messages: [
        { role: 'user', content: 'Hello AI' },
        { role: 'assistant', content: 'Hi there!' },
      ],
    })
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByText('Hello AI')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('shows error when error is set', () => {
    setup({ error: 'Something went wrong' })
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows sending indicator when isSending', () => {
    setup({ isSending: true })
    render(<CustomerSupportChat />)
    fireEvent.click(screen.getByLabelText('Customer support chat'))
    // input is disabled
    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled()
  })
})
