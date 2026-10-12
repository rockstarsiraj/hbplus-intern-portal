import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { BrandLogo } from '../components/BrandLogo';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { THEME, APP_CONFIG } from '../constants/appConfig';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { signInWithGoogle, status, error, resetError, isConfigured, configError } = useAuth();

  const isDesktop = width >= 768;
  const isLoading = status === 'authenticating';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop && styles.scrollContainerDesktop,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, isDesktop && styles.cardDesktop]}>
          {/* 1. Application Brand Mark */}
          <View style={styles.brandRow}>
            <BrandLogo size={54} />
          </View>

          {/* 2. Application Name */}
          <Text style={styles.appName}>{APP_CONFIG.APP_NAME}</Text>

          {/* 3. Heading */}
          <Text style={styles.heading}>Welcome back</Text>

          {/* 4. Supporting Text */}
          <Text style={styles.supportingText}>
            Sign in with your official HB+ account to continue.
          </Text>

          {/* Configuration Banner if credentials are missing */}
          {!isConfigured && (
            <View style={styles.configNotice}>
              <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" />
              <Text style={styles.configNoticeText}>
                Setup Required: Copy .env.example to .env and insert your Firebase Web Configuration keys.
              </Text>
            </View>
          )}

          {/* Error Message Display */}
          {error && (
            <ErrorMessage
              title="Sign-In Notice"
              message={error}
              onRetry={resetError}
              retryText="Dismiss"
            />
          )}

          {/* 5. Google Sign-In Button */}
          <View style={styles.buttonWrapper}>
            <GoogleSignInButton
              onPress={signInWithGoogle}
              loading={isLoading}
              disabled={isLoading}
              buttonText="Sign in with Google"
            />
          </View>

          {/* 6. Access Restriction Message */}
          <View style={styles.restrictionBox}>
            <Ionicons name="shield-checkmark" size={15} color={THEME.colors.primary} />
            <Text style={styles.restrictionText}>
              {APP_CONFIG.RESTRICTION_NOTICE}
            </Text>
          </View>

          {/* 7. Security Footer */}
          <View style={styles.footerContainer}>
            <Ionicons name="lock-closed" size={12} color={THEME.colors.textMuted} />
            <Text style={styles.footerText}>{APP_CONFIG.FOOTER_SECURITY_TEXT}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  scrollContainerDesktop: {
    padding: THEME.spacing.xxl,
  },
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.xl,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardDesktop: {
    padding: 36,
  },
  brandRow: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  supportingText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  configNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  configNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: 8,
  },
  restrictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  restrictionText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
});
