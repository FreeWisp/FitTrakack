// Controlli di input riutilizzabili per i form dell'app.
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import {
  addDays,
  dayNum,
  dayShortName,
  startOfWeek,
  todayISO,
  weekDays,
  weekLabel,
} from '../utils/dates';

const addWeeks = (mondayISO, n) => addDays(mondayISO, 7 * n);

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  error,
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted + '99'}
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// Gruppo di chip selezionabili. options: stringhe oppure {key, label, color}.
// Con multi=true consente selezioni multiple (value = array).
export function ChipGroup({ label, options, value, onChange, multi = false }) {
  const normalized = options.map((o) =>
    typeof o === 'string' ? { key: o, label: o, color: colors.accent } : o
  );
  const isActive = (key) => (multi ? (value || []).includes(key) : value === key);
  const toggle = (key) => {
    if (!multi) return onChange(key);
    const current = value || [];
    onChange(
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
  };
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.chipWrap}>
        {normalized.map((o) => {
          const active = isActive(o.key);
          const color = o.color || colors.accent;
          return (
            <Pressable
              key={o.key}
              onPress={() => toggle(o.key)}
              style={[styles.chip, active && { backgroundColor: color + '26', borderColor: color }]}
            >
              <Text style={[styles.chipText, active && { color, fontWeight: '600' }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Segmented({ label, options, value, onChange }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.segmented}>
        {options.map((o) => {
          const active = value === o.key;
          const color = o.color || colors.accent;
          return (
            <Pressable
              key={o.key}
              onPress={() => onChange(o.key)}
              style={[styles.segment, active && { backgroundColor: color + '26' }]}
            >
              <Text
                style={[styles.segmentText, active && { color, fontWeight: '700' }]}
                numberOfLines={1}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Controllo numerico con pulsanti +/-.
export function Stepper({ label, value, onChange, step = 1, min = 0, max = 999, suffix }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <View style={styles.stepper}>
      {label ? <Text style={styles.stepperLabel}>{label}</Text> : null}
      <View style={styles.stepperControls}>
        <Pressable onPress={() => set(value - step)} style={styles.stepperBtn} hitSlop={6}>
          <Ionicons name="remove" size={16} color={colors.accent} />
        </Pressable>
        <Text style={styles.stepperValue}>
          {value}
          {suffix ? <Text style={styles.stepperSuffix}> {suffix}</Text> : null}
        </Text>
        <Pressable onPress={() => set(value + step)} style={styles.stepperBtn} hitSlop={6}>
          <Ionicons name="add" size={16} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

// Selettore di data a strisce settimanali: frecce per cambiare settimana,
// 7 celle per scegliere il giorno.
export function DateStrip({ label, value, onChange }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(value || todayISO()));

  useEffect(() => {
    if (value) setWeekStart(startOfWeek(value));
  }, [value]);

  const days = weekDays(weekStart);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.weekHeader}>
        <Pressable onPress={() => setWeekStart(addWeeks(weekStart, -1))} hitSlop={8} style={styles.weekArrow}>
          <Ionicons name="chevron-back" size={18} color={colors.accent} />
        </Pressable>
        <Text style={styles.weekLabel}>{weekLabel(weekStart)}</Text>
        <Pressable onPress={() => setWeekStart(addWeeks(weekStart, 1))} hitSlop={8} style={styles.weekArrow}>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </Pressable>
      </View>
      <View style={styles.daysRow}>
        {days.map((d) => {
          const active = d === value;
          const isToday = d === todayISO();
          return (
            <Pressable
              key={d}
              onPress={() => onChange(d)}
              style={[styles.dayCell, active && styles.dayCellActive]}
            >
              <Text style={[styles.dayName, active && { color: colors.accent }]}>
                {dayShortName(d)}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  isToday && !active && { color: colors.accent },
                  active && { color: colors.accent, fontWeight: '800' },
                ]}
              >
                {dayNum(d)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Campo che apre un selettore (es. scheda o esercizio) mostrando il valore scelto.
export function PickerField({ label, valueLabel, placeholder = 'Seleziona…', onPress, onClear }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={onPress} style={styles.pickerField}>
        <Text style={[styles.pickerValue, !valueLabel && { color: colors.muted + '99' }]}>
          {valueLabel || placeholder}
        </Text>
        {valueLabel && onClear ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down" size={16} color={colors.muted} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.l },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.m,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  chipText: { color: colors.muted, fontSize: 13 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentText: { color: colors.muted, fontSize: 13 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  stepperLabel: { color: colors.text, fontSize: 14, flex: 1 },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  stepperValue: { color: colors.text, fontSize: 15, fontWeight: '700', minWidth: 52, textAlign: 'center' },
  stepperSuffix: { color: colors.muted, fontSize: 12, fontWeight: '400' },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  weekArrow: { padding: 4 },
  weekLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  daysRow: { flexDirection: 'row', gap: 4 },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayCellActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  dayName: { color: colors.muted, fontSize: 11 },
  dayNum: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 2 },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
  },
  pickerValue: { color: colors.text, fontSize: 15, flex: 1, marginRight: 8 },
});
