import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import { AuthProvider } from '../components/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Home Dashboard', () => {
  it('renders the welcome heading', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    
    // Check if the dashboard title loads
    const heading = screen.getByText(/Welcome back, Future Doctor/i);
    expect(heading).toBeInTheDocument();
  });
});
