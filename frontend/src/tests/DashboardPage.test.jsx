
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from '../pages/DashboardPage'
import { expenseApi } from '../api/expenseApi'

vi.mock('../api/expenseApi', () => ({
  expenseApi: {
    getAll: vi.fn(),
  },
}))

vi.mock('../components/dashboard/DashboardCharts', () => ({
  default: () => <div>Dashboard Charts</div>,
}))

describe('DashboardPage Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
      })
    )
  })

  // TEST 1: Dashboard should render
  it('renders the dashboard successfully', async () => {
    expenseApi.getAll.mockResolvedValue([])

    render(<DashboardPage />)

    expect(
      screen.getByText('YOUR MONEY AT A GLANCE')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Recent activity')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Dashboard Charts')
    ).toBeInTheDocument()
  })

  // TEST 2: Display user's first name
  it('displays the first name of the logged-in user', async () => {
    expenseApi.getAll.mockResolvedValue([])

    render(<DashboardPage />)

    expect(
      screen.getByRole('heading', { name: 'Good to see you, Rahul.' })
    ).toBeInTheDocument()
  })

  // TEST 3: Display net balance
  it('displays the correct net balance', async () => {
    expenseApi.getAll.mockResolvedValue([
      { id: 1, type: 'INCOME', amount: 10000 },
      { id: 2, type: 'EXPENSE', amount: 3000 },
    ])

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$7,000.00')).toBeInTheDocument()
    })
  })
  
// TEST 4: Display total income
it('displays the correct total income', async () => {
  expenseApi.getAll.mockResolvedValue([
    { id: 1, type: 'INCOME', amount: 10000 },
    { id: 2, type: 'INCOME', amount: 5000 },
  ])

  render(<DashboardPage />)

  await waitFor(() => {
    expect(screen.getByText('Total income').parentElement.parentElement)
      .toBeInTheDocument()

    expect(screen.getAllByText('$15,000.00')).toHaveLength(2)
  })
})

  // TEST 5: Display total expenses
  it('displays the correct total expenses', async () => {
    expenseApi.getAll.mockResolvedValue([
      { id: 1, type: 'EXPENSE', amount: 2000 },
      { id: 2, type: 'EXPENSE', amount: 3000 },
    ])

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$5,000.00')).toBeInTheDocument()
      expect(screen.getByText('Across 2 expense records')).toBeInTheDocument()
    })
  })

  // TEST 6: Display recent transactions
  it('displays recent transactions', async () => {
    expenseApi.getAll.mockResolvedValue([
      {
        id: 1,
        description: 'Monthly Salary',
        categoryName: 'Salary',
        type: 'INCOME',
        amount: 30000,
        transactionDate: '2026-10-01',
      },
      {
        id: 2,
        description: 'Grocery Shopping',
        categoryName: 'Food',
        type: 'EXPENSE',
        amount: 2000,
        transactionDate: '2026-10-02',
      },
    ])

    render(<DashboardPage />)

    expect(await screen.findByText('Monthly Salary')).toBeInTheDocument()
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
  })

  // TEST 7: Display empty state when no transactions exist
  it('displays an empty state when there are no transactions', async () => {
    expenseApi.getAll.mockResolvedValue([])

    render(<DashboardPage />)

    expect(
      await screen.findByText('Your activity will show up here')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Add an income or expense to start building your overview.')
    ).toBeInTheDocument()
  })

  // TEST 8: Handle API failure
  it('handles transaction loading failure', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expenseApi.getAll.mockRejectedValue(new Error('API failed'))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Could not load dashboard transactions',
        expect.any(Error)
      )
    })

    consoleError.mockRestore()
  })
})
