
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import LoginPage from '../pages/LoginPage'

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // TEST 1: Login form should be displayed
  it('displays the login form', () => {
    render(<LoginPage onLogin={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  // TEST 2: Successful login should store JWT token
  it('logs in successfully and stores the JWT token', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()

    axios.post.mockResolvedValue({
      data: {
        token: 'test-jwt-token',
        id: 1,
        name: 'Rahul',
        email: 'rahul@example.com',
      },
    })

    render(<LoginPage onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/email address/i), 'rahul@example.com')
    await user.type(screen.getByLabelText('Password'), 'Rahul@123')
    await user.click(screen.getByRole('button', { name: /sign in to your account/i }))

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/login',
      { email: 'rahul@example.com', password: 'Rahul@123' }
    )

    expect(onLogin).toHaveBeenCalledWith({
      id: 1,
      name: 'Rahul',
      email: 'rahul@example.com',
    })

    expect(localStorage.getItem('token')).toBe('test-jwt-token')
  })

  // TEST 3: Invalid login should display an error
  it('displays an error when login fails', async () => {
    const user = userEvent.setup()

    axios.post.mockRejectedValue({
      response: { data: { message: 'Invalid email or password.' } },
    })

    render(<LoginPage onLogin={vi.fn()} />)

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in to your account/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.'
    )
  })

  // TEST 4: Switch to registration form
  it('switches to registration form', async () => {
    const user = userEvent.setup()

    render(<LoginPage onLogin={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create an account/i }))

    expect(
      screen.getByRole('heading', { name: 'Create your account' })
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  // TEST 5: Password mismatch should display an error
  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<LoginPage onLogin={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await user.type(screen.getByLabelText('Full name'), 'Rahul')
    await user.type(screen.getByLabelText(/email address/i), 'rahul@example.com')
    await user.type(screen.getByLabelText('Password'), 'Rahul@123')
    await user.type(screen.getByLabelText('Confirm password'), 'Rahul@456')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(axios.post).not.toHaveBeenCalled()
  })

  // TEST 6: Successful registration
  it('registers a new user successfully', async () => {
    const user = userEvent.setup()

    axios.post.mockResolvedValue({
      data: { message: 'Registration successful' },
    })

    render(<LoginPage onLogin={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await user.type(screen.getByLabelText('Full name'), 'Rahul')
    await user.type(screen.getByLabelText(/email address/i), 'rahul@example.com')
    await user.type(screen.getByLabelText('Password'), 'Rahul@123')
    await user.type(screen.getByLabelText('Confirm password'), 'Rahul@123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/register',
      {
        name: 'Rahul',
        email: 'rahul@example.com',
        password: 'Rahul@123',
      }
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Account created successfully! Please sign in.'
    )
  })

  // TEST 7: Registration API failure
  it('displays an error when registration fails', async () => {
    const user = userEvent.setup()

    axios.post.mockRejectedValue({
      response: {
        data: { message: 'Email already registered.' },
      },
    })

    render(<LoginPage onLogin={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await user.type(screen.getByLabelText('Full name'), 'Rahul')
    await user.type(screen.getByLabelText(/email address/i), 'rahul@example.com')
    await user.type(screen.getByLabelText('Password'), 'Rahul@123')
    await user.type(screen.getByLabelText('Confirm password'), 'Rahul@123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email already registered.'
    )
  })

  // TEST 8: Password shorter than 6 characters
  it('shows an error when registration password is too short', async () => {
    const user = userEvent.setup()

    render(<LoginPage onLogin={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await user.type(screen.getByLabelText('Full name'), 'Rahul')
    await user.type(screen.getByLabelText(/email address/i), 'rahul@example.com')
    await user.type(screen.getByLabelText('Password'), '12345')
    await user.type(screen.getByLabelText('Confirm password'), '12345')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be at least 6 characters.'
    )

    expect(axios.post).not.toHaveBeenCalled()
  })
})
