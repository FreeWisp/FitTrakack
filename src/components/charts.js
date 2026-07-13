// Grafici leggeri realizzati con sole View, senza librerie esterne.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Grafico a barre orizzontali con etichette (es. distribuzione per gruppo muscolare).
export function HBarChart({ data, color = colors.accent }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View>
      {data.map((d) => (
        <View key={d.label} style={styles.hRow}>
          <Text style={styles.hLabel} numberOfLines={1}>
            {d.label}
          </Text>
          <View style={styles.hTrack}>
            <View
              style={[
                styles.hFill,
                { width: `${(d.value / max) * 100}%`, backgroundColor: d.color || color },
              ]}
            />
          </View>
          <Text style={styles.hValue}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

// Grafico a colonne verticali (es. allenamenti per settimana).
export function WeekBars({ data, color = colors.accent, height = 110 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={[styles.vWrap, { height: height + 38 }]}>
      {data.map((d, i) => (
        <View key={i} style={styles.vCol}>
          <Text style={styles.vValue}>{d.value > 0 ? d.value : ''}</Text>
          <View
            style={[
              styles.vBar,
              {
                height: Math.max(4, (d.value / max) * height),
                backgroundColor: d.value > 0 ? color : colors.border,
              },
            ]}
          />
          <Text style={styles.vLabel} numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
  hLabel: { color: colors.muted, fontSize: 12, width: 84 },
  hTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.s,
    overflow: 'hidden',
    marginHorizontal: spacing.s,
  },
  hFill: { height: 10, borderRadius: radius.s },
  hValue: { color: colors.text, fontSize: 12, fontWeight: '600', width: 24, textAlign: 'right' },
  vWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  vCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  vValue: { color: colors.muted, fontSize: 11, marginBottom: 3 },
  vBar: { width: 18, borderRadius: 6 },
  vLabel: { color: colors.muted, fontSize: 10, marginTop: 6 },
});
