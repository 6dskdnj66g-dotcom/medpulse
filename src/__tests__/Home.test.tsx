import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import { Role } from '../types/auth';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('../hooks/useAuth');
import { useAuth } from '../hooks/useAuth';
const mockUseAuth = useAuth as jest.Mock;

describe('Home Dashboard', () => {
  it('renders loading state while authenticating', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    render(<Home />);
    expect(screen.getByText(/Authenticating your secure session/i)).toBeInTheDocument();
  });

  it('renders sign-in prompt when no user is logged in', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    render(<Home />);
    expect(screen.getByText(/Please sign in/i)).toBeInTheDocument();
  });

  it('renders student dashboard for a student user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'usr_1', name: 'Dr. User', email: 'user@medpulse.io', role: Role.STUDENT },
      isLoading: false,
    });
    render(<Home />);
    expect(screen.getByText(/Welcome back, Future Doctor/i)).toBeInTheDocument();
  });

  it('renders professor dashboard for a professor user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'usr_2', name: 'Prof. Smith', email: 'prof@medpulse.io', role: Role.PROFESSOR },
      isLoading: false,
    });
    render(<Home />);
    expect(screen.getByText(/Verified HQ/i)).toBeInTheDocument();
  });
});
