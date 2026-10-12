import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/appConfig';
import { AuthUser } from '../types/auth';

interface ProfileCardProps {
  user: AuthUser;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="person-circle-outline" size={22} color={THEME.colors.primary} />
          <Text style={styles.cardTitle}>Identity Profile</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Authorized</Text>
        </View>
      </View>

      <View style={styles.userProfileSection}>
        {user.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={styles.avatarLarge}
            accessibilityLabel={`${user.displayName || 'User'} profile avatar`}
          />
        ) : (
          <View style={styles.avatarLargeFallback}>
            <Text style={styles.avatarLargeText}>
              {(user.displayName || user.email).charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.userMeta}>
          <Text style={styles.fullName}>{user.displayName || 'HB+ Team Member'}</Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={16} color={THEME.colors.success} />
            <Text style={styles.verifiedEmail}>{user.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Authentication Provider</Text>
          <View style={styles.detailValueRow}>
            <Ionicons name="logo-google" size={14} color="#EA4335" style={{ marginRight: 6 }} />
            <Text style={styles.detailValue}>Google OAuth 2.0</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email Verification</Text>
          <View style={styles.detailValueRow}>
            <Ionicons name="shield-checkmark" size={14} color={THEME.colors.success} style={{ marginRight: 6 }} />
            <Text style={styles.detailValueVerified}>Verified by Google Identity</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Unique User ID (UID)</Text>
          <Text style={styles.detailValueMonospace} numberOfLines={1}>
            {user.uid}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: THEME.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.successBorder,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.success,
    marginRight: 6,
  },
  statusText: {
    color: THEME.colors.success,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.sm,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  avatarLargeFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  userMeta: {
    marginLeft: 16,
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedEmail: {
    marginLeft: 6,
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.md,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  detailValueVerified: {
    fontSize: 13,
    color: THEME.colors.success,
    fontWeight: '600',
  },
  detailValueMonospace: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    maxWidth: '55%',
  },
});
