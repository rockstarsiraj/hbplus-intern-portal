import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, checkFirebaseConfiguration } from '../services/firebase';
import {
  authService,
  mapFirebaseUserToAuthUser,
} from '../services/authService';
import { validateAuthorizedDomain } from '../utils/domainValidation';
import { AuthContextValue, AuthStatus, AuthUser } from '../types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);

  const { isConfigured, missingKeys } = useMemo(() => checkFirebaseConfiguration(), []);
  const configError = isConfigured
    ? null
    : `Firebase environment variables missing: ${missingKeys.join(', ')}. Please check .env.`;

  // Synchronize with Firebase Auth state on mount (handles page refresh & session restoration)
  useEffect(() => {
    if (!isConfigured || !auth) {
      setStatus('unauthenticated');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        // Re-validate domain strictly on session restore
        const validation = validateAuthorizedDomain(fbUser.email, fbUser.emailVerified);

        if (validation.isValid) {
          const appUser = mapFirebaseUserToAuthUser(fbUser);
          setUser(appUser);
          setStatus('authenticated');
          setError(null);
          setDeniedEmail(null);
        } else {
          // Reject and purge session
          const badEmail = fbUser.email || 'unknown';
          await authService.signOut();
          setUser(null);
          setDeniedEmail(badEmail);
          setError(validation.errorMessage || 'Access restricted to @hbplus.fit domain.');
          setStatus('access_denied');
        }
      } else {
        // Only set unauthenticated if we're not currently displaying access_denied
        setUser(null);
        setStatus((prev) => (prev === 'access_denied' ? 'access_denied' : 'unauthenticated'));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConfigured]);

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      setError(configError);
      setStatus('error');
      return;
    }

    setStatus('authenticating');
    setError(null);
    setDeniedEmail(null);

    const result = await authService.signInWithGoogle();

    if (result.success && result.user) {
      setUser(result.user);
      setStatus('authenticated');
      setError(null);
    } else if (result.isDomainRejected) {
      setUser(null);
      setDeniedEmail(result.deniedEmail || null);
      setError(result.errorMessage || 'Your domain is not permitted access.');
      setStatus('access_denied');
    } else {
      setUser(null);
      setError(result.errorMessage || 'Authentication failed.');
      setStatus('error');
    }
  };

  const signOut = async () => {
    setStatus('authenticating');
    await authService.signOut();
    setUser(null);
    setError(null);
    setDeniedEmail(null);
    setStatus('unauthenticated');
  };

  const resetError = () => {
    setError(null);
    setDeniedEmail(null);
    setStatus('unauthenticated');
  };

  const value: AuthContextValue = {
    status,
    user,
    error,
    deniedEmail,
    signInWithGoogle,
    signOut,
    resetError,
    isConfigured,
    configError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
