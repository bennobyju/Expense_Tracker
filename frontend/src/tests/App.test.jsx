
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

describe('App Component', () => {
  it('renders the application successfully', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(document.body).toBeInTheDocument()
  })
})
