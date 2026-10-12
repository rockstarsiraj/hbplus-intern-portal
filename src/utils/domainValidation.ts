import { APP_CONFIG } from '../constants/appConfig';
import { DomainValidationResult } from '../types/auth';

/**
 * Validates whether an authenticated email belongs to the strictly authorized domain.
 * 
 * Strict Security Rules:
 * 1. Email string must exist and not be empty or whitespace.
 * 2. Identity provider must report emailVerified === true.
 * 3. Email format must be structurally valid with exactly one '@' separator.
 * 4. Extracted domain must match APP_CONFIG.ALLOWED_DOMAIN ('hbplus.fit') exactly (case-insensitive).
 * 5. Rejects subdomains (e.g., user@sub.hbplus.fit, user@hbplus.fit.attacker.com) and lookalikes.
 * 
 * @param email The authenticated user's email from Firebase
 * @param emailVerified The email verification boolean flag from Firebase
 * @returns DomainValidationResult
 */
export function validateAuthorizedDomain(
  email: string | null | undefined,
  emailVerified: boolean | undefined
): DomainValidationResult {
  // Rule 1: Check existence
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      errorCode: 'MISSING_EMAIL',
      errorMessage: 'Authentication failed: No verified email address was provided by Google.',
    };
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      errorCode: 'MISSING_EMAIL',
      errorMessage: 'Authentication failed: Empty email address received.',
    };
  }

  // Rule 2: Email verification check
  if (!emailVerified) {
    return {
      isValid: false,
      errorCode: 'UNVERIFIED_EMAIL',
      email: trimmedEmail,
      errorMessage:
        'Access denied: Your Google email address is unverified. Only verified organization accounts are permitted.',
    };
  }

  // Rule 3: Syntactic check - must contain exactly one '@'
  const atParts = trimmedEmail.split('@');
  if (atParts.length !== 2) {
    return {
      isValid: false,
      errorCode: 'MALFORMED_EMAIL',
      email: trimmedEmail,
      errorMessage: 'Authentication failed: Malformed email structure.',
    };
  }

  const [localPart, domainPart] = atParts;
  if (!localPart || !domainPart || domainPart.includes('@') || domainPart.includes(' ')) {
    return {
      isValid: false,
      errorCode: 'MALFORMED_EMAIL',
      email: trimmedEmail,
      errorMessage: 'Authentication failed: Malformed email username or domain.',
    };
  }

  // Basic RFC-compliant local part check (must not start or end with a dot, etc.)
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return {
      isValid: false,
      errorCode: 'MALFORMED_EMAIL',
      email: trimmedEmail,
      errorMessage: 'Authentication failed: Malformed local email address portion.',
    };
  }

  // Rule 4: Domain extraction and strict case-insensitive equality
  const normalizedDomain = domainPart.toLowerCase().trim();
  const allowedDomain = APP_CONFIG.ALLOWED_DOMAIN.toLowerCase().trim();

  // Strict exact comparison
  if (normalizedDomain !== allowedDomain) {
    return {
      isValid: false,
      errorCode: 'UNAUTHORIZED_DOMAIN',
      email: trimmedEmail,
      extractedDomain: normalizedDomain,
      errorMessage: `Access restricted: This application is available only to authorized users with an @${APP_CONFIG.ALLOWED_DOMAIN} email address. Your account domain (${normalizedDomain}) is not authorized.`,
    };
  }

  return {
    isValid: true,
    email: trimmedEmail,
    extractedDomain: normalizedDomain,
  };
}

/**
 * Helper to extract domain safely from any email string.
 */
export function extractEmailDomain(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') return null;
  const parts = email.trim().split('@');
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase().trim() || null;
}
