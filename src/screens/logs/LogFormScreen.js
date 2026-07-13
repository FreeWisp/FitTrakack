// Registrazione/modifica di un allenamento svolto. Le serie sono modificabili
// una per una (ripetizioni e carico); "Precompila da scheda" genera le voci
// a partire dagli esercizi di una scheda esistente.
import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/AppContext';
import { Button, Card, IconButton, Row, Screen, SectionTitle } from '../../components/ui';
import { ChipGroup, DateStrip, FormField, PickerField, Stepper } from '../../components/forms';
import { PickerModal } from '../../components/pickers';
import { colors, spacing } from '../../theme';
import { todayISO } from '../../utils/dates';

const FATIGUE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  key: i + 1,
  label: String(i + 1),
}));

export default function LogFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { state, actions } = useApp();
  const existing = state.logs.find((l) => l.id === id);

  const [form, setForm] = useState(
    existing || {
      date: todayISO(),
      title: '',
      planId: null,
      durationMin: 45,
      fatigue: 6,
      notes: '',
      entries: [],
    }
  );
  const [error, setError] = useState(null);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Modifica allenamento' : 'Registra allenamento' });
  }, [navigation, existing]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const selectedPlan = state.plans.find((p) => p.id === form.planId);

  // Precompila titolo e voci a partire da una scheda.
  const applyPlan = (plan) => {
    const entries = plan.items
      .map((item) => {
        const ex = state.exercises.find((e) => e.id === item.exerciseId);
        if (!ex) return null;
        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: Array.from({ length: item.sets }, () => ({
            reps: item.reps,
            weight: item.weight || 0,
          })),
        };
      })
      .filter(Boolean);
    setForm((f) => ({
      ...f,
      planId: plan.id,
      title: f.title || plan.name,
      durationMin: plan.durationMin,
      entries,
    }));
    setPlanPickerOpen(false);
  };

  const addExercise = (exercise) => {
    setForm((f) => ({
      ...f,
      entries: [
        ...f.entries,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: [{ reps: 10, weight: 0 }],
        },
      ],
    }));
    setExercisePickerOpen(false);
  };

  const updateSet = (entryIdx, setIdx, patch) =>
    setForm((f) => ({
      ...f,
      entries: f.entries.map((e, i) =>
        i === entryIdx
          ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) }
          : e
      ),
    }));

  const addSet = (entryIdx) =>
    setForm((f) => ({
      ...f,
      entries: f.entries.map((e, i) =>
        i === entryIdx
          ? {
              ...e,
              sets: [
                ...e.sets,
                e.sets.length ? { ...e.sets[e.sets.length - 1] } : { reps: 10, weight: 0 },
              ],
            }
          : e
      ),
    }));

  const removeSet = (entryIdx, setIdx) =>
    setForm((f) => ({
      ...f,
      entries: f.entries.map((e, i) =>
        i === entryIdx ? { ...e, sets: e.sets.filter((_, j) => j !== setIdx) } : e
      ),
    }));

  const removeEntry = (entryIdx) =>
    setForm((f) => ({ ...f, entries: f.entries.filter((_, i) => i !== entryIdx) }));

  const save = () => {
    if (form.entries.length === 0) {
      setError('Aggiungi almeno un esercizio.');
      return;
    }
    const title = form.title.trim() || (selectedPlan ? selectedPlan.name : 'Allenamento');
    const entries = form.entries.filter((e) => e.sets.length > 0);
    const data = { ...form, title, entries };
    if (existing) {
      actions.updateLog(id, data);
    } else {
      actions.addLog(data);
    }
    navigation.goBack();
  };

  return (
    <Screen>
      <DateStrip label="Data" value={form.date} onChange={set('date')} />
      <FormField
        label="Titolo"
        value={form.title}
        onChangeText={set('title')}
        placeholder={selectedPlan ? selectedPlan.name : 'Es. Allenamento gambe'}
      />
      <PickerField
        label="Precompila da scheda (facoltativo)"
        valueLabel={selectedPlan ? selectedPlan.name : null}
        placeholder="Scegli una scheda…"
        onPress={() => setPlanPickerOpen(true)}
        onClear={() => set('planId')(null)}
      />
      <Stepper
        label="Durata"
        value={form.durationMin}
        onChange={set('durationMin')}
        step={5}
        min={5}
        max={300}
        suffix="min"
      />
      <ChipGroup
        label="Fatica percepita (1 = leggera, 10 = massima)"
        options={FATIGUE_OPTIONS}
        value={form.fatigue}
        onChange={set('fatigue')}
      />

      <SectionTitle title={`Esercizi svolti (${form.entries.length})`} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {form.entries.map((entry, entryIdx) => (
        <Card key={`${entry.exerciseId}-${entryIdx}`}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.s }}>
            <Text style={styles.entryName} numberOfLines={1}>
              {entry.exerciseName}
            </Text>
            <IconButton icon="trash-outline" color={colors.danger} onPress={() => removeEntry(entryIdx)} />
          </Row>
          {entry.sets.map((s, setIdx) => (
            <View key={setIdx} style={styles.setRow}>
              <Text style={styles.setLabel}>Serie {setIdx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Stepper
                  label=""
                  value={s.reps}
                  onChange={(v) => updateSet(entryIdx, setIdx, { reps: v })}
                  min={1}
                  max={120}
                  suffix="rip."
                />
              </View>
              <View style={{ flex: 1 }}>
                <Stepper
                  label=""
                  value={s.weight}
                  onChange={(v) => updateSet(entryIdx, setIdx, { weight: v })}
                  step={2.5}
                  min={0}
                  max={400}
                  suffix="kg"
                />
              </View>
              <IconButton icon="close" onPress={() => removeSet(entryIdx, setIdx)} />
            </View>
          ))}
          <Button
            label="Aggiungi serie"
            icon="add"
            variant="secondary"
            onPress={() => addSet(entryIdx)}
            style={{ paddingVertical: 8 }}
          />
        </Card>
      ))}
      <Button
        label="Aggiungi esercizio"
        icon="add"
        variant="secondary"
        onPress={() => {
          setError(null);
          setExercisePickerOpen(true);
        }}
        style={{ marginBottom: spacing.l }}
      />

      <FormField
        label="Note"
        value={form.notes}
        onChangeText={set('notes')}
        placeholder="Come è andata?"
        multiline
      />
      <Button label={existing ? 'Salva modifiche' : 'Registra allenamento'} icon="checkmark" onPress={save} />

      <PickerModal
        visible={exercisePickerOpen}
        title="Aggiungi esercizio"
        items={state.exercises
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((e) => ({ id: e.id, title: e.name, subtitle: `${e.primaryMuscle} · ${e.equipment}` }))}
        onSelect={(item) => addExercise(state.exercises.find((e) => e.id === item.id))}
        onClose={() => setExercisePickerOpen(false)}
      />
      <PickerModal
        visible={planPickerOpen}
        title="Precompila da scheda"
        items={state.plans.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `${p.items.length} esercizi · ${p.durationMin} min`,
        }))}
        onSelect={(item) => applyPlan(state.plans.find((p) => p.id === item.id))}
        onClose={() => setPlanPickerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  entryName: { color: colors.text, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  setLabel: { color: colors.muted, fontSize: 12, width: 52 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.s },
});
