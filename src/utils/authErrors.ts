/**
 * Authentication Error Formatters
 * Converts technical Firebase and OAuth error codes into user-friendly messages
 */

export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled before completion.';
    case 'auth/cancelled-popup-request':
      return 'Authentication request was replaced by a newer attempt.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please verify your internet connectivity.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Please add your current URL to Authorized Domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Authentication console.';
    case 'auth/invalid-api-key':
      return 'The configured Firebase API Key is invalid.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address using another sign-in method.';
    default:
      if (typeof message === 'string' && message.includes('missing-config')) {
        return 'Firebase client configuration is missing or incomplete in your .env file.';
      }
      return message || 'Authentication failed. Please try again.';
  }
}
