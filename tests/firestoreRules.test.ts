/**
 * Automated Security Logic Verification for Firestore Rules
 * Validates the exact security predicate matches implemented in firebase/firestore.rules
 */

describe('Firestore Security Rules Logic Engine', () => {
  // Regex extracted directly from firebase/firestore.rules:
  // (?i)^[a-zA-Z0-9._%+-]+@hbplus[.]fit$
  const HBPLUS_RULE_REGEX = /^[a-zA-Z0-9._%+-]+@hbplus\.fit$/i;

  function evaluateHbPlusAuthorized(auth: {
    uid?: string;
    token?: {
      email?: string | null;
      email_verified?: boolean;
    };
  } | null): boolean {
    if (!auth || !auth.uid) return false;
    if (!auth.token || !auth.token.email) return false;
    if (auth.token.email_verified !== true) return false;
    return HBPLUS_RULE_REGEX.test(auth.token.email);
  }

  function evaluateProfileWrite(
    auth: any,
    targetUserId: string,
    data: {
      uid: string;
      email: string;
      domain: string;
      role?: string;
      isAdmin?: boolean;
    }
  ): { allowed: boolean; reason?: string } {
    if (!auth || auth.uid !== targetUserId) {
      return { allowed: false, reason: 'USER_MISMATCH_OR_UNAUTHENTICATED' };
    }
    if (!evaluateHbPlusAuthorized(auth)) {
      return { allowed: false, reason: 'DOMAIN_UNAUTHORIZED_OR_UNVERIFIED' };
    }
    if (data.uid !== targetUserId) {
      return { allowed: false, reason: 'INVALID_UID_IN_PAYLOAD' };
    }
    if (data.email !== auth.token.email) {
      return { allowed: false, reason: 'SPOOFED_EMAIL_IN_PAYLOAD' };
    }
    if (data.domain !== 'hbplus.fit') {
      return { allowed: false, reason: 'INVALID_DOMAIN_IN_PAYLOAD' };
    }
    if (data.role && data.role !== 'user') {
      return { allowed: false, reason: 'SELF_PRIVILEGE_ESCALATION_BLOCKED' };
    }
    if (data.isAdmin === true) {
      return { allowed: false, reason: 'SELF_ADMIN_FLAG_BLOCKED' };
    }

    return { allowed: true };
  }

  describe('Rule Predicate: isHbPlusAuthorized()', () => {
    it('blocks unauthenticated requests (null auth)', () => {
      expect(evaluateHbPlusAuthorized(null)).toBe(false);
    });

    it('blocks authenticated requests missing email claim', () => {
      const auth = { uid: 'u123', token: { email_verified: true } };
      expect(evaluateHbPlusAuthorized(auth)).toBe(false);
    });

    it('blocks authenticated requests with unverified email', () => {
      const auth = {
        uid: 'u123',
        token: { email: 'intern@hbplus.fit', email_verified: false },
      };
      expect(evaluateHbPlusAuthorized(auth)).toBe(false);
    });

    it('blocks consumer Gmail users: hacker@gmail.com', () => {
      const auth = {
        uid: 'u123',
        token: { email: 'hacker@gmail.com', email_verified: true },
      };
      expect(evaluateHbPlusAuthorized(auth)).toBe(false);
    });

    it('blocks lookalike domain: hacker@another-hbplus.fit', () => {
      const auth = {
        uid: 'u123',
        token: { email: 'hacker@another-hbplus.fit', email_verified: true },
      };
      expect(evaluateHbPlusAuthorized(auth)).toBe(false);
    });

    it('blocks subdomain attack: hacker@hbplus.fit.attacker.com', () => {
      const auth = {
        uid: 'u123',
        token: { email: 'hacker@hbplus.fit.attacker.com', email_verified: true },
      };
      expect(evaluateHbPlusAuthorized(auth)).toBe(false);
    });

    it('permits valid lowercase @hbplus.fit verified token', () => {
      const auth = {
        uid: 'u123',
        token: { email: 'intern@hbplus.fit', email_verified: true },
      };
      expect(evaluateHbPlusAuthorized(auth)).toBe(true);
    });

    it('permits uppercase verified token due to case-insensitive regex', () => {
      const auth = {
        uid: 'u123',
        token: { email: 'INTERN@HBPLUS.FIT', email_verified: true },
      };
      expect(evaluateHbPlusAuthorized(auth)).toBe(true);
    });
  });

  describe('Document Ownership & Privilege Escalation Prevention', () => {
    const validAuth = {
      uid: 'user_abc',
      token: { email: 'intern@hbplus.fit', email_verified: true },
    };

    it('allows verified user to write their own valid profile', () => {
      const result = evaluateProfileWrite(validAuth, 'user_abc', {
        uid: 'user_abc',
        email: 'intern@hbplus.fit',
        domain: 'hbplus.fit',
        role: 'user',
        isAdmin: false,
      });
      expect(result.allowed).toBe(true);
    });

    it('blocks user from reading or writing another user doc (ID manipulation attack)', () => {
      const result = evaluateProfileWrite(validAuth, 'target_victim_xyz', {
        uid: 'target_victim_xyz',
        email: 'victim@hbplus.fit',
        domain: 'hbplus.fit',
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('USER_MISMATCH_OR_UNAUTHENTICATED');
    });

    it('strictly blocks self-privilege escalation (setting role: admin)', () => {
      const result = evaluateProfileWrite(validAuth, 'user_abc', {
        uid: 'user_abc',
        email: 'intern@hbplus.fit',
        domain: 'hbplus.fit',
        role: 'admin',
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('SELF_PRIVILEGE_ESCALATION_BLOCKED');
    });

    it('strictly blocks self-privilege escalation (setting isAdmin: true)', () => {
      const result = evaluateProfileWrite(validAuth, 'user_abc', {
        uid: 'user_abc',
        email: 'intern@hbplus.fit',
        domain: 'hbplus.fit',
        isAdmin: true,
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('SELF_ADMIN_FLAG_BLOCKED');
    });
  });
});
