// Elenco esercizi con ricerca per nome e filtri per gruppo muscolare e difficoltà.
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../state/AppContext';
import { Badge, Card, Chip, EmptyState, FAB, Row, Screen } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import { DIFFICULTIES, MUSCLE_GROUPS, difficultyMeta } from '../../constants';

export default function ExercisesScreen({ navigation }) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.exercises
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .filter((e) => !muscle || e.primaryMuscle === muscle)
      .filter((e) => !difficulty || e.difficulty === difficulty)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.exercises, query, muscle, difficulty]);

  return (
    <Screen scroll={false}>
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Cerca esercizio…"
            placeholderTextColor={colors.muted + '99'}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip label="Tutti" active={!muscle} onPress={() => setMuscle(null)} />
          {MUSCLE_GROUPS.map((m) => (
            <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(muscle === m ? null : m)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip label="Tutte le difficoltà" active={!difficulty} onPress={() => setDifficulty(null)} />
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d.key}
              label={d.label}
              color={d.color}
              active={difficulty === d.key}
              onPress={() => setDifficulty(difficulty === d.key ? null : d.key)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="barbell-outline"
            title="Nessun esercizio trovato"
            message="Modifica i filtri di ricerca oppure aggiungi un nuovo esercizio."
          />
        }
        renderItem={({ item }) => {
          const diff = difficultyMeta(item.difficulty);
          return (
            <Card onPress={() => navigation.navigate('ExerciseDetail', { id: item.id })}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Row style={{ marginTop: 7, flexWrap: 'wrap' }}>
                    <Badge label={item.primaryMuscle} />
                    <Badge label={diff.label} color={diff.color} />
                    <Badge label={item.equipment} color={colors.muted} />
                  </Row>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Row>
            </Card>
          );
        }}
      />
      <FAB label="Nuovo" onPress={() => navigation.navigate('ExerciseForm', {})} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: spacing.l, paddingTop: spacing.m },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 9, marginLeft: 8, fontSize: 14 },
  chipRow: { marginBottom: 2, flexGrow: 0 },
  listContent: { padding: spacing.l, paddingTop: spacing.s, paddingBottom: 120 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
