import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardCharts from '../components/dashboard/DashboardCharts'

// Mock Recharts because we are testing the component,
// not the internal chart-rendering library.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: ({ children }) => <div>{children}</div>,
  Cell: () => <div />,
  Legend: () => <div />,
}))

describe('DashboardCharts Component', () => {

  it('renders the Cash Flow chart heading', () => {
    render(<DashboardCharts />)

    expect(
      screen.getByText('Cash Flow (Income vs Expense)')
    ).toBeInTheDocument()
  })

  it('renders the Expense Distribution heading', () => {
    render(<DashboardCharts />)

    expect(
      screen.getByText('Expense Distribution')
    ).toBeInTheDocument()
  })

  it('renders with monthly income and expense data', () => {
    const monthlyData = [
      { name: 'January', income: 50000, expense: 20000 },
      { name: 'February', income: 60000, expense: 25000 },
    ]

    render(<DashboardCharts monthlyData={monthlyData} />)

    expect(
      screen.getByText('Cash Flow (Income vs Expense)')
    ).toBeInTheDocument()
  })

  it('renders with category distribution data', () => {
    const categoryData = [
      { name: 'Food', value: 5000 },
      { name: 'Shopping', value: 3000 },
    ]

    render(<DashboardCharts categoryData={categoryData} />)

    expect(
      screen.getByText('Expense Distribution')
    ).toBeInTheDocument()
  })

  it('renders when both chart datasets are empty', () => {
    render(
      <DashboardCharts monthlyData={[]} categoryData={[]} />
    )

    expect(
      screen.getByText('Cash Flow (Income vs Expense)')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Expense Distribution')
    ).toBeInTheDocument()
  })

})