import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle,
} from 'react-native';
import { COLORS, Radius, FontSize } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
}

export default function Button({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const bg = {
    primary: COLORS.accent,
    secondary: COLORS.primaryLight,
    danger: COLORS.error,
    ghost: 'transparent',
  }[variant];

  const textColor = variant === 'ghost' ? COLORS.accent : '#fff';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.55 },
  label: { fontSize: FontSize.md, fontWeight: '800' },
});
