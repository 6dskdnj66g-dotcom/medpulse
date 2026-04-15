import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

// next/link is handled automatically by next/jest
describe('StudentDashboard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the welcome heading', () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Welcome back, Future Doctor/i)).toBeInTheDocument();
  });

  it('renders the encyclopedia search section', () => {
    render(<StudentDashboard />);
    expect(screen.getByText('Query the Medical Encyclopedia')).toBeInTheDocument();
  });

  it('renders the search input field', () => {
    render(<StudentDashboard />);
    expect(
      screen.getByPlaceholderText(/Pathophysiology of Heart Failure/i)
    ).toBeInTheDocument();
  });

  it('navigates to the encyclopedia with the search query on form submit', async () => {
    render(<StudentDashboard />);
    const input = screen.getByPlaceholderText(/Pathophysiology of Heart Failure/i);
    await userEvent.type(input, 'atrial fibrillation');
    await userEvent.click(screen.getByRole('button', { name: /Search/i }));
    expect(mockPush).toHaveBeenCalledWith(
      '/encyclopedia?q=atrial%20fibrillation'
    );
  });

  it('does not navigate when the search query is empty or whitespace', async () => {
    render(<StudentDashboard />);
    await userEvent.click(screen.getByRole('button', { name: /Search/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders the quick links (Cardiology, Pharmacology, Neurology, Pathology)', () => {
    render(<StudentDashboard />);
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    expect(screen.getByText('Pharmacology')).toBeInTheDocument();
    expect(screen.getByText('Neurology')).toBeInTheDocument();
    expect(screen.getByText('Pathology')).toBeInTheDocument();
  });

  it('renders the AI Summarizer link card', () => {
    render(<StudentDashboard />);
    expect(screen.getByText('AI Summarizer')).toBeInTheDocument();
    expect(screen.getByText('Open Summarizer')).toBeInTheDocument();
  });

  it('renders the saved flashcard sets', () => {
    render(<StudentDashboard />);
    expect(screen.getByText('Cardiology: Arrhythmias')).toBeInTheDocument();
    expect(screen.getByText('Pharmacology: Antibiotics')).toBeInTheDocument();
    expect(screen.getByText('Neurology: Stroke Protocols')).toBeInTheDocument();
  });

  it('renders the "View All Saved Sets" button', () => {
    render(<StudentDashboard />);
    expect(
      screen.getByRole('button', { name: /View All Saved Sets/i })
    ).toBeInTheDocument();
  });

  it('renders the Zero-Hallucination RAG Engine label', () => {
    render(<StudentDashboard />);
    expect(screen.getByText('Zero-Hallucination RAG Engine')).toBeInTheDocument();
  });
});
