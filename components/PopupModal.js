import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../config';

export default function PopupModal({ visible, title, message, onClose, type = 'success' }) {
  const accent = type === 'success' ? COLORS.blue : COLORS.danger;
  const icon = type === 'success' ? '✅' : '❌';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: accent }]} onPress={onClose}>
            <Text style={styles.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  box: { width: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center' },
  icon: { fontSize: 40, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, color: COLORS.gray, textAlign: 'center', marginBottom: 20 },
  btn: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
