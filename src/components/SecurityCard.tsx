import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, APP_CONFIG } from '../constants/appConfig';

export const SecurityCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color={THEME.colors.primary} />
          <Text style={styles.cardTitle}>Backend & Domain Verification</Text>
        </View>
        <View style={styles.secureBadge}>
          <Text style={styles.secureBadgeText}>Active Enforcement</Text>
        </View>
      </View>

      <Text style={styles.description}>
        This session has passed rigorous domain verification. Application access is strictly
        restricted to accounts on the {APP_CONFIG.ALLOWED_DOMAIN_DISPLAY} organization domain.
      </Text>

      <View style={styles.securityItems}>
        <View style={styles.securityItem}>
          <View style={styles.iconCircleSuccess}>
            <Ionicons name="checkmark" size={16} color={THEME.colors.success} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Strict Domain Verification</Text>
            <Text style={styles.itemText}>
              Extracted email domain matches {APP_CONFIG.ALLOWED_DOMAIN_DISPLAY} exactly. Subdomain and
              lookalike spoofing attacks are rejected.
            </Text>
          </View>
        </View>

        <View style={styles.securityItem}>
          <View style={styles.iconCircleSuccess}>
            <Ionicons name="lock-closed" size={15} color={THEME.colors.success} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Firestore Security Rules</Text>
            <Text style={styles.itemText}>
              Cloud Firestore rules enforce request.auth.token.email matching @hbplus.fit at the database
              layer, preventing unauthorized read/write access.
            </Text>
          </View>
        </View>

        <View style={styles.securityItem}>
          <View style={styles.iconCircleSuccess}>
            <Ionicons name="finger-print" size={15} color={THEME.colors.success} />
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Document Ownership Isolation</Text>
            <Text style={styles.itemText}>
              User documents are mapped to Firebase UIDs (users/&#123;uid&#125;), preventing users from reading or
              tampering with records of other accounts.
            </Text>
          </View>
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
    marginBottom: THEME.spacing.sm,
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
  secureBadge: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  secureBadgeText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 19,
    marginBottom: THEME.spacing.md,
  },
  securityItems: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircleSuccess: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.successBackground,
    borderWidth: 1,
    borderColor: THEME.colors.successBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  itemText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
  },
});
