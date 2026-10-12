import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ProfileCard } from '../components/ProfileCard';
import { SecurityCard } from '../components/SecurityCard';
import { THEME } from '../constants/appConfig';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();
  const isDesktop = width >= 800;

  if (!user) {
    return null;
  }

  const firstName = user.displayName?.split(' ')[0] || 'Team Member';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Application Header */}
      <AppHeader user={user} onSignOut={signOut} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.mainWrapper, isDesktop && styles.mainWrapperDesktop]}>
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <View style={styles.badgeRow}>
              <View style={styles.statusBadge}>
                <Ionicons name="shield-checkmark" size={13} color={THEME.colors.success} />
                <Text style={styles.statusBadgeText}>Domain Verified Session</Text>
              </View>
            </View>

            <Text style={styles.welcomeTitle}>Welcome, {firstName}</Text>
            <Text style={styles.welcomeSubtitle}>
              You have successfully authenticated with your verified organization account.
            </Text>
          </View>

          {/* Responsive Layout Grid */}
          <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
            <View style={styles.gridColumn}>
              <ProfileCard user={user} />
            </View>
            <View style={styles.gridColumn}>
              <SecurityCard />
            </View>
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
    paddingBottom: THEME.spacing.xxl,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.xl,
  },
  mainWrapperDesktop: {
    paddingHorizontal: THEME.spacing.xl,
  },
  welcomeBanner: {
    marginBottom: THEME.spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.successBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.successBorder,
    gap: 6,
  },
  statusBadgeText: {
    color: THEME.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'column',
    gap: THEME.spacing.md,
  },
  gridDesktop: {
    flexDirection: 'row',
    gap: THEME.spacing.lg,
  },
  gridColumn: {
    flex: 1,
  },
});
