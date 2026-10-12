import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/appConfig';

interface BrandLogoProps {
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 48 }) => {
  const containerSize = size;
  const fontSize = size * 0.42;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize * 0.28,
        },
      ]}
      accessibilityLabel="HB+ Organization Logo"
    >
      <Text style={[styles.text, { fontSize }]}>HB+</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
