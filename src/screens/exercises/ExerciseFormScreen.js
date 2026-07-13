// Form unico per creazione e modifica di un esercizio.
// Se route.params.id è presente siamo in modifica, altrimenti in creazione.
import React, { useLayoutEffect, useState } from 'react';
import { useApp } from '../../state/AppContext';
import { Button, Screen } from '../../components/ui';
import { ChipGroup, FormField, Segmented, Stepper } from '../../components/forms';
import { DIFFICULTIES, EQUIPMENT, MUSCLE_GROUPS } from '../../constants';

export default function ExerciseFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { state, actions } = useApp();
  const existing = state.exercises.find((e) => e.id === id);

  const [form, setForm] = useState(
    existing || {
      name: '',
      description: '',
      primaryMuscle: 'Petto',
      secondaryMuscles: [],
      difficulty: 'principiante',
      equipment: 'Corpo libero',
      durationMin: 10,
      repsHint: '',
      notes: '',
    }
  );
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Modifica esercizio' : 'Nuovo esercizio' });
  }, [navigation, existing]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (!form.name.trim()) {
      setError('Il nome è obbligatorio.');
      return;
    }
    const data = { ...form, name: form.name.trim() };
    if (existing) {
      actions.updateExercise(id, data);
    } else {
      actions.addExercise(data);
    }
    navigation.goBack();
  };

  return (
    <Screen>
      <FormField
        label="Nome *"
        value={form.name}
        onChangeText={(v) => {
          setError(null);
          set('name')(v);
        }}
        placeholder="Es. Panca piana"
        error={error}
      />
      <FormField
        label="Descrizione / istruzioni"
        value={form.description}
        onChangeText={set('description')}
        placeholder="Come si esegue l'esercizio…"
        multiline
      />
      <ChipGroup
        label="Gruppo muscolare principale"
        options={MUSCLE_GROUPS}
        value={form.primaryMuscle}
        onChange={set('primaryMuscle')}
      />
      <ChipGroup
        label="Gruppi muscolari secondari"
        options={MUSCLE_GROUPS.filter((m) => m !== form.primaryMuscle)}
        value={form.secondaryMuscles}
        onChange={set('secondaryMuscles')}
        multi
      />
      <Segmented
        label="Difficoltà"
        options={DIFFICULTIES}
        value={form.difficulty}
        onChange={set('difficulty')}
      />
      <ChipGroup
        label="Attrezzatura"
        options={EQUIPMENT}
        value={form.equipment}
        onChange={set('equipment')}
      />
      <Stepper
        label="Durata stimata"
        value={form.durationMin}
        onChange={set('durationMin')}
        step={5}
        min={0}
        max={180}
        suffix="min"
      />
      <FormField
        label="Ripetizioni consigliate"
        value={form.repsHint}
        onChangeText={set('repsHint')}
        placeholder="Es. 3×12"
      />
      <FormField
        label="Note aggiuntive"
        value={form.notes}
        onChangeText={set('notes')}
        placeholder="Eventuali accorgimenti…"
        multiline
      />
      <Button label={existing ? 'Salva modifiche' : 'Crea esercizio'} icon="checkmark" onPress={save} />
    </Screen>
  );
}
