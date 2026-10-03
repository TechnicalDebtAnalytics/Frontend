import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Input from './Input'

describe('Input', () => {
  it('renders label and placeholder', () => {
    render(
      <Input
        label="Username"
        placeholder="Enter username"
        icon={<span>Icon</span>}
        value=""
        onChange={() => {}}
      />,
    )

    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter username'),
    ).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <Input
        label="Username"
        placeholder="Enter username"
        icon={<span>Icon</span>}
        value=""
        onChange={handleChange}
      />,
    )

    const input = screen.getByPlaceholderText('Enter username')

    await user.type(input, 'nalina')

    expect(handleChange).toHaveBeenCalled()
    expect(handleChange).toHaveBeenLastCalledWith('a')
  })

  it('renders the correct input type', () => {
    render(
      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        icon={<span>Icon</span>}
        value=""
        onChange={() => {}}
      />,
    )

    expect(
      screen.getByPlaceholderText('Enter password'),
    ).toHaveAttribute('type', 'password')
  })

  it('renders the right element when provided', () => {
    render(
      <Input
        label="Password"
        placeholder="Enter password"
        icon={<span>Icon</span>}
        value=""
        onChange={() => {}}
        rightElement={<button>Show</button>}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Show' }),
    ).toBeInTheDocument()
  })

  it('handles focus and blur', async () => {
    const user = userEvent.setup()

    render(
      <Input
        label="Username"
        placeholder="Enter username"
        icon={<span>Icon</span>}
        value=""
        onChange={() => {}}
      />,
    )

    const input = screen.getByPlaceholderText('Enter username')

    await user.click(input)
    expect(input).toHaveFocus()

    await user.tab()
    expect(input).not.toHaveFocus()
  })
})