import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConfirmModal from '../components/ui/ConfirmModal'

describe('ConfirmModal Component', () => {
  it('renders the modal when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Delete Record')).toBeInTheDocument()

    expect(
      screen.getByText(
        'Are you sure you want to delete this record? This action cannot be undone.'
      )
    ).toBeInTheDocument()
  })

  it('does not render the modal when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.queryByText('Delete Record')).not.toBeInTheDocument()
  })

  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn()

    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()

    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})