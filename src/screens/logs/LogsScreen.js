// Diario degli allenamenti svolti: filtro per periodo, modalità confronto
// (selezione di due allenamenti da comparare) e accesso al dettaglio.
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../state/AppContext';
import { Badge, Card, Chip, EmptyState, FAB, Row, Screen } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import { addDays, formatShort, startOfMonth, startOfWeek, todayISO } from '../../utils/dates';
import { logSetsCount, logVolume } from '../../utils/stats';

const PERIODS = [
  { key: 'all', label: 'Tutti' },
  { key: 'week', label: 'Questa settimana' },
  { key: 'month', label: 'Questo mese' },
  { key: '30', label: 'Ultimi 30 giorni' },
];

export default function LogsScreen({ navigation }) {
  const { state } = useApp();
  const [period, setPeriod] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const today = todayISO();

  const filtered = useMemo(() => {
    let from = null;
    if (period === 'week') from = startOfWeek(today);
    if (period === 'month') from = startOfMonth(today);
    if (period === '30') from = addDays(today, -30);
    return state.logs
      .filter((l) => !from || l.date >= from)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.logs, period]);

  const toggleSelect = (id) => {
    setSelectedIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= 2) return [ids[1], id];
      return [...ids, id];
    });
  };

  const openCompare = () => {
    navigation.navigate('Compare', { a: selectedIds[0], b: selectedIds[1] });
    setCompareMode(false);
    setSelectedIds([]);
  };

  return (
    <Screen scroll={false}>
      <View style={styles.filters}>
        <Row style={{ flexWrap: 'wrap' }}>
          {PERIODS.map((p) => (
            <Chip key={p.key} label={p.label} active={period === p.key} onPress={() => setPeriod(p.key)} />
          ))}
        </Row>
        <Chip
          label={compareMode ? 'Annulla confronto' : 'Confronta due allenamenti'}
          icon="git-compare-outline"
          active={compareMode}
          color={colors.info}
          onPress={() => {
            setCompareMode(!compareMode);
            setSelectedIds([]);
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="Nessun allenamento registrato"
            message="Registra il tuo primo allenamento con il pulsante qui sotto."
          />
        }
        renderItem={({ item }) => {
          const plan = state.plans.find((p) => p.id === item.planId);
          const selected = selectedIds.includes(item.id);
          const volume = Math.round(logVolume(item));
          return (
            <Card
              onPress={() =>
                compareMode ? toggleSelect(item.id) : navigation.navigate('LogDetail', { id: item.id })
              }
              style={selected && { borderColor: colors.info }}
            >
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.logDate}>{formatShort(item.date)}</Text>
                  <Text style={styles.logTitle}>{item.title}</Text>
                  <Row style={{ marginTop: 6, flexWrap: 'wrap' }}>
                    <Badge label={`${item.durationMin} min`} color={colors.info} icon="time-outline" />
                    <Badge label={`${logSetsCount(item)} serie`} color={colors.accent} />
                    {volume > 0 ? <Badge label={`${volume} kg vol.`} color={colors.warning} /> : null}
                    <Badge label={`Fatica ${item.fatigue}/10`} color={colors.danger} icon="flame-outline" />
                  </Row>
                  {plan ? <Text style={styles.logMeta}>Scheda: {plan.name}</Text> : null}
                </View>
                {compareMode ? (
                  <Ionicons
                    name={selected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={selected ? colors.info : colors.muted}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                )}
              </Row>
            </Card>
          );
        }}
      />

      {compareMode && selectedIds.length === 2 ? (
        <Pressable style={styles.compareBar} onPress={openCompare}>
          <Ionicons name="git-compare-outline" size={18} color="#fff" />
          <Text style={styles.compareLabel}>Confronta i 2 allenamenti selezionati</Text>
        </Pressable>
      ) : null}

      {!compareMode ? <FAB label="Registra" onPress={() => navigation.navigate('LogForm', {})} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: spacing.l, paddingTop: spacing.m },
  listContent: { padding: spacing.l, paddingTop: spacing.s, paddingBottom: 120 },
  logDate: { color: colors.muted, fontSize: 12, textTransform: 'capitalize' },
  logTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
  logMeta: { color: colors.muted, fontSize: 12, marginTop: 6 },
  compareBar: {
    position: 'absolute',
    left: spacing.l,
    right: spacing.l,
    bottom: spacing.xl,
    backgroundColor: colors.info,
    borderRadius: radius.l,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  compareLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
