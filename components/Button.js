import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../config';

export default function Button({ title, onPress, loading, variant = 'primary', style }) {
  const bg = variant === 'primary' ? COLORS.blue : variant === 'yellow' ? COLORS.yellow : COLORS.lightGray;
  const color = variant === 'yellow' ? COLORS.black : variant === 'secondary' ? COLORS.black : COLORS.white;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, loading && styles.disabled, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={color} />
        : <Text style={[styles.text, { color }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginVertical: 6 },
  disabled: { opacity: 0.6 },
  text: { fontSize: 15, fontWeight: '700' },
});
