import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../components/ThemeToggle';

const mockSetTheme = jest.fn();

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));
import { useTheme } from 'next-themes';
const mockUseTheme = useTheme as jest.Mock;

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders the toggle button', () => {
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /Toggle theme/i })).toBeInTheDocument();
  });

  it('calls setTheme with "dark" when the current theme is light', async () => {
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /Toggle theme/i }));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when the current theme is dark', async () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /Toggle theme/i }));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('renders the aria-label "Toggle theme"', () => {
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
    render(<ThemeToggle />);
    const btn = screen.getByLabelText('Toggle theme');
    expect(btn).toBeInTheDocument();
  });
});
