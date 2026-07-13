// Dettaglio di un allenamento registrato: esercizi svolti, serie, carichi.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/AppContext';
import { Badge, Button, Card, EmptyState, Row, Screen, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { formatLong } from '../../utils/dates';
import { logSetsCount, logVolume } from '../../utils/stats';
import { confirmAsync } from '../../utils/confirm';

export default function LogDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { state, actions } = useApp();
  const log = state.logs.find((l) => l.id === id);

  if (!log) {
    return (
      <Screen>
        <EmptyState icon="book-outline" title="Allenamento non trovato" />
      </Screen>
    );
  }

  const plan = state.plans.find((p) => p.id === log.planId);
  const volume = Math.round(logVolume(log));

  const remove = async () => {
    const ok = await confirmAsync('Eliminare questo allenamento?', 'L\'operazione non può essere annullata.');
    if (ok) {
      actions.deleteLog(id);
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>{log.title}</Text>
      <Text style={styles.date}>{formatLong(log.date)}</Text>
      <Row style={{ marginTop: 8, flexWrap: 'wrap' }}>
        <Badge label={`${log.durationMin} min`} color={colors.info} icon="time-outline" />
        <Badge label={`${logSetsCount(log)} serie`} />
        {volume > 0 ? <Badge label={`${volume} kg volume`} color={colors.warning} /> : null}
        <Badge label={`Fatica ${log.fatigue}/10`} color={colors.danger} icon="flame-outline" />
      </Row>
      {plan ? <Text style={styles.planRef}>Scheda di riferimento: {plan.name}</Text> : null}

      <SectionTitle title="Esercizi svolti" style={{ marginTop: spacing.l }} />
      {log.entries.map((entry, i) => (
        <Card key={i}>
          <Text style={styles.exerciseName}>{entry.exerciseName}</Text>
          <View style={styles.setsHeader}>
            <Text style={styles.setCol}>Serie</Text>
            <Text style={styles.setCol}>Ripetizioni</Text>
            <Text style={styles.setCol}>Carico</Text>
          </View>
          {entry.sets.map((s, j) => (
            <View key={j} style={styles.setRow}>
              <Text style={styles.setCell}>{j + 1}</Text>
              <Text style={styles.setCell}>{s.reps}</Text>
              <Text style={styles.setCell}>{s.weight > 0 ? `${s.weight} kg` : '—'}</Text>
            </View>
          ))}
        </Card>
      ))}

      {log.notes ? (
        <>
          <SectionTitle title="Note" />
          <Card>
            <Text style={styles.notes}>{log.notes}</Text>
          </Card>
        </>
      ) : null}

      <Row style={{ gap: spacing.m, marginTop: spacing.s }}>
        <Button
          label="Modifica"
          icon="create-outline"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('LogForm', { id })}
        />
        <Button label="Elimina" icon="trash-outline" variant="danger" style={{ flex: 1 }} onPress={remove} />
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  date: { color: colors.muted, fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  planRef: { color: colors.muted, fontSize: 12, marginTop: 8 },
  exerciseName: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  setsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  setCol: { flex: 1, color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '66',
  },
  setCell: { flex: 1, color: colors.text, fontSize: 13 },
  notes: { color: colors.text, fontSize: 14, lineHeight: 21 },
});
