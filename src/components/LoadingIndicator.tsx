import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME } from '../constants/appConfig';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Verifying identity...',
  size = 'large',
}) => {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size={size} color={THEME.colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: THEME.spacing.md,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
