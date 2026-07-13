// Form di creazione/modifica di una sessione pianificata.
// Può ricevere: id (modifica), date (giorno preselezionato dall'Agenda),
// planId (pianificazione avviata dal dettaglio di una scheda).
import React, { useLayoutEffect, useState } from 'react';
import { useApp } from '../../state/AppContext';
import { Button, Row, Screen } from '../../components/ui';
import { ChipGroup, DateStrip, FormField, PickerField, Segmented } from '../../components/forms';
import { PickerModal } from '../../components/pickers';
import { spacing } from '../../theme';
import { SESSION_STATUS, SESSION_TYPES, sessionTypeMeta } from '../../constants';
import { todayISO } from '../../utils/dates';
import { confirmAsync } from '../../utils/confirm';

export default function SessionFormScreen({ route, navigation }) {
  const { id, date, planId } = route.params || {};
  const { state, actions } = useApp();
  const existing = state.sessions.find((s) => s.id === id);

  const initialPlan = planId ? state.plans.find((p) => p.id === planId) : null;

  const [form, setForm] = useState(
    existing || {
      date: date || todayISO(),
      type: 'forza',
      title: initialPlan ? initialPlan.name : '',
      planId: initialPlan ? initialPlan.id : null,
      status: 'planned',
      notes: '',
    }
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: existing ? 'Modifica sessione' : 'Nuova sessione' });
  }, [navigation, existing]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const selectedPlan = state.plans.find((p) => p.id === form.planId);

  const save = () => {
    const title =
      form.title.trim() || (selectedPlan ? selectedPlan.name : sessionTypeMeta(form.type).label);
    const data = { ...form, title };
    if (existing) {
      actions.updateSession(id, data);
    } else {
      actions.addSession(data);
    }
    navigation.goBack();
  };

  const remove = async () => {
    const ok = await confirmAsync('Eliminare questa sessione?', existing.title);
    if (ok) {
      actions.deleteSession(id);
      navigation.goBack();
    }
  };

  const duplicateNextWeek = () => {
    actions.duplicateSession(id, existing.date, 7);
    navigation.goBack();
  };

  return (
    <Screen>
      <DateStrip label="Giorno" value={form.date} onChange={set('date')} />
      <ChipGroup label="Tipo di sessione" options={SESSION_TYPES} value={form.type} onChange={set('type')} />
      <FormField
        label="Titolo"
        value={form.title}
        onChangeText={set('title')}
        placeholder={selectedPlan ? selectedPlan.name : 'Es. Allenamento gambe'}
      />
      <PickerField
        label="Scheda collegata (facoltativa)"
        valueLabel={selectedPlan ? selectedPlan.name : null}
        placeholder="Nessuna scheda"
        onPress={() => setPickerOpen(true)}
        onClear={() => set('planId')(null)}
      />
      <Segmented label="Stato" options={SESSION_STATUS} value={form.status} onChange={set('status')} />
      <FormField
        label="Note"
        value={form.notes}
        onChangeText={set('notes')}
        placeholder="Eventuali annotazioni…"
        multiline
      />

      <Button label={existing ? 'Salva modifiche' : 'Pianifica sessione'} icon="checkmark" onPress={save} />

      {existing ? (
        <Row style={{ gap: spacing.m, marginTop: spacing.m }}>
          <Button
            label="Duplica a +7 giorni"
            icon="copy-outline"
            variant="secondary"
            style={{ flex: 1 }}
            onPress={duplicateNextWeek}
          />
          <Button label="Elimina" icon="trash-outline" variant="danger" style={{ flex: 1 }} onPress={remove} />
        </Row>
      ) : null}

      <PickerModal
        visible={pickerOpen}
        title="Collega una scheda"
        items={state.plans.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `${p.items.length} esercizi · ${p.durationMin} min`,
        }))}
        onSelect={(item) => {
          set('planId')(item.id);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </Screen>
  );
}
