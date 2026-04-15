import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { COLORS, Spacing, FontSize, Radius } from '../../constants/theme';

const TYPE_COLORS = {
  success: COLORS.success,
  error: COLORS.error,
  warning: COLORS.warning,
  info: COLORS.info,
};

export default function Toast() {
  const toast = useUIStore((s) => s.toast);
  if (!toast) return null;

  return (
    <View style={[styles.container, { backgroundColor: TYPE_COLORS[toast.type] }]}>
      <Text style={styles.text}>{toast.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
});
