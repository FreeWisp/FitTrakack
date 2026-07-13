// Form di creazione/modifica scheda, con editor degli esercizi associati:
// per ogni esercizio si impostano serie, ripetizioni, recupero e carico,
// e se ne può cambiare l'ordine.
import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/AppContext';
import { Button, Card, IconButton, Row, Screen, SectionTitle } from '../../components/ui';
import { ChipGroup, FormField, Segmented, Stepper } from '../../components/forms';
import { PickerModal } from '../../components/pickers';
import { colors, spacing } from '../../theme';
import { DIFFICULTIES, PLAN_GOALS } from '../../constants';

export default function PlanFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { state, actions } = useApp();
  const existing = state.plans.find((p) => p.id === id);

  const [form, setForm] = useState(
    existing || {
      name: '',
      description: '',
      goal: 'Forza',
      level: 'principiante',
      durationMin: 45,
      frequency: '3 volte a settimana',
      notes: '',
      items: [],
    }
  );
  const [error, setError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Modifica scheda' : 'Nuova scheda' });
  }, [navigation, existing]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const updateItem = (index, patch) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));

  const removeItem = (index) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

  const moveItem = (index, dir) =>
    setForm((f) => {
      const items = [...f.items];
      const target = index + dir;
      if (target < 0 || target >= items.length) return f;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...f, items };
    });

  const addItem = (exercise) => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { exerciseId: exercise.id, sets: 3, reps: 10, restSec: 60, weight: 0 }],
    }));
    setPickerOpen(false);
  };

  const save = () => {
    if (!form.name.trim()) {
      setError('Il nome è obbligatorio.');
      return;
    }
    const data = { ...form, name: form.name.trim() };
    if (existing) {
      actions.updatePlan(id, data);
    } else {
      actions.addPlan(data);
    }
    navigation.goBack();
  };

  const exerciseName = (exerciseId) =>
    state.exercises.find((e) => e.id === exerciseId)?.name || 'Esercizio rimosso';

  return (
    <Screen>
      <FormField
        label="Nome *"
        value={form.name}
        onChangeText={(v) => {
          setError(null);
          set('name')(v);
        }}
        placeholder="Es. Full Body A"
        error={error}
      />
      <FormField
        label="Descrizione"
        value={form.description}
        onChangeText={set('description')}
        placeholder="A cosa serve questa scheda…"
        multiline
      />
      <ChipGroup label="Obiettivo" options={PLAN_GOALS} value={form.goal} onChange={set('goal')} />
      <Segmented label="Livello" options={DIFFICULTIES} value={form.level} onChange={set('level')} />
      <Stepper
        label="Durata prevista"
        value={form.durationMin}
        onChange={set('durationMin')}
        step={5}
        min={10}
        max={240}
        suffix="min"
      />
      <FormField
        label="Frequenza consigliata"
        value={form.frequency}
        onChangeText={set('frequency')}
        placeholder="Es. 3 volte a settimana"
      />

      <SectionTitle title={`Esercizi (${form.items.length})`} />
      {form.items.map((item, index) => (
        <Card key={`${item.exerciseId}-${index}`} style={{ paddingVertical: spacing.m }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.s }}>
            <Text style={styles.itemName} numberOfLines={1}>
              {index + 1}. {exerciseName(item.exerciseId)}
            </Text>
            <Row>
              <IconButton icon="chevron-up" onPress={() => moveItem(index, -1)} />
              <IconButton icon="chevron-down" onPress={() => moveItem(index, 1)} />
              <IconButton icon="trash-outline" color={colors.danger} onPress={() => removeItem(index)} />
            </Row>
          </Row>
          <Row style={{ gap: spacing.m }}>
            <MiniStepper
              label="Serie"
              value={item.sets}
              onChange={(v) => updateItem(index, { sets: v })}
              min={1}
              max={12}
            />
            <MiniStepper
              label="Rip."
              value={item.reps}
              onChange={(v) => updateItem(index, { reps: v })}
              min={1}
              max={120}
            />
          </Row>
          <Row style={{ gap: spacing.m, marginTop: spacing.s }}>
            <MiniStepper
              label="Rec. (s)"
              value={item.restSec}
              onChange={(v) => updateItem(index, { restSec: v })}
              step={15}
              min={0}
              max={600}
            />
            <MiniStepper
              label="Kg"
              value={item.weight}
              onChange={(v) => updateItem(index, { weight: v })}
              step={2.5}
              min={0}
              max={400}
            />
          </Row>
        </Card>
      ))}
      <Button
        label="Aggiungi esercizio"
        icon="add"
        variant="secondary"
        onPress={() => setPickerOpen(true)}
        style={{ marginBottom: spacing.l }}
      />

      <FormField
        label="Note"
        value={form.notes}
        onChangeText={set('notes')}
        placeholder="Eventuali indicazioni…"
        multiline
      />
      <Button label={existing ? 'Salva modifiche' : 'Crea scheda'} icon="checkmark" onPress={save} />

      <PickerModal
        visible={pickerOpen}
        title="Scegli un esercizio"
        items={state.exercises
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((e) => ({
            id: e.id,
            title: e.name,
            subtitle: `${e.primaryMuscle} · ${e.equipment}`,
          }))}
        onSelect={(item) => addItem(state.exercises.find((e) => e.id === item.id))}
        onClose={() => setPickerOpen(false)}
      />
    </Screen>
  );
}

// Variante compatta dello Stepper per l'editor degli esercizi.
function MiniStepper({ label, value, onChange, step = 1, min = 0, max = 999 }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Stepper value={value} onChange={onChange} step={step} min={min} max={max} />
    </View>
  );
}

const styles = StyleSheet.create({
  itemName: { color: colors.text, fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  mini: { flex: 1 },
  miniLabel: { color: colors.muted, fontSize: 11, marginBottom: 2 },
});
