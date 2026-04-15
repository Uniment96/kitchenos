import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUIStore } from '../../store/uiStore';
import { COLORS, FontSize } from '../../constants/theme';

export default function OfflineBanner() {
  const isOnline = useUIStore((s) => s.isOnline);
  if (isOnline) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Offline — changes will sync when reconnected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 998,
  },
  text: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
});
