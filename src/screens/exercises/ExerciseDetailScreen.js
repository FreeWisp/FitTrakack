// Dettaglio di un esercizio, con modifica ed eliminazione.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/AppContext';
import { Badge, Button, Card, EmptyState, Row, Screen, SectionTitle } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { difficultyMeta } from '../../constants';
import { confirmAsync } from '../../utils/confirm';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { state, actions } = useApp();
  const exercise = state.exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <Screen>
        <EmptyState icon="barbell-outline" title="Esercizio non trovato" />
      </Screen>
    );
  }

  const diff = difficultyMeta(exercise.difficulty);
  const usedIn = state.plans.filter((p) => p.items.some((i) => i.exerciseId === id));

  const remove = async () => {
    const ok = await confirmAsync(
      'Eliminare questo esercizio?',
      usedIn.length > 0
        ? `L'esercizio verrà rimosso anche dalle ${usedIn.length} schede che lo usano.`
        : 'L\'operazione non può essere annullata.'
    );
    if (ok) {
      actions.deleteExercise(id);
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Text style={styles.name}>{exercise.name}</Text>
      <Row style={{ marginTop: 8, marginBottom: spacing.m, flexWrap: 'wrap' }}>
        <Badge label={exercise.primaryMuscle} />
        <Badge label={diff.label} color={diff.color} />
        <Badge label={exercise.equipment} color={colors.muted} />
      </Row>

      <SectionTitle title="Istruzioni" />
      <Card>
        <Text style={styles.body}>{exercise.description || 'Nessuna descrizione.'}</Text>
      </Card>

      <SectionTitle title="Dettagli" />
      <Card>
        <DetailRow label="Gruppo muscolare principale" value={exercise.primaryMuscle} />
        <DetailRow
          label="Gruppi secondari"
          value={exercise.secondaryMuscles.length ? exercise.secondaryMuscles.join(', ') : '—'}
        />
        <DetailRow label="Difficoltà" value={diff.label} />
        <DetailRow label="Attrezzatura" value={exercise.equipment} />
        <DetailRow
          label="Durata stimata"
          value={exercise.durationMin ? `${exercise.durationMin} min` : '—'}
        />
        <DetailRow label="Ripetizioni consigliate" value={exercise.repsHint || '—'} last />
      </Card>

      {exercise.notes ? (
        <>
          <SectionTitle title="Note" />
          <Card>
            <Text style={styles.body}>{exercise.notes}</Text>
          </Card>
        </>
      ) : null}

      <Card style={{ backgroundColor: colors.surface }}>
        <Text style={styles.usage}>
          {usedIn.length > 0
            ? `Usato in ${usedIn.length} sched${usedIn.length === 1 ? 'a' : 'e'}: ${usedIn
                .map((p) => p.name)
                .join(', ')}`
            : 'Non è ancora usato in nessuna scheda.'}
        </Text>
      </Card>

      <Row style={{ gap: spacing.m, marginTop: spacing.s }}>
        <Button
          label="Modifica"
          icon="create-outline"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('ExerciseForm', { id })}
        />
        <Button label="Elimina" icon="trash-outline" variant="danger" style={{ flex: 1 }} onPress={remove} />
      </Row>
    </Screen>
  );
}

function DetailRow({ label, value, last }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  body: { color: colors.text, fontSize: 14, lineHeight: 21 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 12,
  },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.muted, fontSize: 13 },
  detailValue: { color: colors.text, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  usage: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
