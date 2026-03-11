import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Register component', () => {
  beforeEach(() => {
    // Mock fetch for registration API calls.
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows simple password validation errors', async () => {
    const onLogin = jest.fn();

    renderWithRouter(<Register onLogin={onLogin} />);

    // Enter weak password to trigger client-side validation.
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weak' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    // At least one password rule error should be shown.
    expect(await screen.findByText(/at least 8 characters long/i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('registers successfully and calls onLogin', async () => {
    const onLogin = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'register-token',
        user: { id: 2, username: 'newuser', email: 'new@test.com', role: 'user' }
      })
    });

    renderWithRouter(<Register onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Strong@123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Strong@123' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com' }),
        'register-token'
      );
    });
  });
});
