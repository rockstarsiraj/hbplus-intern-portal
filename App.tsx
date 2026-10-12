import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AccessDeniedScreen } from './src/screens/AccessDeniedScreen';
import { THEME, APP_CONFIG } from './src/constants/appConfig';
import { BrandLogo } from './src/components/BrandLogo';

/**
 * Root Application Navigator and Gating Engine
 * Ensures protected content is never exposed to unauthenticated or unauthorized users.
 */
function AppNavigator() {
  const { status, user } = useAuth();

  // Loading state prevents flashing protected content on startup or refresh
  if (status === 'initializing') {
    return (
      <View style={styles.splashContainer} accessibilityRole="progressbar">
        <BrandLogo size={64} />
        <Text style={styles.splashTitle}>{APP_CONFIG.APP_NAME}</Text>
        <ActivityIndicator
          size="small"
          color={THEME.colors.primary}
          style={styles.splashSpinner}
        />
        <Text style={styles.splashSubtitle}>Initializing secure session...</Text>
      </View>
    );
  }

  // Domain-verified, authenticated users view the dashboard
  if (status === 'authenticated' && user) {
    return <DashboardScreen />;
  }

  // Users authenticated with Google whose domain != @hbplus.fit
  if (status === 'access_denied') {
    return <AccessDeniedScreen />;
  }

  // Unauthenticated or error state returns to Login screen
  return <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  splashSpinner: {
    marginTop: 20,
  },
  splashSubtitle: {
    marginTop: 10,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
});
