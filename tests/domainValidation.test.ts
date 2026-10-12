import { validateAuthorizedDomain, extractEmailDomain } from '../src/utils/domainValidation';
import { APP_CONFIG } from '../src/constants/appConfig';

describe('Domain Validation Security Engine', () => {
  describe('Authorized Domain Acceptance (@hbplus.fit)', () => {
    it('accepts standard verified lowercase email @hbplus.fit', () => {
      const result = validateAuthorizedDomain('user@hbplus.fit', true);
      expect(result.isValid).toBe(true);
      expect(result.email).toBe('user@hbplus.fit');
      expect(result.extractedDomain).toBe('hbplus.fit');
      expect(result.errorCode).toBeUndefined();
    });

    it('accepts uppercase email with case-insensitive normalization: VINAY@HBPLUS.FIT', () => {
      const result = validateAuthorizedDomain('VINAY@HBPLUS.FIT', true);
      expect(result.isValid).toBe(true);
      expect(result.email).toBe('VINAY@HBPLUS.FIT');
      expect(result.extractedDomain).toBe('hbplus.fit');
    });

    it('accepts mixed case email: Intern.Dev@HbPlus.Fit', () => {
      const result = validateAuthorizedDomain('Intern.Dev@HbPlus.Fit', true);
      expect(result.isValid).toBe(true);
      expect(result.extractedDomain).toBe('hbplus.fit');
    });

    it('trims outer whitespace from valid email', () => {
      const result = validateAuthorizedDomain('  employee@hbplus.fit  ', true);
      expect(result.isValid).toBe(true);
      expect(result.email).toBe('employee@hbplus.fit');
      expect(result.extractedDomain).toBe('hbplus.fit');
    });
  });

  describe('Unauthorized Domains Rejection', () => {
    it('rejects standard consumer gmail address: vinay@gmail.com', () => {
      const result = validateAuthorizedDomain('vinay@gmail.com', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
      expect(result.extractedDomain).toBe('gmail.com');
      expect(result.errorMessage).toContain('hbplus.fit');
    });

    it('rejects yahoo address: user@yahoo.com', () => {
      const result = validateAuthorizedDomain('user@yahoo.com', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
      expect(result.extractedDomain).toBe('yahoo.com');
    });

    it('rejects corporate domains outside hbplus: employee@google.com', () => {
      const result = validateAuthorizedDomain('employee@google.com', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
    });

    it('rejects lookalike domains: user@another-hbplus.fit', () => {
      const result = validateAuthorizedDomain('user@another-hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
      expect(result.extractedDomain).toBe('another-hbplus.fit');
    });

    it('rejects subdomain bypass attempt: user@sub.hbplus.fit', () => {
      const result = validateAuthorizedDomain('user@sub.hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
      expect(result.extractedDomain).toBe('sub.hbplus.fit');
    });

    it('rejects attacker suffix attack: user@hbplus.fit.attacker.com', () => {
      const result = validateAuthorizedDomain('user@hbplus.fit.attacker.com', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
      expect(result.extractedDomain).toBe('hbplus.fit.attacker.com');
    });

    it('rejects prefix spoof attack: user@fake-hbplus.fit', () => {
      const result = validateAuthorizedDomain('user@fake-hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED_DOMAIN');
    });
  });

  describe('Unverified and Missing Email Handling', () => {
    it('rejects an otherwise valid @hbplus.fit email if emailVerified is false', () => {
      const result = validateAuthorizedDomain('user@hbplus.fit', false);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNVERIFIED_EMAIL');
      expect(result.errorMessage).toContain('unverified');
    });

    it('rejects an otherwise valid @hbplus.fit email if emailVerified is undefined', () => {
      const result = validateAuthorizedDomain('user@hbplus.fit', undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('UNVERIFIED_EMAIL');
    });

    it('rejects null email', () => {
      const result = validateAuthorizedDomain(null, true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MISSING_EMAIL');
    });

    it('rejects undefined email', () => {
      const result = validateAuthorizedDomain(undefined, true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MISSING_EMAIL');
    });

    it('rejects empty string email', () => {
      const result = validateAuthorizedDomain('', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MISSING_EMAIL');
    });

    it('rejects whitespace-only email', () => {
      const result = validateAuthorizedDomain('   ', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MISSING_EMAIL');
    });
  });

  describe('Malformed Email Handling', () => {
    it('rejects string with no @ symbol', () => {
      const result = validateAuthorizedDomain('userhbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MALFORMED_EMAIL');
    });

    it('rejects string with multiple @ symbols: user@@hbplus.fit', () => {
      const result = validateAuthorizedDomain('user@@hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MALFORMED_EMAIL');
    });

    it('rejects empty local part: @hbplus.fit', () => {
      const result = validateAuthorizedDomain('@hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MALFORMED_EMAIL');
    });

    it('rejects empty domain part: user@', () => {
      const result = validateAuthorizedDomain('user@', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MALFORMED_EMAIL');
    });

    it('rejects local part starting with dot: .user@hbplus.fit', () => {
      const result = validateAuthorizedDomain('.user@hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MALFORMED_EMAIL');
    });

    it('rejects consecutive dots in local part: user..name@hbplus.fit', () => {
      const result = validateAuthorizedDomain('user..name@hbplus.fit', true);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('MALFORMED_EMAIL');
    });
  });

  describe('extractEmailDomain helper', () => {
    it('extracts lowercase domain accurately', () => {
      expect(extractEmailDomain('user@hbplus.fit')).toBe('hbplus.fit');
      expect(extractEmailDomain('USER@HBPLUS.FIT')).toBe('hbplus.fit');
      expect(extractEmailDomain('invalid-email')).toBeNull();
      expect(extractEmailDomain(null)).toBeNull();
    });
  });
});
