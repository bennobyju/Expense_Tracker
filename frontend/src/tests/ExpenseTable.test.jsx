import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ExpenseTable from '../components/expenses/ExpenseTable'

describe('ExpenseTable Component', () => {
  const mockTransactions = [
    {
      id: 1,
      description: 'Grocery shopping',
      categoryName: 'Food',
      transactionDate: '2026-11-01',
      amount: 1500,
    },
    {
      id: 2,
      description: 'Monthly salary',
      categoryName: 'Salary',
      transactionDate: '2026-11-02',
      amount: 50000,
    },
  ]

  it('displays transaction details', () => {
    render(
      <ExpenseTable
        transactions={mockTransactions}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    )

    expect(screen.getByText('Grocery shopping')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Monthly salary')).toBeInTheDocument()
    expect(screen.getByText('Salary')).toBeInTheDocument()
  })

  it('displays empty message when there are no transactions', () => {
    render(
      <ExpenseTable
        transactions={[]}
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    )

    expect(screen.getByText('No records found.')).toBeInTheDocument()
  })

  it('calls onEditClick when Edit is clicked', () => {
    const onEditClick = vi.fn()

    render(
      <ExpenseTable
        transactions={mockTransactions}
        onEditClick={onEditClick}
        onDeleteClick={vi.fn()}
      />
    )

    fireEvent.click(screen.getAllByTitle('Edit')[0])

    expect(onEditClick).toHaveBeenCalledWith(mockTransactions[0])
  })

  it('calls onDeleteClick when Delete is clicked', () => {
    const onDeleteClick = vi.fn()

    render(
      <ExpenseTable
        transactions={mockTransactions}
        onEditClick={vi.fn()}
        onDeleteClick={onDeleteClick}
      />
    )

    fireEvent.click(screen.getAllByTitle('Delete')[0])

    expect(onDeleteClick).toHaveBeenCalledWith(1)
  })
})