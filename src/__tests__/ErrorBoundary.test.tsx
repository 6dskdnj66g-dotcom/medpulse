import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../components/ErrorBoundary';
import React from 'react';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Kaboom!');
  return <div>All good</div>;
}

describe('components/ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('System Anomaly Detected')).toBeInTheDocument();
    expect(screen.getByText('Retry Initialization')).toBeInTheDocument();
  });

  it('does not render children when in error state', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });

  it('shows error message in the error UI', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(
      screen.getByText(/Medical platform state encountered a critical interruption/i)
    ).toBeInTheDocument();
  });

  it('shows a Retry Initialization button in the error state', async () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    const retryBtn = screen.getByRole('button', { name: /Retry Initialization/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it('logs the error via console.error when componentDidCatch fires', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalled();
  });
});
