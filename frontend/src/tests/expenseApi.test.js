
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'

// Create mocks before importing expenseApi
const mocks = vi.hoisted(() => {
  const state = {
    requestInterceptor: null,
    responseErrorInterceptor: null,
  }

  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),

    interceptors: {
      request: {
        use: vi.fn((callback) => {
          state.requestInterceptor = callback
        }),
      },

      response: {
        use: vi.fn((successCallback, errorCallback) => {
          state.responseErrorInterceptor = errorCallback
        }),
      },
    },
  }

  return { mockApi, state }
})

// Mock Axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mocks.mockApi),
  },
}))

// Import after setting up the Axios mock
const { expenseApi } = await import('../api/expenseApi')

const mockApi = mocks.mockApi

describe('Expense API Service', () => {

  beforeEach(() => {
    mockApi.get.mockReset()
    mockApi.post.mockReset()
    mockApi.put.mockReset()
    mockApi.delete.mockReset()

    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // 1. Fetch transactions
  it('fetches transactions for a user', async () => {
    const transactions = [
      { id: 1, description: 'Food', amount: 500 },
    ]

    mockApi.get.mockResolvedValue({ data: transactions })

    const result = await expenseApi.getAll(1)

    expect(mockApi.get).toHaveBeenCalledWith('/transactions/user/1')
    expect(result).toEqual(transactions)
  })

  // 2. Missing user ID
  it('returns an empty array when user ID is missing', async () => {
    const result = await expenseApi.getAll(null)

    expect(result).toEqual([])
    expect(mockApi.get).not.toHaveBeenCalled()
  })

  // 3. Fetch categories
  it('fetches categories from backend', async () => {
    const categories = [
      { id: 1, name: 'Salary', type: 'INCOME' },
    ]

    mockApi.get.mockResolvedValue({ data: categories })

    const result = await expenseApi.getCategories()

    expect(mockApi.get).toHaveBeenCalledWith('/categories')
    expect(result).toEqual(categories)
  })

  // 4. Create transaction
  it('creates a transaction', async () => {
    const transaction = {
      userId: 1,
      amount: 500,
      categoryId: 4,
    }

    mockApi.post.mockResolvedValue({
      data: { id: 10, ...transaction },
    })

    const result = await expenseApi.create(transaction)

    expect(mockApi.post).toHaveBeenCalledWith(
      '/transactions',
      transaction
    )

    expect(result.id).toBe(10)
  })

  // 5. Update transaction
  it('updates a transaction', async () => {
    const transaction = {
      userId: 1,
      amount: 1000,
      categoryId: 4,
    }

    mockApi.put.mockResolvedValue({
      data: { id: 10, ...transaction },
    })

    const result = await expenseApi.update(10, transaction)

    expect(mockApi.put).toHaveBeenCalledWith(
      '/transactions/10',
      transaction
    )

    expect(result.amount).toBe(1000)
  })

  // 6. Delete transaction
  it('deletes a transaction', async () => {
    mockApi.delete.mockResolvedValue({ data: {} })

    const result = await expenseApi.delete(10, 1)

    expect(mockApi.delete).toHaveBeenCalledWith('/transactions/10')
    expect(result).toBe(true)
  })

  // 7. Default categories for empty response
  it('returns default categories when backend returns an empty array', async () => {
    mockApi.get.mockResolvedValue({ data: [] })

    const result = await expenseApi.getCategories()

    expect(result.length).toBe(8)
    expect(result[0].name).toBe('Salary')
  })

  // 8. Default categories when API fails
  it('returns default categories when category API fails', async () => {
    mockApi.get.mockRejectedValue(new Error('Network error'))

    const result = await expenseApi.getCategories()

    expect(result.length).toBe(8)
  })

  // 9. Local transaction fallback
  it('uses locally stored transactions when transaction API fails', async () => {
    const transactions = [
      { id: 1, description: 'Offline transaction' },
    ]

    localStorage.setItem(
      'mock_transactions_user_1',
      JSON.stringify(transactions)
    )

    mockApi.get.mockRejectedValue(new Error('Network error'))

    const result = await expenseApi.getAll(1)

    expect(result).toEqual(transactions)
  })

  // 10. JWT token attachment
  it('attaches JWT token to API requests', () => {
    localStorage.setItem('token', 'my-test-jwt-token')

    const requestInterceptor = mocks.state.requestInterceptor

    expect(requestInterceptor).toBeTypeOf('function')

    const config = {
      headers: {},
    }

    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe(
      'Bearer my-test-jwt-token'
    )
  })

  // 11. Handle 401 Unauthorized
  it('clears authentication and redirects on 401 response', async () => {
    const location = {
      pathname: '/dashboard',
      replace: vi.fn(),
    }

    vi.stubGlobal('window', { location })

    localStorage.setItem('token', 'my-test-jwt-token')
    localStorage.setItem('user', JSON.stringify({ id: 1 }))

    const responseErrorInterceptor =
      mocks.state.responseErrorInterceptor

    expect(responseErrorInterceptor).toBeTypeOf('function')

    const error = {
      response: { status: 401 },
    }

    await expect(
      responseErrorInterceptor(error)
    ).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()

    expect(location.replace).toHaveBeenCalledWith('/login')
  })

  // 12. Handle 403 Forbidden
  it('clears authentication and redirects on 403 response', async () => {
    const location = {
      pathname: '/dashboard',
      replace: vi.fn(),
    }

    vi.stubGlobal('window', { location })

    localStorage.setItem('token', 'my-test-jwt-token')
    localStorage.setItem('user', JSON.stringify({ id: 1 }))

    const responseErrorInterceptor =
      mocks.state.responseErrorInterceptor

    expect(responseErrorInterceptor).toBeTypeOf('function')

    const error = {
      response: { status: 403 },
    }

    await expect(
      responseErrorInterceptor(error)
    ).rejects.toBe(error)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()

    expect(location.replace).toHaveBeenCalledWith('/login')
  })

  it('does not attach Authorization header when JWT token is missing', () => {
  localStorage.removeItem('token')

  const requestInterceptor = mocks.state.requestInterceptor

  const config = {
    headers: {},
  }

  const result = requestInterceptor(config)

  expect(result.headers.Authorization).toBeUndefined()
})

})
