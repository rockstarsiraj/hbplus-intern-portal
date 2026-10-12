import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/appConfig';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Authentication Notice',
  message,
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.headerRow}>
        <Ionicons name="alert-circle" size={20} color={THEME.colors.error} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={retryText}
        >
          <Text style={styles.retryText}>{retryText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.errorBackground,
    borderWidth: 1,
    borderColor: THEME.colors.errorBorder,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.sm,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: THEME.colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.errorBorder,
    borderRadius: THEME.borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  retryButtonPressed: {
    backgroundColor: '#FEF2F2',
  },
  retryText: {
    color: THEME.colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
});
