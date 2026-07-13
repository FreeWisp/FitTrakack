// Elenco obiettivi con filtro per stato e avanzamento calcolato:
// per le categorie "frequenza" e "durata" l'avanzamento deriva dal diario.
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/AppContext';
import { Badge, Card, Chip, EmptyState, FAB, ProgressBar, Row, Screen } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { GOAL_STATUS, goalCategoryMeta, goalStatusMeta } from '../../constants';
import { goalProgress } from '../../utils/stats';
import { formatShort } from '../../utils/dates';

export default function GoalsScreen({ navigation }) {
  const { state } = useApp();
  const [statusFilter, setStatusFilter] = useState(null);

  const goals = useMemo(() => {
    return state.goals
      .map((g) => ({ goal: g, progress: goalProgress(g, state.logs) }))
      .filter((x) => !statusFilter || x.progress.status === statusFilter)
      .sort((a, b) => b.progress.pct - a.progress.pct);
  }, [state.goals, state.logs, statusFilter]);

  return (
    <Screen scroll={false}>
      <View style={styles.filters}>
        <Row style={{ flexWrap: 'wrap' }}>
          <Chip label="Tutti" active={!statusFilter} onPress={() => setStatusFilter(null)} />
          {GOAL_STATUS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              color={s.color}
              active={statusFilter === s.key}
              onPress={() => setStatusFilter(statusFilter === s.key ? null : s.key)}
            />
          ))}
        </Row>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.goal.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="flag-outline"
            title="Nessun obiettivo"
            message="Crea un obiettivo per monitorare i tuoi progressi nel tempo."
          />
        }
        renderItem={({ item }) => {
          const { goal, progress } = item;
          const category = goalCategoryMeta(goal.category);
          const status = goalStatusMeta(progress.status);
          return (
            <Card onPress={() => navigation.navigate('GoalForm', { id: goal.id })}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={styles.title} numberOfLines={1}>
                  {goal.title}
                </Text>
                <Badge label={status.label} color={status.color} />
              </Row>
              <Row style={{ marginTop: 6, flexWrap: 'wrap' }}>
                <Badge label={category.label} color={colors.muted} />
                {category.auto ? (
                  <Badge label="Avanzamento automatico" color={colors.info} icon="sync-outline" />
                ) : null}
              </Row>
              <Row style={{ justifyContent: 'space-between', marginTop: spacing.m, marginBottom: 6 }}>
                <Text style={styles.progressLabel}>
                  {progress.current} / {goal.target} {goal.unit}
                </Text>
                <Text style={styles.progressPct}>{Math.round(progress.pct * 100)}%</Text>
              </Row>
              <ProgressBar value={progress.pct} color={status.color} />
              {goal.deadline ? (
                <Text style={styles.deadline}>Scadenza: {formatShort(goal.deadline)}</Text>
              ) : null}
            </Card>
          );
        }}
      />
      <FAB label="Obiettivo" onPress={() => navigation.navigate('GoalForm', {})} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: spacing.l, paddingTop: spacing.m },
  listContent: { padding: spacing.l, paddingTop: spacing.s, paddingBottom: 120 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  progressLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
  progressPct: { color: colors.muted, fontSize: 13 },
  deadline: { color: colors.muted, fontSize: 12, marginTop: 8, textTransform: 'capitalize' },
});
