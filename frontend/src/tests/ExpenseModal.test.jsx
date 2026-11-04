
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ExpenseModal from '../components/expenses/ExpenseModal'

// Mock Button component
vi.mock('../components/common/Button', () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}))

describe('ExpenseModal Component', () => {
  const expenseCategories = [
    { id: 1, name: 'Food', type: 'EXPENSE' },
    { id: 2, name: 'Transport', type: 'EXPENSE' },
  ]

  const incomeCategories = [
    { id: 3, name: 'Salary', type: 'INCOME' },
    { id: 4, name: 'Freelance', type: 'INCOME' },
  ]

  it('renders the Add New Expense modal', () => {
    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={expenseCategories}
        type="EXPENSE"
      />
    )

    expect(screen.getByText('Add New Expense')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Groceries, Uber, etc.')
    ).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <ExpenseModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={expenseCategories}
      />
    )

    expect(screen.queryByText('Add New Expense')).not.toBeInTheDocument()
  })

  it('displays the correct heading for an expense', () => {
    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={expenseCategories}
        type="EXPENSE"
      />
    )

    expect(screen.getByText('Add New Expense')).toBeInTheDocument()
  })

  it('displays the correct heading for income', () => {
    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={incomeCategories}
        type="INCOME"
      />
    )

    expect(screen.getByText('Add New Income')).toBeInTheDocument()
  })

  it('displays only expense categories', () => {
    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={[...expenseCategories, ...incomeCategories]}
        type="EXPENSE"
      />
    )

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
    expect(screen.queryByText('Freelance')).not.toBeInTheDocument()
  })

  it('displays only income categories', () => {
    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={[...expenseCategories, ...incomeCategories]}
        type="INCOME"
      />
    )

    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('Freelance')).toBeInTheDocument()
    expect(screen.queryByText('Food')).not.toBeInTheDocument()
    expect(screen.queryByText('Transport')).not.toBeInTheDocument()
  })

  it('submits expense data correctly', () => {
    const onSave = vi.fn()

    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        categories={expenseCategories}
        type="EXPENSE"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '500' },
    })

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '1' },
    })

    fireEvent.change(screen.getByDisplayValue(
      new Date().toISOString().split('T')[0]
    ), {
      target: { value: '2026-11-03' },
    })

    fireEvent.change(
      screen.getByPlaceholderText('Groceries, Uber, etc.'),
      {
        target: { value: ' Groceries ' },
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }))

    expect(onSave).toHaveBeenCalledWith({
      amount: 500,
      categoryId: 1,
      transactionDate: '2026-11-03',
      description: 'Groceries',
      type: 'EXPENSE',
    })
  })

  it('submits income data correctly', () => {
    const onSave = vi.fn()

    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
        categories={incomeCategories}
        type="INCOME"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '25000' },
    })

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '3' },
    })

    fireEvent.change(screen.getByDisplayValue(
      new Date().toISOString().split('T')[0]
    ), {
      target: { value: '2026-11-03' },
    })

    fireEvent.change(
      screen.getByPlaceholderText('Salary, Client payment, etc.'),
      {
        target: { value: 'Salary' },
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Income' }))

    expect(onSave).toHaveBeenCalledWith({
      amount: 25000,
      categoryId: 3,
      transactionDate: '2026-11-03',
      description: 'Salary',
      type: 'INCOME',
    })
  })

  it('loads existing transaction data when editing', () => {
    const initialData = {
      id: 10,
      amount: 1000,
      categoryId: 1,
      transactionDate: '2026-01-15',
      description: 'Groceries',
      type: 'EXPENSE',
    }

    render(
      <ExpenseModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        categories={expenseCategories}
        initialData={initialData}
        type="EXPENSE"
      />
    )

    expect(screen.getByText('Edit Expense')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('1')
    expect(screen.getByDisplayValue('2026-01-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Groceries')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()

    const { container } = render(
      <ExpenseModal
        isOpen={true}
        onClose={onClose}
        onSave={vi.fn()}
        categories={expenseCategories}
      />
    )

    // The first button is the modal's close button
    fireEvent.click(container.querySelector('button'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
