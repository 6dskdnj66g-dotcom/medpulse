import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ProfessorDashboard } from '../components/dashboard/ProfessorDashboard';

describe('ProfessorDashboard', () => {
  it('renders the Verified HQ heading', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Verified HQ')).toBeInTheDocument();
  });

  it('renders the Human-in-the-Loop Active badge', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Human-in-the-Loop Active')).toBeInTheDocument();
  });

  it('renders all three stat cards', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Total Articles')).toBeInTheDocument();
    expect(screen.getByText('Active Students')).toBeInTheDocument();
    expect(screen.getByText('Queries Today')).toBeInTheDocument();
  });

  it('renders the correct stat values', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('13,630')).toBeInTheDocument();
    expect(screen.getByText('2,841')).toBeInTheDocument();
    expect(screen.getByText('487')).toBeInTheDocument();
  });

  it('renders the Pending AI Validations section', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Pending AI Validations')).toBeInTheDocument();
  });

  it('shows the correct urgent count badge (2 urgent)', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('2 Urgent')).toBeInTheDocument();
  });

  it('renders all three pending review items', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Pathology Flag')).toBeInTheDocument();
    expect(screen.getByText('User Query Flag')).toBeInTheDocument();
    expect(screen.getByText('Content Update')).toBeInTheDocument();
  });

  it('renders the Approve and Edit Output action buttons for each review', () => {
    render(<ProfessorDashboard />);
    const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
    const editButtons = screen.getAllByRole('button', { name: /Edit Output/i });
    expect(approveButtons).toHaveLength(3);
    expect(editButtons).toHaveLength(3);
  });

  it('renders the Publishing section', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Publishing')).toBeInTheDocument();
    expect(screen.getByText('Author New Article')).toBeInTheDocument();
  });

  it('renders the authorship stats', () => {
    render(<ProfessorDashboard />);
    expect(screen.getByText('Articles Authored')).toBeInTheDocument();
    expect(screen.getByText('Validations Done')).toBeInTheDocument();
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
  });

  it('renders the description of the global encyclopedia submission', () => {
    render(<ProfessorDashboard />);
    expect(
      screen.getByText(/Submit peer-reviewed content to the Global Encyclopedia vector database/i)
    ).toBeInTheDocument();
  });
});
