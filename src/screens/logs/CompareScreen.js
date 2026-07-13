// Confronto fianco a fianco di due allenamenti registrati: metriche globali
// e volume per gli esercizi in comune.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../state/AppContext';
import { Card, EmptyState, Screen, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { formatShort } from '../../utils/dates';
import { logSetsCount, logVolume } from '../../utils/stats';

export default function CompareScreen({ route }) {
  const { a, b } = route.params || {};
  const { state } = useApp();
  const logA = state.logs.find((l) => l.id === a);
  const logB = state.logs.find((l) => l.id === b);

  if (!logA || !logB) {
    return (
      <Screen>
        <EmptyState icon="git-compare-outline" title="Allenamenti non trovati" />
      </Screen>
    );
  }

  // Ordina cronologicamente: il più vecchio a sinistra.
  const [first, second] = logA.date <= logB.date ? [logA, logB] : [logB, logA];

  const metrics = [
    { label: 'Durata (min)', va: first.durationMin, vb: second.durationMin },
    { label: 'Esercizi', va: first.entries.length, vb: second.entries.length },
    { label: 'Serie totali', va: logSetsCount(first), vb: logSetsCount(second) },
    { label: 'Volume (kg)', va: Math.round(logVolume(first)), vb: Math.round(logVolume(second)) },
    { label: 'Fatica (1-10)', va: first.fatigue, vb: second.fatigue },
  ];

  // Esercizi presenti in entrambi gli allenamenti, confrontati per volume.
  const common = first.entries
    .map((ea) => {
      const eb = second.entries.find((e) => e.exerciseId === ea.exerciseId);
      if (!eb) return null;
      const vol = (sets) => sets.reduce((t, s) => t + (s.reps || 0) * (s.weight || 0), 0);
      const bestWeight = (sets) => Math.max(0, ...sets.map((s) => s.weight || 0));
      return {
        name: ea.exerciseName,
        va: Math.round(vol(ea.sets)),
        vb: Math.round(vol(eb.sets)),
        wa: bestWeight(ea.sets),
        wb: bestWeight(eb.sets),
      };
    })
    .filter(Boolean);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerCol}>
          <Text style={styles.headerDate}>{formatShort(first.date)}</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {first.title}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.muted} />
        <View style={styles.headerCol}>
          <Text style={styles.headerDate}>{formatShort(second.date)}</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {second.title}
          </Text>
        </View>
      </View>

      <SectionTitle title="Metriche complessive" />
      <Card>
        {metrics.map((m, i) => (
          <MetricRow key={m.label} {...m} last={i === metrics.length - 1} />
        ))}
      </Card>

      <SectionTitle title="Esercizi in comune" />
      {common.length === 0 ? (
        <Card>
          <EmptyState
            icon="barbell-outline"
            title="Nessun esercizio in comune"
            message="I due allenamenti non condividono esercizi confrontabili."
          />
        </Card>
      ) : (
        common.map((c) => (
          <Card key={c.name}>
            <Text style={styles.exerciseName}>{c.name}</Text>
            <MetricRow label="Volume (kg)" va={c.va} vb={c.vb} />
            <MetricRow label="Carico max (kg)" va={c.wa} vb={c.wb} last />
          </Card>
        ))
      )}
    </Screen>
  );
}

function MetricRow({ label, va, vb, last }) {
  const delta = vb - va;
  const deltaColor = delta > 0 ? colors.success : delta < 0 ? colors.danger : colors.muted;
  const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
  return (
    <View style={[styles.metricRow, !last && styles.metricBorder]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{va}</Text>
      <Text style={[styles.metricDelta, { color: deltaColor }]}>{delta === 0 ? '=' : deltaLabel}</Text>
      <Text style={styles.metricValue}>{vb}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginBottom: spacing.s,
  },
  headerCol: { flex: 1 },
  headerDate: { color: colors.muted, fontSize: 12, textTransform: 'capitalize' },
  headerTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 2 },
  metricRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  metricBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  metricLabel: { flex: 1.4, color: colors.muted, fontSize: 13 },
  metricValue: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  metricDelta: { width: 52, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  exerciseName: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
});
