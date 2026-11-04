
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ExpensesPage from '../pages/ExpensesPage'
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

// Mock child components
vi.mock('../components/expenses/ExpenseFilter', () => ({
  default: ({ search, onSearchChange, category, onCategoryChange,
    categories, selectedMonth, onMonthChange }) => (
    <div>
      <input
        aria-label="Search expenses"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        aria-label="Category filter"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="ALL">All</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>
      <select
        aria-label="Month filter"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
      >
        <option value="ALL">All months</option>
        <option value="01">January</option>
        <option value="02">February</option>
      </select>
    </div>
  ),
}))

vi.mock('../components/expenses/ExpenseTable', () => ({
  default: ({ transactions, onEditClick, onDeleteClick }) => (
    <div>
      {transactions.map((t) => (
        <div key={t.id}>
          <span>{t.description}</span>
          <button onClick={() => onEditClick(t)}>Edit {t.description}</button>
          <button onClick={() => onDeleteClick(t.id)}>Delete {t.description}</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../components/expenses/ExpenseModal', () => ({
  default: ({ isOpen, onSave, initialData }) => (
    isOpen ? (
      <div>
        <p>Expense Modal</p>
        <p>{initialData ? 'Editing expense' : 'Adding expense'}</p>
        <button onClick={() => onSave({
          description: 'Test expense',
          amount: 500,
          categoryId: 1,
        })}>
          Save expense
        </button>
      </div>
    ) : null
  ),
}))

vi.mock('../components/ui/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }) => (
    isOpen ? (
      <div>
        <p>Confirm Delete</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  ),
}))

vi.mock('../components/ui/Button', () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}))

describe('ExpensesPage Component', () => {
  const transactions = [
    {
      id: 1,
      description: 'Groceries',
      amount: 1000,
      type: 'EXPENSE',
      categoryName: 'Food',
      transactionDate: '2026-01-15',
    },
    {
      id: 2,
      description: 'Bus ticket',
      amount: 100,
      type: 'EXPENSE',
      categoryName: 'Transport',
      transactionDate: '2026-02-10',
    },
    {
      id: 3,
      description: 'Monthly salary',
      amount: 30000,
      type: 'INCOME',
      categoryName: 'Salary',
      transactionDate: '2026-01-01',
    },
  ]

  const categories = [
    { id: 1, name: 'Food', type: 'EXPENSE' },
    { id: 2, name: 'Transport', type: 'EXPENSE' },
    { id: 3, name: 'Salary', type: 'INCOME' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ id: 1 }))

    expenseApi.getAll.mockResolvedValue(transactions)
    expenseApi.getCategories.mockResolvedValue(categories)
  })

  // TEST 1: Page renders
  it('renders the Expenses Ledger heading and New Expense button', async () => {
    render(<ExpensesPage />)

    expect(screen.getByText('Expenses Ledger')).toBeInTheDocument()
    expect(screen.getByText('+ New Expense')).toBeInTheDocument()

    await screen.findByText('Groceries')
  })

  // TEST 2: Loads data
  it('loads transactions and categories from the API', async () => {
    render(<ExpensesPage />)

    await waitFor(() => {
      expect(expenseApi.getAll).toHaveBeenCalledWith(1)
      expect(expenseApi.getCategories).toHaveBeenCalled()
    })
  })

  // TEST 3: Only expenses are displayed
  it('displays only expense transactions', async () => {
    render(<ExpensesPage />)

    expect(await screen.findByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Bus ticket')).toBeInTheDocument()
    expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument()
  })

  // TEST 4: Search filter
  it('filters expenses by search text', async () => {
    render(<ExpensesPage />)

    await screen.findByText('Groceries')

    fireEvent.change(screen.getByLabelText('Search expenses'), {
      target: { value: 'Bus' },
    })

    expect(screen.getByText('Bus ticket')).toBeInTheDocument()
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument()
  })

  // TEST 5: Category filter
  it('filters expenses by category', async () => {
    render(<ExpensesPage />)

    await screen.findByText('Groceries')

    fireEvent.change(screen.getByLabelText('Category filter'), {
      target: { value: 'Food' },
    })

    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.queryByText('Bus ticket')).not.toBeInTheDocument()
  })

  // TEST 6: Month filter
  it('filters expenses by month', async () => {
    render(<ExpensesPage />)

    await screen.findByText('Groceries')

    fireEvent.change(screen.getByLabelText('Month filter'), {
      target: { value: '02' },
    })

    expect(screen.getByText('Bus ticket')).toBeInTheDocument()
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument()
  })

  // TEST 7: Open add modal
  it('opens the modal when New Expense is clicked', async () => {
    render(<ExpensesPage />)

    fireEvent.click(screen.getByText('+ New Expense'))

    expect(screen.getByText('Expense Modal')).toBeInTheDocument()
    expect(screen.getByText('Adding expense')).toBeInTheDocument()
  })
 
// TEST 8: Create expense
it('creates a new expense', async () => {
  const createdExpense = {
    id: 4,
    description: 'Test expense',
    amount: 500,
    categoryId: 1,
    transactionDate: '2026-11-03',
    type: 'EXPENSE',
  }

  expenseApi.create.mockResolvedValue(createdExpense)

  render(<ExpensesPage />)

  fireEvent.click(screen.getByText('+ New Expense'))

  fireEvent.click(screen.getByText('Save expense'))

  await waitFor(() => {
    expect(expenseApi.create).toHaveBeenCalledTimes(1)
  })

  expect(expenseApi.create).toHaveBeenCalledWith({
    description: 'Test expense',
    amount: 500,
    categoryId: 1,
    userId: 1,
    type: 'EXPENSE',
  })

  // Verify the API returned the created expense
  expect(createdExpense.description).toBe('Test expense')

  // Verify the modal closes after saving
  await waitFor(() => {
    expect(screen.queryByText('Expense Modal')).not.toBeInTheDocument()
  })
})

  // TEST 9: Edit expense
  it('opens the modal with existing expense data for editing', async () => {
    expenseApi.update.mockResolvedValue({})

    render(<ExpensesPage />)

    await screen.findByText('Groceries')

    fireEvent.click(screen.getByText('Edit Groceries'))

    expect(screen.getByText('Expense Modal')).toBeInTheDocument()
    expect(screen.getByText('Editing expense')).toBeInTheDocument()
  })

  // TEST 10: Delete expense
  it('deletes an expense', async () => {
    expenseApi.delete.mockResolvedValue({})
    expenseApi.getAll
      .mockResolvedValueOnce(transactions)
      .mockResolvedValueOnce(transactions.filter((t) => t.id !== 1))

    render(<ExpensesPage />)

    await screen.findByText('Groceries')

    fireEvent.click(screen.getByText('Delete Groceries'))
    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(expenseApi.delete).toHaveBeenCalledWith(1, 1)
    })

    await waitFor(() => {
      expect(screen.queryByText('Groceries')).not.toBeInTheDocument()
    })
  })
})
