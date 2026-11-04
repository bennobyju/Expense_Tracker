
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import IncomePage from '../pages/IncomePage'
import { expenseApi } from '../api/expenseApi'

// Mock API
vi.mock('../api/expenseApi', () => ({
  expenseApi: {
    getAll: vi.fn(),
    getCategories: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock ExpenseFilter
vi.mock('../components/expenses/ExpenseFilter', () => ({
  default: ({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    categories,
    selectedMonth,
    onMonthChange,
  }) => (
    <div>
      <input
        placeholder="Search notes or vendor..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        aria-label="Category filter"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="ALL">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Month filter"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
      >
        <option value="ALL">All Months</option>
        <option value="10">October 2026</option>
        <option value="11">November 2026</option>
      </select>
    </div>
  ),
}))

// Mock ExpenseTable
vi.mock('../components/expenses/ExpenseTable', () => ({
  default: ({ transactions, onEditClick, onDeleteClick }) => (
    <div>
      {transactions.length === 0 ? (
        <p>No records found.</p>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id}>
            <span>{tx.description}</span>

            <button onClick={() => onEditClick(tx)}>
              Edit {tx.description}
            </button>

            <button onClick={() => onDeleteClick(tx.id)}>
              Delete {tx.description}
            </button>
          </div>
        ))
      )}
    </div>
  ),
}))

// Mock ExpenseModal
vi.mock('../components/expenses/ExpenseModal', () => ({
  default: ({ isOpen, onClose, onSave, initialData, type }) =>
    isOpen ? (
      <div>
        <h2>{initialData ? 'Edit Income' : 'Add New Income'}</h2>

        <button
          onClick={() =>
            onSave({
              amount: 5000,
              categoryId: 3,
              transactionDate: '2026-11-03',
              description: 'Test Income',
              type,
            })
          }
        >
          Save Income
        </button>

        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}))

// Mock ConfirmModal
vi.mock('../components/ui/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }) =>
    isOpen ? (
      <div>
        <p>Are you sure you want to delete?</p>
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}))

// Mock Button
vi.mock('../components/ui/Button', () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

const mockTransactions = [
  {
    id: 1,
    amount: 50000,
    description: 'Monthly Salary',
    categoryId: 3,
    categoryName: 'Salary',
    transactionDate: '2026-11-01',
    type: 'INCOME',
  },
  {
    id: 2,
    amount: 10000,
    description: 'Freelance Work',
    categoryId: 4,
    categoryName: 'Freelance',
    transactionDate: '2026-10-15',
    type: 'INCOME',
  },
  {
    id: 3,
    amount: 2000,
    description: 'Food Expense',
    categoryId: 5,
    categoryName: 'Food',
    transactionDate: '2026-11-02',
    type: 'EXPENSE',
  },
]

const mockCategories = [
  { id: 3, name: 'Salary', type: 'INCOME' },
  { id: 4, name: 'Freelance', type: 'INCOME' },
  { id: 5, name: 'Food', type: 'EXPENSE' },
]

describe('IncomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, name: 'Test User' })
    )

    expenseApi.getAll.mockResolvedValue(mockTransactions)
    expenseApi.getCategories.mockResolvedValue(mockCategories)
  })

  // Test 1
  it('renders Income Ledger page', () => {
    render(<IncomePage />)

    expect(screen.getByText('Income Ledger')).toBeInTheDocument()

    expect(
      screen.getByText(
        'Review and manage your earnings and revenue streams'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText('+ New Income')
    ).toBeInTheDocument()
  })

  // Test 2
  it('loads transactions and categories from API', async () => {
    render(<IncomePage />)

    expect(await screen.findByText('Monthly Salary')).toBeInTheDocument()
    expect(screen.getByText('Freelance Work')).toBeInTheDocument()

    expect(expenseApi.getAll).toHaveBeenCalledWith(1)
    expect(expenseApi.getCategories).toHaveBeenCalled()
  })

  // Test 3
  it('displays only income transactions', async () => {
    render(<IncomePage />)

    expect(await screen.findByText('Monthly Salary')).toBeInTheDocument()
    expect(screen.getByText('Freelance Work')).toBeInTheDocument()

    expect(screen.queryByText('Food Expense')).not.toBeInTheDocument()
  })

  // Test 4
  it('filters income transactions by search text', async () => {
    render(<IncomePage />)

    expect(await screen.findByText('Monthly Salary')).toBeInTheDocument()

    fireEvent.change(
      screen.getByPlaceholderText('Search notes or vendor...'),
      { target: { value: 'Freelance' } }
    )

    expect(screen.getByText('Freelance Work')).toBeInTheDocument()
    expect(screen.queryByText('Monthly Salary')).not.toBeInTheDocument()
  })

  // Test 5
  it('filters income transactions by category', async () => {
    render(<IncomePage />)

    expect(await screen.findByText('Monthly Salary')).toBeInTheDocument()

    fireEvent.change(
      screen.getByRole('combobox', { name: 'Category filter' }),
      { target: { value: 'Salary' } }
    )

    expect(screen.getByText('Monthly Salary')).toBeInTheDocument()
    expect(screen.queryByText('Freelance Work')).not.toBeInTheDocument()
  })

  // Test 6
  it('filters income transactions by month', async () => {
    render(<IncomePage />)

    expect(await screen.findByText('Monthly Salary')).toBeInTheDocument()
    expect(screen.getByText('Freelance Work')).toBeInTheDocument()

    fireEvent.change(
      screen.getByRole('combobox', { name: 'Month filter' }),
      { target: { value: '11' } }
    )

    expect(screen.getByText('Monthly Salary')).toBeInTheDocument()
    expect(screen.queryByText('Freelance Work')).not.toBeInTheDocument()
  })

  // Test 7
  it('opens Add Income modal', async () => {
    render(<IncomePage />)

    fireEvent.click(screen.getByText('+ New Income'))

    expect(screen.getByText('Add New Income')).toBeInTheDocument()
  })

  // Test 8
  it('creates new income through API', async () => {
    expenseApi.create.mockResolvedValue({
      id: 4,
      amount: 5000,
      categoryId: 3,
      categoryName: 'Salary',
      transactionDate: '2026-11-03',
      description: 'Test Income',
      type: 'INCOME',
    })

    render(<IncomePage />)

    fireEvent.click(screen.getByText('+ New Income'))
    fireEvent.click(screen.getByText('Save Income'))

    await waitFor(() => {
      expect(expenseApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 5000,
          categoryId: 3,
          description: 'Test Income',
          userId: 1,
          type: 'INCOME',
        })
      )
    })

    await waitFor(() => {
      expect(screen.queryByText('Add New Income')).not.toBeInTheDocument()
    })
  })

  // Test 9
  it('opens Edit Income modal', async () => {
    render(<IncomePage />)

    fireEvent.click(await screen.findByText('Edit Monthly Salary'))

    expect(screen.getByText('Edit Income')).toBeInTheDocument()
  })

  // Test 10
  it('deletes income through the API', async () => {
    expenseApi.delete.mockResolvedValue({})

    render(<IncomePage />)

    await screen.findByText('Monthly Salary')

    fireEvent.click(screen.getByText('Delete Monthly Salary'))

    expect(
      screen.getByText('Are you sure you want to delete?')
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm Delete' })
    )

    await waitFor(() => {
      expect(expenseApi.delete).toHaveBeenCalledWith(1, 1)
    })
  })
})
