import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getSubjects } from '../services/api';
import { COLORS } from '../config';

const CARD_COLORS = ['#1736F5', '#7B2FBE', '#2d9e5f', '#E07B00', '#E53935', '#0288D1', '#5D4037', '#455A64'];

export default function StudentSubjectsScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getSubjects()
      .then((r) => setSubjects(r.data.subjects))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Subjects</Text>
      <Text style={styles.subtitle}>Select a subject to view learning materials</Text>

      {loading && <ActivityIndicator color={COLORS.blue} style={{ marginTop: 40 }} />}

      <View style={styles.grid}>
        {subjects.map((s, i) => (
          <TouchableOpacity
            key={s._id}
            style={[styles.card, { backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }]}
            onPress={() => navigation.navigate('SubjectMaterials', { subject: s })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardIcon}>📖</Text>
            <Text style={styles.cardLabel}>{s.name.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!loading && subjects.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No subjects available yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F4F6FF', padding: 20, paddingTop: 56 },
  back:       { marginBottom: 16 },
  backText:   { color: COLORS.blue, fontWeight: '600', fontSize: 15 },
  title:      { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subtitle:   { fontSize: 13, color: COLORS.gray, marginBottom: 24 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:       { width: '47%', borderRadius: 16, padding: 20, alignItems: 'center', minHeight: 110, justifyContent: 'center' },
  cardIcon:   { fontSize: 30, marginBottom: 8 },
  cardLabel:  { color: COLORS.white, fontWeight: '800', fontSize: 12, textAlign: 'center', letterSpacing: 0.5 },
  empty:      { alignItems: 'center', marginTop: 60 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyText:  { fontSize: 16, color: COLORS.gray },
});
