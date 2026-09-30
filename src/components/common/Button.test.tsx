import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders and handles a user click', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Continue</Button>)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
