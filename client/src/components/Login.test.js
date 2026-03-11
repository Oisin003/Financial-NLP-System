import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

// Simple helper to wrap components that use <Link>.
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Login component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test.
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('submits credentials and calls onLogin on success', async () => {
    const onLogin = jest.fn();

    // Mock a successful login response from the API.
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'token-123',
        user: { id: 1, username: 'demo', email: 'demo@test.com', role: 'user' }
      })
    });

    renderWithRouter(<Login onLogin={onLogin} />);

    // Fill in email and password.
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'demo@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Demo@123' }
    });

    // Submit the form.
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify parent callback receives user + token.
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'demo@test.com' }),
        'token-123'
      );
    });
  });

  test('shows error message when login fails', async () => {
    const onLogin = jest.fn();

    // Mock a failed login response.
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' })
    });

    renderWithRouter(<Login onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'demo@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'WrongPass1!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Error should be visible and callback should not run.
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });
});
