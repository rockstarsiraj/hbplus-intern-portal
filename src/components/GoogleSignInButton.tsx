import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { GoogleIcon } from './GoogleIcon';
import { THEME } from '../constants/appConfig';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  buttonText?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  buttonText = 'Sign in with Google',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={loading ? 'Signing you in securely' : buttonText}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
      style={({ pressed }) => [
        styles.button,
        isHovered && styles.buttonHovered,
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="small" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Signing you in securely...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.iconWrapper}>
            <GoogleIcon size={20} />
          </View>
          <Text style={styles.text}>{buttonText}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonHovered: {
    backgroundColor: '#F8FAFC',
    borderColor: '#C5C9D0',
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  buttonPressed: {
    backgroundColor: '#F1F5F9',
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  text: {
    color: '#3C4043',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loadingText: {
    marginLeft: 10,
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
