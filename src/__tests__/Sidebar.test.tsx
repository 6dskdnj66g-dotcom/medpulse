import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { Role } from '../types/auth';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));
jest.mock('../hooks/useAuth');
jest.mock('../components/AchievementContext');
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ theme: 'light', setTheme: jest.fn() })),
}));

import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAchievement } from '../components/AchievementContext';
const mockUsePathname = usePathname as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseAchievement = useAchievement as jest.Mock;

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

const adminUser = {
  id: 'u3',
  name: 'Admin User',
  email: 'a@m.io',
  role: Role.ADMIN,
};

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    mockUseAuth.mockReturnValue({ user: studentUser });
    mockUseAchievement.mockReturnValue({ xp: 250 });
  });

  it('renders the MedPulse logo text', () => {
    render(<Sidebar />);
    expect(screen.getByText('MedPulse')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Encyclopedia')).toBeInTheDocument();
    expect(screen.getByText('MDT Debate')).toBeInTheDocument();
    expect(screen.getByText('AI Professors')).toBeInTheDocument();
    expect(screen.getByText('Medical Summarizer')).toBeInTheDocument();
    expect(screen.getByText('OSCE Simulator')).toBeInTheDocument();
  });

  it('renders the user name in the profile footer', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dr. User')).toBeInTheDocument();
  });

  it('renders the user initials in the avatar', () => {
    render(<Sidebar />);
    // "Dr. User" → initials "DU"
    expect(screen.getByText('DU')).toBeInTheDocument();
  });

  it('shows "Loading..." when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<Sidebar />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "Student Account" badge for a student user', () => {
    render(<Sidebar />);
    expect(screen.getByText('Student Account')).toBeInTheDocument();
  });

  it('shows "Professor Account" badge for a professor user', () => {
    mockUseAuth.mockReturnValue({ user: professorUser });
    render(<Sidebar />);
    expect(screen.getByText('Professor Account')).toBeInTheDocument();
  });

  it('shows "Admin Account" badge for an admin user', () => {
    mockUseAuth.mockReturnValue({ user: adminUser });
    render(<Sidebar />);
    expect(screen.getByText('Admin Account')).toBeInTheDocument();
  });

  it('renders the XP value from the achievement context', () => {
    render(<Sidebar />);
    expect(screen.getByText('250 XP')).toBeInTheDocument();
  });

  it('marks the Dashboard link as active when pathname is "/"', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a')!;
    expect(dashboardLink.className).toContain('bg-sky-50');
  });

  it('marks the Encyclopedia link as active when pathname starts with "/encyclopedia"', () => {
    mockUsePathname.mockReturnValue('/encyclopedia/cardiology');
    render(<Sidebar />);
    const encyclopediaLink = screen.getByText('Encyclopedia').closest('a')!;
    expect(encyclopediaLink.className).toContain('bg-sky-50');
  });

  it('does not mark Dashboard as active when on a different route', () => {
    mockUsePathname.mockReturnValue('/encyclopedia');
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a')!;
    expect(dashboardLink.className).not.toContain('bg-sky-50');
  });
});
