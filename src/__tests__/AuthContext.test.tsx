import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/core/auth/AuthContext';
import { Role } from '../types/auth';
import React from 'react';

// Helper component that renders auth context values
function AuthConsumer() {
  const { user, isLoading, hasRole } = useAuth();
  if (isLoading) return <div>loading</div>;
  if (!user) return <div>no user</div>;
  return (
    <div>
      <span data-testid="name">{user.name}</span>
      <span data-testid="role">{user.role}</span>
      <span data-testid="has-student">{hasRole([Role.STUDENT]) ? 'yes' : 'no'}</span>
      <span data-testid="has-professor">{hasRole([Role.PROFESSOR]) ? 'yes' : 'no'}</span>
    </div>
  );
}

// Helper component for toggleRole
function RoleToggler() {
  const { user, toggleRole } = useAuth();
  return (
    <div>
      <span data-testid="current-role">{user?.role}</span>
      <button onClick={() => toggleRole(Role.PROFESSOR)}>Be Professor</button>
      <button onClick={() => toggleRole(Role.STUDENT)}>Be Student</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('throws when useAuth is used outside of AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });

  it('provides initial loading state and then sets mock user', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // After effects are flushed, user is set to the mock user
    await waitFor(() => expect(screen.getByTestId('name')).toBeInTheDocument());
    expect(screen.getByTestId('name')).toHaveTextContent('Dr. User');
    expect(screen.getByTestId('role')).toHaveTextContent(Role.STUDENT);
  });

  it('hasRole returns true for the correct role', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('has-student')).toBeInTheDocument());
    expect(screen.getByTestId('has-student')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-professor')).toHaveTextContent('no');
  });

  it('hasRole accepts multiple roles and returns true if any match', async () => {
    function MultiRoleConsumer() {
      const { hasRole } = useAuth();
      return (
        <span data-testid="multi">
          {hasRole([Role.STUDENT, Role.PROFESSOR]) ? 'yes' : 'no'}
        </span>
      );
    }
    render(
      <AuthProvider>
        <MultiRoleConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('multi')).toHaveTextContent('yes'));
  });

  it('toggleRole updates the user role and the cookie', async () => {
    render(
      <AuthProvider>
        <RoleToggler />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('current-role')).toHaveTextContent(Role.STUDENT)
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Be Professor'));
    });

    expect(screen.getByTestId('current-role')).toHaveTextContent(Role.PROFESSOR);
    expect(document.cookie).toContain(`user-role=${Role.PROFESSOR}`);
  });

  it('sets cookie on initial mount', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('role')).toBeInTheDocument());
    expect(document.cookie).toContain(`user-role=${Role.STUDENT}`);
  });
});

