/**
 * React Component Tests
 * 
 * Simple tests for core React components:
 * - App renders without crashing
 * - Login component displays correctly
 * - Header shows navigation elements
 * - Footer displays company info
 * 
 * Run with: npm test
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';

// Helper function to render components with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Core Component Tests', () => {

  // Test 1: App component renders without errors
  test('App renders without crashing', () => {
    renderWithRouter(<App />);
    // If no error is thrown, test passes
  });

  // Test 2: Header displays company name
  test('Header displays Achilles Ltd branding', () => {
    renderWithRouter(<Header user={null} onLogout={() => {}} />);
    
    // Check if company name is displayed
    const companyName = screen.getByText(/Achilles Ltd/i);
    expect(companyName).toBeInTheDocument();
  });

  // Test 3: Header shows login/register for logged out users
  test('Header shows Login and Register links when not logged in', () => {
    renderWithRouter(<Header user={null} onLogout={() => {}} />);
    
    // Should show login and register links
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  // Test 4: Header shows user menu when logged in
  test('Header shows user menu when logged in', () => {
    const mockUser = {
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };
    
    renderWithRouter(<Header user={mockUser} onLogout={() => {}} />);
    
    // Should show welcome message and logout button
    expect(screen.getByText(/Welcome, testuser/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  // Test 5: Header shows Admin Panel link for admins
  test('Header shows Admin Panel link for admin users', () => {
    const mockAdmin = {
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    
    renderWithRouter(<Header user={mockAdmin} onLogout={() => {}} />);
    
    // Should show Admin Panel link
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
  });

  // Test 6: Footer displays company information
  test('Footer displays company tagline and contact info', () => {
    render(<Footer />);
    
    // Check for company tagline
    expect(screen.getByText(/Strength in Management/i)).toBeInTheDocument();
    
    // Check for contact information
    expect(screen.getByText(/info@achilles-ltd.com/i)).toBeInTheDocument();
  });

  // Test 7: Login form has required input fields
  test('Login form displays email and password fields', () => {
    const mockOnLogin = jest.fn();
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    // Check for email input
    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    
    // Check for password input
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check for login button
    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  // Test 8: Login form has link to register page
  test('Login form displays link to registration page', () => {
    const mockOnLogin = jest.fn();
    renderWithRouter(<Login onLogin={mockOnLogin} />);
    
    // Should have a link to register
    const registerLink = screen.getByText(/Register here/i);
    expect(registerLink).toBeInTheDocument();
  });

});

