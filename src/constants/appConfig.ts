/**
 * Application Configuration & Design Constants
 * HB+ Intern Portal
 */

export const APP_CONFIG = {
  APP_NAME: 'HB+ Intern Portal',
  ALLOWED_DOMAIN: 'hbplus.fit',
  ALLOWED_DOMAIN_DISPLAY: '@hbplus.fit',
  TAGLINE: 'Secure Intern Access & Identity Verification',
  RESTRICTION_NOTICE: 'Access is limited to authorized @hbplus.fit accounts.',
  FOOTER_SECURITY_TEXT: 'Secured with Google OAuth 2.0 & Firebase',
  DOCS_URL: 'https://hbplus.fit',
};

export const THEME = {
  colors: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    primary: '#1D4ED8', // Refined Indigo / Blue
    primaryHover: '#1E40AF',
    primaryLight: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    textPrimary: '#0F172A', // Dark charcoal slate
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderFocus: '#93C5FD',
    
    // Status colors
    success: '#059669',
    successBackground: '#ECFDF5',
    successBorder: '#A7F3D0',
    
    error: '#DC2626',
    errorBackground: '#FEF2F2',
    errorBorder: '#FECACA',
    
    warning: '#D97706',
    warningBackground: '#FFFBEB',
    warningBorder: '#FDE68A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
};
