import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ExpenseFilter from '../components/expenses/ExpenseFilter'

describe('ExpenseFilter Component', () => {
  const mockProps = {
    search: '',
    onSearchChange: vi.fn(),
    category: 'ALL',
    onCategoryChange: vi.fn(),
    categories: [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Shopping' },
    ],
    selectedMonth: 'ALL',
    onMonthChange: vi.fn(),
  }

  it('renders the search input', () => {
    render(<ExpenseFilter {...mockProps} />)

    expect(
      screen.getByPlaceholderText('Search notes or vendor...')
    ).toBeInTheDocument()
  })

  it('calls onSearchChange when searching', () => {
    render(<ExpenseFilter {...mockProps} />)

    fireEvent.change(
      screen.getByPlaceholderText('Search notes or vendor...'),
      { target: { value: 'Food' } }
    )

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('Food')
  })

  it('displays category options', () => {
    render(<ExpenseFilter {...mockProps} />)

    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Shopping' })).toBeInTheDocument()
  })

  it('calls onCategoryChange when category changes', () => {
    render(<ExpenseFilter {...mockProps} />)

    const categorySelect = screen.getAllByRole('combobox')[0]

    fireEvent.change(categorySelect, {
      target: { value: 'Food' },
    })

    expect(mockProps.onCategoryChange).toHaveBeenCalledWith('Food')
  })

  it('calls onMonthChange when month changes', () => {
    render(<ExpenseFilter {...mockProps} />)

    const monthSelect = screen.getAllByRole('combobox')[1]

    fireEvent.change(monthSelect, {
      target: { value: '10' },
    })

    expect(mockProps.onMonthChange).toHaveBeenCalledWith('10')
  })
})