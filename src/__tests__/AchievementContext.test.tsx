import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AchievementProvider, useAchievement } from '../components/AchievementContext';
import React from 'react';

function AchievementConsumer() {
  const { xp, addXp, recentAchievement } = useAchievement();
  return (
    <div>
      <span data-testid="xp">{xp}</span>
      <button onClick={() => addXp(50, 'Test Achievement')}>Add 50 XP</button>
      {recentAchievement && (
        <div data-testid="achievement">
          <span data-testid="achievement-amount">{recentAchievement.amount}</span>
          <span data-testid="achievement-reason">{recentAchievement.reason}</span>
        </div>
      )}
    </div>
  );
}

describe('AchievementContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('throws when useAchievement is used outside of AchievementProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AchievementConsumer />)).toThrow(
      'useAchievement must be used within an AchievementProvider'
    );
    spy.mockRestore();
  });

  it('provides initial XP of 0', () => {
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );
    expect(screen.getByTestId('xp')).toHaveTextContent('0');
  });

  it('loads persisted XP from localStorage on mount', async () => {
    localStorage.setItem('medpulse_xp', '120');
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('xp')).toHaveTextContent('120')
    );
  });

  it('addXp increases the XP value', async () => {
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );

    await userEvent.click(screen.getByText('Add 50 XP'));
    expect(screen.getByTestId('xp')).toHaveTextContent('50');
  });

  it('addXp persists the new XP to localStorage', async () => {
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );

    await userEvent.click(screen.getByText('Add 50 XP'));
    expect(localStorage.getItem('medpulse_xp')).toBe('50');
  });

  it('addXp accumulates across multiple calls', async () => {
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );

    await userEvent.click(screen.getByText('Add 50 XP'));
    await userEvent.click(screen.getByText('Add 50 XP'));
    expect(screen.getByTestId('xp')).toHaveTextContent('100');
    expect(localStorage.getItem('medpulse_xp')).toBe('100');
  });

  it('addXp shows a recentAchievement toast', async () => {
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );

    await userEvent.click(screen.getByText('Add 50 XP'));
    expect(screen.getByTestId('achievement')).toBeInTheDocument();
    expect(screen.getByTestId('achievement-amount')).toHaveTextContent('50');
    expect(screen.getByTestId('achievement-reason')).toHaveTextContent('Test Achievement');
  });

  it('recentAchievement is cleared after 4 seconds', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );

    await user.click(screen.getByText('Add 50 XP'));
    expect(screen.getByTestId('achievement')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    await waitFor(() =>
      expect(screen.queryByTestId('achievement')).not.toBeInTheDocument()
    );

    jest.useRealTimers();
  });

  it('renders the XP toast notification with provider children', async () => {
    render(
      <AchievementProvider>
        <AchievementConsumer />
      </AchievementProvider>
    );

    await userEvent.click(screen.getByText('Add 50 XP'));
    // The provider renders a toast element with "+{amount} XP"
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
    // Verify at least one element with the reason text is shown
    const achievementTexts = screen.getAllByText('Test Achievement');
    expect(achievementTexts.length).toBeGreaterThanOrEqual(1);
  });
});
