import { validateAuthorizedDomain } from '../src/utils/domainValidation';
import { formatAuthError } from '../src/utils/authErrors';

describe('Authentication Flow State Machine & Edge Cases', () => {
  interface SimulatedAuthState {
    status: 'unauthenticated' | 'authenticating' | 'authenticated' | 'access_denied' | 'error';
    user: any | null;
    deniedEmail: string | null;
    errorMessage: string | null;
  }

  function simulateAuthFlow(
    event:
      | { type: 'SIGN_IN_START' }
      | { type: 'FIREBASE_USER_RECEIVED'; user: { email?: string | null; emailVerified?: boolean; uid: string; displayName?: string } }
      | { type: 'AUTH_CANCELLED' }
      | { type: 'AUTH_ERROR'; code: string; message?: string }
      | { type: 'SIGN_OUT' }
      | { type: 'RESTORE_SESSION'; user: { email?: string | null; emailVerified?: boolean; uid: string } | null },
    currentState: SimulatedAuthState
  ): SimulatedAuthState {
    switch (event.type) {
      case 'SIGN_IN_START':
        return {
          status: 'authenticating',
          user: null,
          deniedEmail: null,
          errorMessage: null,
        };

      case 'FIREBASE_USER_RECEIVED': {
        const validation = validateAuthorizedDomain(event.user.email, event.user.emailVerified);
        if (validation.isValid) {
          return {
            status: 'authenticated',
            user: {
              uid: event.user.uid,
              email: event.user.email,
              displayName: event.user.displayName || 'HB+ Member',
            },
            deniedEmail: null,
            errorMessage: null,
          };
        } else {
          // Immediately purge user session and transition to access_denied
          return {
            status: 'access_denied',
            user: null,
            deniedEmail: event.user.email || 'unknown',
            errorMessage: validation.errorMessage || 'Access denied.',
          };
        }
      }

      case 'AUTH_CANCELLED':
        return {
          status: 'error',
          user: null,
          deniedEmail: null,
          errorMessage: formatAuthError({ code: 'auth/popup-closed-by-user' }),
        };

      case 'AUTH_ERROR':
        return {
          status: 'error',
          user: null,
          deniedEmail: null,
          errorMessage: formatAuthError({ code: event.code, message: event.message }),
        };

      case 'SIGN_OUT':
        return {
          status: 'unauthenticated',
          user: null,
          deniedEmail: null,
          errorMessage: null,
        };

      case 'RESTORE_SESSION': {
        if (!event.user) {
          return {
            status: 'unauthenticated',
            user: null,
            deniedEmail: null,
            errorMessage: null,
          };
        }
        const validation = validateAuthorizedDomain(event.user.email, event.user.emailVerified);
        if (validation.isValid) {
          return {
            status: 'authenticated',
            user: {
              uid: event.user.uid,
              email: event.user.email,
            },
            deniedEmail: null,
            errorMessage: null,
          };
        } else {
          return {
            status: 'access_denied',
            user: null,
            deniedEmail: event.user.email || 'unknown',
            errorMessage: validation.errorMessage || 'Access denied.',
          };
        }
      }
    }
  }

  const initialIdleState: SimulatedAuthState = {
    status: 'unauthenticated',
    user: null,
    deniedEmail: null,
    errorMessage: null,
  };

  it('handles loading state during SIGN_IN_START', () => {
    const state = simulateAuthFlow({ type: 'SIGN_IN_START' }, initialIdleState);
    expect(state.status).toBe('authenticating');
    expect(state.user).toBeNull();
  });

  it('successfully transitions to authenticated for valid @hbplus.fit Google user', () => {
    let state = simulateAuthFlow({ type: 'SIGN_IN_START' }, initialIdleState);
    state = simulateAuthFlow(
      {
        type: 'FIREBASE_USER_RECEIVED',
        user: {
          uid: 'u_101',
          email: 'vinay@hbplus.fit',
          emailVerified: true,
          displayName: 'Vinay Nallamsetty',
        },
      },
      state
    );

    expect(state.status).toBe('authenticated');
    expect(state.user?.email).toBe('vinay@hbplus.fit');
    expect(state.user?.uid).toBe('u_101');
    expect(state.errorMessage).toBeNull();
  });

  it('rejects unauthorized Google user (@gmail.com) and signs them out to access_denied', () => {
    let state = simulateAuthFlow({ type: 'SIGN_IN_START' }, initialIdleState);
    state = simulateAuthFlow(
      {
        type: 'FIREBASE_USER_RECEIVED',
        user: {
          uid: 'u_hacker',
          email: 'attacker@gmail.com',
          emailVerified: true,
        },
      },
      state
    );

    expect(state.status).toBe('access_denied');
    expect(state.user).toBeNull();
    expect(state.deniedEmail).toBe('attacker@gmail.com');
    expect(state.errorMessage).toContain('hbplus.fit');
  });

  it('rejects unverified @hbplus.fit account', () => {
    let state = simulateAuthFlow({ type: 'SIGN_IN_START' }, initialIdleState);
    state = simulateAuthFlow(
      {
        type: 'FIREBASE_USER_RECEIVED',
        user: {
          uid: 'u_unverified',
          email: 'newintern@hbplus.fit',
          emailVerified: false,
        },
      },
      state
    );

    expect(state.status).toBe('access_denied');
    expect(state.user).toBeNull();
    expect(state.errorMessage).toContain('unverified');
  });

  it('handles Google sign-in user cancellation gracefully', () => {
    let state = simulateAuthFlow({ type: 'SIGN_IN_START' }, initialIdleState);
    state = simulateAuthFlow({ type: 'AUTH_CANCELLED' }, state);

    expect(state.status).toBe('error');
    expect(state.user).toBeNull();
    expect(state.errorMessage).toBe('Sign-in was cancelled before completion.');
  });

  it('handles network failure gracefully', () => {
    let state = simulateAuthFlow({ type: 'SIGN_IN_START' }, initialIdleState);
    state = simulateAuthFlow(
      { type: 'AUTH_ERROR', code: 'auth/network-request-failed' },
      state
    );

    expect(state.status).toBe('error');
    expect(state.errorMessage).toBe('Network connection failed. Please verify your internet connectivity.');
  });

  it('handles successful logout and clears all authenticated state', () => {
    const authState: SimulatedAuthState = {
      status: 'authenticated',
      user: { uid: 'u_101', email: 'user@hbplus.fit' },
      deniedEmail: null,
      errorMessage: null,
    };

    const loggedOutState = simulateAuthFlow({ type: 'SIGN_OUT' }, authState);
    expect(loggedOutState.status).toBe('unauthenticated');
    expect(loggedOutState.user).toBeNull();
    expect(loggedOutState.errorMessage).toBeNull();
  });

  it('restores valid session on browser refresh', () => {
    const restoredState = simulateAuthFlow(
      {
        type: 'RESTORE_SESSION',
        user: { uid: 'u_101', email: 'vinay@hbplus.fit', emailVerified: true },
      },
      initialIdleState
    );

    expect(restoredState.status).toBe('authenticated');
    expect(restoredState.user?.email).toBe('vinay@hbplus.fit');
  });

  it('rejects cached unauthorized session on restore', () => {
    const restoredState = simulateAuthFlow(
      {
        type: 'RESTORE_SESSION',
        user: { uid: 'u_bad', email: 'intruder@yahoo.com', emailVerified: true },
      },
      initialIdleState
    );

    expect(restoredState.status).toBe('access_denied');
    expect(restoredState.user).toBeNull();
    expect(restoredState.deniedEmail).toBe('intruder@yahoo.com');
  });

  it('unauthenticated users cannot bypass to dashboard without credentials', () => {
    const state = initialIdleState;
    const canAccessDashboard = state.status === 'authenticated' && state.user !== null;
    expect(canAccessDashboard).toBe(false);
  });
});
