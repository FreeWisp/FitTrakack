// Elenco schede di allenamento con ricerca, filtro per obiettivo e duplicazione rapida.
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
import { Badge, Card, Chip, EmptyState, FAB, IconButton, Row, Screen } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import { PLAN_GOALS, difficultyMeta } from '../../constants';

export default function PlansScreen({ navigation }) {
  const { state, actions } = useApp();
  const [query, setQuery] = useState('');
  const [goal, setGoal] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.plans
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .filter((p) => !goal || p.goal === goal)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.plans, query, goal]);

  return (
    <Screen scroll={false}>
      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Cerca scheda…"
            placeholderTextColor={colors.muted + '99'}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <Chip label="Tutti gli obiettivi" active={!goal} onPress={() => setGoal(null)} />
          {PLAN_GOALS.map((g) => (
            <Chip key={g} label={g} active={goal === g} onPress={() => setGoal(goal === g ? null : g)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="albums-outline"
            title="Nessuna scheda trovata"
            message="Crea la tua prima scheda di allenamento con il pulsante qui sotto."
          />
        }
        renderItem={({ item }) => {
          const level = difficultyMeta(item.level);
          return (
            <Card onPress={() => navigation.navigate('PlanDetail', { id: item.id })}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Row style={{ marginTop: 7, flexWrap: 'wrap' }}>
                    <Badge label={item.goal} />
                    <Badge label={level.label} color={level.color} />
                  </Row>
                  <Text style={styles.meta}>
                    {item.items.length} esercizi · {item.durationMin} min · {item.frequency}
                  </Text>
                </View>
                <IconButton
                  icon="copy-outline"
                  color={colors.accent}
                  onPress={() => actions.duplicatePlan(item.id)}
                />
              </Row>
            </Card>
          );
        }}
      />
      <FAB label="Nuova" onPress={() => navigation.navigate('PlanForm', {})} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: spacing.l, paddingTop: spacing.m, paddingBottom: spacing.xs },
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
  listContent: { padding: spacing.l, paddingTop: spacing.s, paddingBottom: 120 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 7 },
});
