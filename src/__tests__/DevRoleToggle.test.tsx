import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DevRoleToggle } from '../components/DevRoleToggle';
import { Role } from '../types/auth';

jest.mock('@/core/auth/AuthContext');
import { useAuth } from '@/core/auth/AuthContext';
const mockUseAuth = useAuth as jest.Mock;

describe('DevRoleToggle', () => {
  it('renders nothing when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null, toggleRole: jest.fn() });
    const { container } = render(<DevRoleToggle />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the role toggle buttons when a user is logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Dr. User', email: 'u@m.io', role: Role.STUDENT },
      toggleRole: jest.fn(),
    });
    render(<DevRoleToggle />);
    expect(screen.getByText('Student View')).toBeInTheDocument();
    expect(screen.getByText('Professor View')).toBeInTheDocument();
  });

  it('highlights the Student View button when the current role is STUDENT', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Dr. User', email: 'u@m.io', role: Role.STUDENT },
      toggleRole: jest.fn(),
    });
    render(<DevRoleToggle />);
    const studentBtn = screen.getByText('Student View').closest('button')!;
    expect(studentBtn.className).toContain('bg-sky-500');
  });

  it('highlights the Professor View button when the current role is PROFESSOR', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Prof. Smith', email: 'p@m.io', role: Role.PROFESSOR },
      toggleRole: jest.fn(),
    });
    render(<DevRoleToggle />);
    const profBtn = screen.getByText('Professor View').closest('button')!;
    expect(profBtn.className).toContain('bg-teal-500');
  });

  it('calls toggleRole with PROFESSOR when Professor View is clicked', async () => {
    const toggleRole = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Dr. User', email: 'u@m.io', role: Role.STUDENT },
      toggleRole,
    });
    render(<DevRoleToggle />);
    await userEvent.click(screen.getByText('Professor View'));
    expect(toggleRole).toHaveBeenCalledWith(Role.PROFESSOR);
  });

  it('calls toggleRole with STUDENT when Student View is clicked', async () => {
    const toggleRole = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', name: 'Prof. Smith', email: 'p@m.io', role: Role.PROFESSOR },
      toggleRole,
    });
    render(<DevRoleToggle />);
    await userEvent.click(screen.getByText('Student View'));
    expect(toggleRole).toHaveBeenCalledWith(Role.STUDENT);
  });
});

