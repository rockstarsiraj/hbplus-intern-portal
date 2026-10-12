import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from './BrandLogo';
import { THEME, APP_CONFIG } from '../constants/appConfig';
import { AuthUser } from '../types/auth';

interface AppHeaderProps {
  user?: AuthUser | null;
  onSignOut?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, onSignOut }) => {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <BrandLogo size={36} />
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>{APP_CONFIG.APP_NAME}</Text>
          <Text style={styles.portalBadge}>SECURE</Text>
        </View>
      </View>

      {user && onSignOut && (
        <View style={styles.userActions}>
          <View style={styles.userProfileChip}>
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatar}
                accessibilityLabel="User avatar"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userInfoText}>
              <Text style={styles.displayName} numberOfLines={1}>
                {user.displayName || 'HB+ Member'}
              </Text>
              <Text style={styles.domainTag} numberOfLines={1}>
                @{APP_CONFIG.ALLOWED_DOMAIN}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onSignOut}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Sign out of application"
          >
            <Ionicons name="log-out-outline" size={18} color={THEME.colors.textSecondary} />
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    width: '100%',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  portalBadge: {
    marginLeft: 8,
    backgroundColor: THEME.colors.primaryLight,
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    letterSpacing: 0.5,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  userInfoText: {
    marginLeft: 8,
    maxWidth: 140,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  displayName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  domainTag: {
    fontSize: 11,
    color: THEME.colors.success,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: '#FFFFFF',
  },
  logoutButtonPressed: {
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
});
