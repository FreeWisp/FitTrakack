// Dettaglio scheda: esercizi con serie/ripetizioni/recupero, avvio allenamento
// guidato, pianificazione in agenda, duplicazione, modifica ed eliminazione.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/AppContext';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Row,
  Screen,
  SectionTitle,
} from '../../components/ui';
import { colors, spacing } from '../../theme';
import { difficultyMeta } from '../../constants';
import { confirmAsync } from '../../utils/confirm';

export default function PlanDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { state, actions } = useApp();
  const plan = state.plans.find((p) => p.id === id);

  if (!plan) {
    return (
      <Screen>
        <EmptyState icon="albums-outline" title="Scheda non trovata" />
      </Screen>
    );
  }

  const level = difficultyMeta(plan.level);
  const exerciseOf = (item) => state.exercises.find((e) => e.id === item.exerciseId);

  const remove = async () => {
    const ok = await confirmAsync(
      'Eliminare questa scheda?',
      'Le sessioni pianificate e il diario che la citano resteranno, senza più il collegamento.'
    );
    if (ok) {
      actions.deletePlan(id);
      navigation.goBack();
    }
  };

  const duplicate = () => {
    actions.duplicatePlan(id);
    navigation.goBack();
  };

  return (
    <Screen>
      <Text style={styles.name}>{plan.name}</Text>
      <Row style={{ marginTop: 8, flexWrap: 'wrap' }}>
        <Badge label={plan.goal} />
        <Badge label={level.label} color={level.color} />
      </Row>
      <Text style={styles.meta}>
        {plan.durationMin} min previsti · {plan.frequency}
      </Text>
      {plan.description ? <Text style={styles.description}>{plan.description}</Text> : null}

      <Button
        label="Avvia allenamento guidato"
        icon="play"
        style={{ marginTop: spacing.m }}
        onPress={() => navigation.navigate('WorkoutPlayer', { planId: id })}
      />

      <SectionTitle title={`Esercizi (${plan.items.length})`} style={{ marginTop: spacing.l }} />
      {plan.items.length === 0 ? (
        <Card>
          <EmptyState
            icon="barbell-outline"
            title="Nessun esercizio nella scheda"
            message="Modifica la scheda per aggiungere esercizi."
          />
        </Card>
      ) : (
        plan.items.map((item, index) => {
          const ex = exerciseOf(item);
          return (
            <Card key={`${item.exerciseId}-${index}`} style={styles.itemCard}>
              <View style={styles.itemIndex}>
                <Text style={styles.itemIndexText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{ex ? ex.name : 'Esercizio rimosso'}</Text>
                <Text style={styles.itemMeta}>
                  {item.sets}×{item.reps}
                  {item.weight > 0 ? ` · ${item.weight} kg` : ''} · recupero {item.restSec}s
                </Text>
              </View>
            </Card>
          );
        })
      )}

      {plan.notes ? (
        <>
          <SectionTitle title="Note" />
          <Card>
            <Text style={styles.description}>{plan.notes}</Text>
          </Card>
        </>
      ) : null}

      <Row style={{ gap: spacing.m, marginTop: spacing.m }}>
        <Button
          label="Pianifica"
          icon="calendar-outline"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() =>
            navigation.navigate('AgendaTab', {
              screen: 'SessionForm',
              params: { planId: id },
              initial: false,
            })
          }
        />
        <Button label="Duplica" icon="copy-outline" variant="secondary" style={{ flex: 1 }} onPress={duplicate} />
      </Row>
      <Row style={{ gap: spacing.m, marginTop: spacing.m }}>
        <Button
          label="Modifica"
          icon="create-outline"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('PlanForm', { id })}
        />
        <Button label="Elimina" icon="trash-outline" variant="danger" style={{ flex: 1 }} onPress={remove} />
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 13, marginTop: 8 },
  description: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 8 },
  itemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.m },
  itemIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  itemIndexText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  itemName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  itemMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
});
