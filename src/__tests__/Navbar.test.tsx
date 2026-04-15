import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '../components/Navbar';
import { Role } from '../types/auth';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));
jest.mock('../hooks/useAuth');
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', setTheme: jest.fn() })),
}));

import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
const mockUsePathname = usePathname as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const studentUser = {
  id: 'u1',
  name: 'Dr. User',
  email: 'u@m.io',
  role: Role.STUDENT,
};

const professorUser = {
  id: 'u2',
  name: 'Prof. Smith',
  email: 'p@m.io',
  role: Role.PROFESSOR,
};

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    mockUseAuth.mockReturnValue({ user: studentUser });
  });

  it('renders the MedPulse AI brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('MedPulse AI')).toBeInTheDocument();
  });

  it('renders the STUDENT role badge for a student user', () => {
    render(<Navbar />);
    expect(screen.getByText('STUDENT')).toBeInTheDocument();
  });

  it('renders the PROF role badge for a professor user', () => {
    mockUseAuth.mockReturnValue({ user: professorUser });
    render(<Navbar />);
    expect(screen.getByText('PROF')).toBeInTheDocument();
  });

  it('does not render the role badge when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<Navbar />);
    expect(screen.queryByText('STUDENT')).not.toBeInTheDocument();
    expect(screen.queryByText('PROF')).not.toBeInTheDocument();
  });

  it('toggles the mobile menu open when the menu button is clicked', async () => {
    render(<Navbar />);
    // Mobile nav items should not be visible initially
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    const menuButton = screen.getByLabelText('Toggle menu');
    await userEvent.click(menuButton);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('closes the mobile menu when the menu button is clicked again', async () => {
    render(<Navbar />);
    const menuButton = screen.getByLabelText('Toggle menu');
    await userEvent.click(menuButton); // open
    await userEvent.click(menuButton); // close
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders all navigation links when the menu is open', async () => {
    render(<Navbar />);
    await userEvent.click(screen.getByLabelText('Toggle menu'));
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Encyclopedia')).toBeInTheDocument();
    expect(screen.getByText('MDT Debate')).toBeInTheDocument();
    expect(screen.getByText('AI Professors')).toBeInTheDocument();
    expect(screen.getByText('Medical Summarizer')).toBeInTheDocument();
  });

  it('closes the menu when a navigation link is clicked', async () => {
    render(<Navbar />);
    await userEvent.click(screen.getByLabelText('Toggle menu'));
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Dashboard'));
    expect(screen.queryByText('Encyclopedia')).not.toBeInTheDocument();
  });
});
