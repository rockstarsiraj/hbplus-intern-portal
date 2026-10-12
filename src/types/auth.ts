/**
 * Authentication and Domain Verification Types
 */

export type DomainValidationErrorCode =
  | 'MISSING_EMAIL'
  | 'UNVERIFIED_EMAIL'
  | 'MALFORMED_EMAIL'
  | 'UNAUTHORIZED_DOMAIN';

export interface DomainValidationResult {
  isValid: boolean;
  errorCode?: DomainValidationErrorCode;
  email?: string;
  extractedDomain?: string;
  errorMessage?: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  idToken?: string;
}

export type AuthStatus =
  | 'initializing'
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'access_denied'
  | 'error';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  deniedEmail: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetError: () => void;
  isConfigured: boolean;
  configError: string | null;
}
