import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../components/ui/Button'

describe('Button Component', () => {
  it('renders the button correctly', () => {
    render(<Button>Click Me</Button>)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays the button text', () => {
    render(<Button>Save</Button>)

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Submit</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()

    render(
      <Button onClick={handleClick} disabled>
        Submit
      </Button>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders the secondary variant', () => {
    render(<Button variant="secondary">Cancel</Button>)

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass(
      'bg-white'
    )
  })

  it('renders the danger variant', () => {
    render(<Button variant="danger">Delete</Button>)

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'bg-[#DC2626]'
    )
  })
})