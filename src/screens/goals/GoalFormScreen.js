// Form di creazione/modifica di un obiettivo. Per le categorie automatiche
// (frequenza, durata) il valore attuale non è editabile: viene dal diario.
import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useApp } from '../../state/AppContext';
import { Button, Card, Row, Screen } from '../../components/ui';
import { ChipGroup, DateStrip, FormField, Stepper } from '../../components/forms';
import { colors, spacing } from '../../theme';
import { GOAL_CATEGORIES, goalCategoryMeta } from '../../constants';
import { todayISO } from '../../utils/dates';
import { goalCurrentValue } from '../../utils/stats';
import { confirmAsync } from '../../utils/confirm';

export default function GoalFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { state, actions } = useApp();
  const existing = state.goals.find((g) => g.id === id);

  const [form, setForm] = useState(
    existing || {
      title: '',
      description: '',
      category: 'frequenza',
      target: 10,
      current: 0,
      unit: 'allenamenti',
      startDate: todayISO(),
      deadline: null,
      notes: '',
    }
  );
  const [error, setError] = useState(null);
  const [hasDeadline, setHasDeadline] = useState(Boolean(form.deadline));

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Modifica obiettivo' : 'Nuovo obiettivo' });
  }, [navigation, existing]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const category = goalCategoryMeta(form.category);

  const selectCategory = (key) => {
    const meta = goalCategoryMeta(key);
    setForm((f) => ({ ...f, category: key, unit: meta.unit || f.unit }));
  };

  const save = () => {
    if (!form.title.trim()) {
      setError('Il titolo è obbligatorio.');
      return;
    }
    const data = {
      ...form,
      title: form.title.trim(),
      deadline: hasDeadline ? form.deadline || todayISO() : null,
    };
    if (existing) {
      actions.updateGoal(id, data);
    } else {
      actions.addGoal(data);
    }
    navigation.goBack();
  };

  const remove = async () => {
    const ok = await confirmAsync('Eliminare questo obiettivo?', existing.title);
    if (ok) {
      actions.deleteGoal(id);
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <FormField
        label="Titolo *"
        value={form.title}
        onChangeText={(v) => {
          setError(null);
          set('title')(v);
        }}
        placeholder="Es. 12 allenamenti questo mese"
        error={error}
      />
      <FormField
        label="Descrizione"
        value={form.description}
        onChangeText={set('description')}
        placeholder="Perché questo obiettivo…"
        multiline
      />
      <ChipGroup
        label="Categoria"
        options={GOAL_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
        value={form.category}
        onChange={selectCategory}
      />
      <Stepper
        label={`Valore target (${form.unit || 'unità'})`}
        value={form.target}
        onChange={set('target')}
        min={1}
        max={100000}
        step={form.category === 'durata' ? 10 : 1}
      />
      {category.auto ? (
        <Card style={{ backgroundColor: colors.surface }}>
          <Text style={styles.autoInfo}>
            Avanzamento automatico: il valore attuale (
            {existing ? goalCurrentValue(form, state.logs) : 0} {form.unit}) viene calcolato dagli
            allenamenti registrati nel diario a partire dalla data di inizio.
          </Text>
        </Card>
      ) : (
        <Stepper
          label={`Valore attuale (${form.unit || 'unità'})`}
          value={form.current}
          onChange={set('current')}
          min={0}
          max={100000}
          step={form.category === 'durata' ? 10 : 1}
        />
      )}
      {!category.auto ? (
        <FormField
          label="Unità di misura"
          value={form.unit}
          onChangeText={set('unit')}
          placeholder="Es. kg, rip., sessioni…"
        />
      ) : null}
      <DateStrip label="Data di inizio" value={form.startDate} onChange={set('startDate')} />
      <ChipGroup
        label="Data limite"
        options={[
          { key: 'no', label: 'Nessuna scadenza' },
          { key: 'yes', label: 'Imposta scadenza' },
        ]}
        value={hasDeadline ? 'yes' : 'no'}
        onChange={(v) => setHasDeadline(v === 'yes')}
      />
      {hasDeadline ? (
        <DateStrip label="Scadenza" value={form.deadline || todayISO()} onChange={set('deadline')} />
      ) : null}
      <FormField
        label="Note"
        value={form.notes}
        onChangeText={set('notes')}
        placeholder="Eventuali annotazioni…"
        multiline
      />

      <Button label={existing ? 'Salva modifiche' : 'Crea obiettivo'} icon="checkmark" onPress={save} />
      {existing ? (
        <Row style={{ marginTop: spacing.m }}>
          <Button label="Elimina obiettivo" icon="trash-outline" variant="danger" style={{ flex: 1 }} onPress={remove} />
        </Row>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  autoInfo: { color: colors.muted, fontSize: 13, lineHeight: 19 },
});
