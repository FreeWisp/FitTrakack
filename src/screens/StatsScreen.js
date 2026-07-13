// Riepiloghi e statistiche derivati da diario, sessioni e obiettivi.
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useApp } from '../state/AppContext';
import { Card, ProgressBar, Row, Screen, SectionTitle, StatTile } from '../components/ui';
import { HBarChart, WeekBars } from '../components/charts';
import { colors, spacing } from '../theme';
import { addDays, startOfWeek, todayISO } from '../utils/dates';
import {
  avgPerWeek,
  exercisesByMuscle,
  goalStatus,
  logVolume,
  logsInRange,
  logsPerWeek,
  totalMinutes,
} from '../utils/stats';

export default function StatsScreen() {
  const { state } = useApp();
  const today = todayISO();
  const monday = startOfWeek(today);
  const weekEnd = addDays(monday, 6);
  const last30 = addDays(today, -30);

  const recentLogs = logsInRange(state.logs, last30, today);
  const minutes30 = totalMinutes(recentLogs);
  const volume30 = Math.round(recentLogs.reduce((t, l) => t + logVolume(l), 0));

  const weekSessions = state.sessions.filter((s) => s.date >= monday && s.date <= weekEnd);
  const weekDone = weekSessions.filter((s) => s.status === 'done').length;
  const weekSkipped = weekSessions.filter((s) => s.status === 'skipped').length;

  const goalsDone = state.goals.filter((g) => goalStatus(g, state.logs) === 'done').length;
  const goalsActive = state.goals.filter((g) => goalStatus(g, state.logs) === 'active').length;
  const goalsExpired = state.goals.length - goalsDone - goalsActive;

  return (
    <Screen>
      <SectionTitle title="Riepilogo generale" style={{ marginTop: 0 }} />
      <Row style={{ gap: spacing.m, marginBottom: spacing.m }}>
        <StatTile icon="checkmark-done-outline" label="Allenamenti totali" value={state.logs.length} color={colors.success} />
        <StatTile icon="time-outline" label="Minuti (ultimi 30 gg)" value={minutes30} color={colors.info} />
      </Row>
      <Row style={{ gap: spacing.m, marginBottom: spacing.s }}>
        <StatTile icon="trending-up-outline" label="Media a settimana" value={avgPerWeek(state.logs, 4)} color={colors.warning} />
        <StatTile icon="barbell-outline" label="Volume 30 gg (kg)" value={volume30} />
      </Row>

      <SectionTitle title="Allenamenti per settimana" />
      <Card>
        <Text style={styles.caption}>Ultime 8 settimane</Text>
        <WeekBars data={logsPerWeek(state.logs, 8)} />
      </Card>

      <SectionTitle title="Settimana corrente" />
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={styles.label}>Sessioni completate</Text>
          <Text style={styles.value}>
            {weekDone}/{weekSessions.length}
          </Text>
        </Row>
        <ProgressBar
          value={weekSessions.length ? weekDone / weekSessions.length : 0}
          color={colors.success}
        />
        <Text style={styles.note}>
          {weekSkipped > 0
            ? `${weekSkipped} sessione/i saltate questa settimana.`
            : 'Nessuna sessione saltata questa settimana.'}
        </Text>
      </Card>

      <SectionTitle title="Esercizi per gruppo muscolare" />
      <Card>
        <HBarChart data={exercisesByMuscle(state.exercises)} />
      </Card>

      <SectionTitle title="Obiettivi" />
      <Row style={{ gap: spacing.m }}>
        <StatTile icon="flag-outline" label="In corso" value={goalsActive} color={colors.info} />
        <StatTile icon="trophy-outline" label="Raggiunti" value={goalsDone} color={colors.success} />
        <StatTile icon="alert-circle-outline" label="Scaduti" value={goalsExpired} color={colors.danger} />
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  caption: { color: colors.muted, fontSize: 12, marginBottom: spacing.m },
  label: { color: colors.text, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: '700' },
  note: { color: colors.muted, fontSize: 12, marginTop: 10 },
});
