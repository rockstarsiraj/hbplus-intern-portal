import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, APP_CONFIG } from '../constants/appConfig';
import { useAuth } from '../hooks/useAuth';

export const AccessDeniedScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { deniedEmail, resetError, signInWithGoogle } = useAuth();
  const isDesktop = width >= 768;

  const handleTryAnotherAccount = async () => {
    // Reset state and launch Google sign-in with account chooser prompt
    resetError();
    await signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isDesktop && styles.scrollContainerDesktop,
        ]}
      >
        <View style={[styles.card, isDesktop && styles.cardDesktop]}>
          {/* Warning Icon Badge */}
          <View style={styles.iconCircle}>
            <Ionicons name="shield-outline" size={32} color={THEME.colors.error} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Access restricted</Text>

          {/* Main restriction explanation */}
          <Text style={styles.subtitle}>
            This application is available only to authorized users with an{' '}
            <Text style={styles.boldDomain}>{APP_CONFIG.ALLOWED_DOMAIN_DISPLAY}</Text> email address.
          </Text>

          {/* Rejected Account Details Box */}
          {deniedEmail && (
            <View style={styles.accountBox}>
              <Text style={styles.accountBoxLabel}>Attempted Account:</Text>
              <View style={styles.emailRow}>
                <Ionicons name="mail-outline" size={16} color={THEME.colors.error} />
                <Text style={styles.accountBoxEmail} numberOfLines={1}>
                  {deniedEmail}
                </Text>
              </View>
              <Text style={styles.rejectionNotice}>
                This Google account does not have domain authorization.
              </Text>
            </View>
          )}

          {/* Security Notice Box */}
          <View style={styles.securityBox}>
            <Ionicons name="lock-closed-outline" size={16} color={THEME.colors.textSecondary} />
            <Text style={styles.securityBoxText}>
              Your session was safely terminated and no protected organizational records were accessed.
            </Text>
          </View>

          {/* Action Button: Try another account */}
          <Pressable
            onPress={handleTryAnotherAccount}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Try another account"
          >
            <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Try another account</Text>
          </Pressable>

          {/* Return to Login link */}
          <Pressable
            onPress={resetError}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Return to sign in"
          >
            <Text style={styles.backButtonText}>Return to sign in</Text>
          </Pressable>
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
    maxWidth: 460,
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.errorBackground,
    borderWidth: 1,
    borderColor: THEME.colors.errorBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  boldDomain: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  accountBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: THEME.borderRadius.md,
    padding: 14,
    marginBottom: 16,
  },
  accountBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountBoxEmail: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  rejectionNotice: {
    fontSize: 12,
    color: '#7F1D1D',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    marginBottom: 24,
    gap: 8,
    width: '100%',
  },
  securityBoxText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonPressed: {
    backgroundColor: THEME.colors.primaryHover,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    padding: 8,
  },
  backButtonText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
