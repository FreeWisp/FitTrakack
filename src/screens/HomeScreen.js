// Dashboard: sessioni di oggi, riepiloghi rapidi, andamento e obiettivi.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import {
  Badge,
  Card,
  EmptyState,
  ProgressBar,
  Row,
  Screen,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { WeekBars } from '../components/charts';
import { colors, spacing } from '../theme';
import { addDays, formatLong, startOfWeek, todayISO } from '../utils/dates';
import { goalProgress, logsPerWeek } from '../utils/stats';
import { sessionTypeMeta, statusMeta } from '../constants';
import { confirmAsync } from '../utils/confirm';

export default function HomeScreen({ navigation }) {
  const { state, actions } = useApp();
  const today = todayISO();
  const monday = startOfWeek(today);
  const weekEnd = addDays(monday, 6);

  const todaySessions = state.sessions.filter((s) => s.date === today);
  const weekSessions = state.sessions.filter((s) => s.date >= monday && s.date <= weekEnd);
  const activeGoals = state.goals
    .map((g) => ({ goal: g, progress: goalProgress(g, state.logs) }))
    .filter((x) => x.progress.status === 'active')
    .slice(0, 3);

  const startWorkout = (session) => {
    navigation.navigate('SchedeTab', {
      screen: 'WorkoutPlayer',
      params: { planId: session.planId, sessionId: session.id },
      initial: false,
    });
  };

  const resetDemo = async () => {
    const ok = await confirmAsync(
      'Ripristinare i dati demo?',
      'Tutti i dati attuali verranno sostituiti con quelli dimostrativi.'
    );
    if (ok) actions.resetDemoData();
  };

  return (
    <Screen>
      <Text style={styles.date}>{formatLong(today)}</Text>

      <SectionTitle title="Oggi" actionLabel="Agenda" onAction={() => navigation.navigate('AgendaTab')} />
      {todaySessions.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar-outline"
            title="Nessuna sessione pianificata per oggi"
            message="Aggiungi una sessione dall'Agenda oppure goditi il riposo!"
          />
        </Card>
      ) : (
        todaySessions.map((s) => {
          const type = sessionTypeMeta(s.type);
          const status = statusMeta(s.status);
          const plan = state.plans.find((p) => p.id === s.planId);
          return (
            <Card key={s.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.sessionTitle}>{s.title}</Text>
                  <Row style={{ marginTop: 6 }}>
                    <Badge label={type.label} color={type.color} icon={type.icon} />
                    <Badge label={status.label} color={status.color} icon={status.icon} />
                  </Row>
                  {plan ? (
                    <Text style={styles.sessionMeta}>
                      Scheda: {plan.name} · {plan.items.length} esercizi
                    </Text>
                  ) : null}
                </View>
                {plan && s.status === 'planned' ? (
                  <Pressable style={styles.playButton} onPress={() => startWorkout(s)}>
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.playLabel}>Avvia</Text>
                  </Pressable>
                ) : null}
              </Row>
            </Card>
          );
        })
      )}

      <SectionTitle title="In sintesi" actionLabel="Statistiche" onAction={() => navigation.navigate('Stats')} />
      <Row style={{ gap: spacing.m, marginBottom: spacing.m }}>
        <StatTile icon="barbell-outline" label="Esercizi" value={state.exercises.length} />
        <StatTile icon="albums-outline" label="Schede" value={state.plans.length} color={colors.info} />
      </Row>
      <Row style={{ gap: spacing.m, marginBottom: spacing.s }}>
        <StatTile
          icon="calendar-outline"
          label="Sessioni questa settimana"
          value={weekSessions.length}
          color={colors.warning}
        />
        <StatTile
          icon="checkmark-done-outline"
          label="Allenamenti registrati"
          value={state.logs.length}
          color={colors.success}
        />
      </Row>

      <SectionTitle title="Andamento" />
      <Card>
        <Text style={styles.cardCaption}>Allenamenti per settimana (ultime 6)</Text>
        <WeekBars data={logsPerWeek(state.logs, 6)} />
      </Card>

      <SectionTitle title="Obiettivi" actionLabel="Vedi tutti" onAction={() => navigation.navigate('Goals')} />
      {activeGoals.length === 0 ? (
        <Card>
          <EmptyState
            icon="flag-outline"
            title="Nessun obiettivo in corso"
            message="Crea un obiettivo per monitorare i tuoi progressi."
          />
        </Card>
      ) : (
        activeGoals.map(({ goal, progress }) => (
          <Card
            key={goal.id}
            onPress={() => navigation.navigate('GoalForm', { id: goal.id })}
          >
            <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={styles.goalTitle} numberOfLines={1}>
                {goal.title}
              </Text>
              <Text style={styles.goalValue}>
                {progress.current}/{goal.target} {goal.unit}
              </Text>
            </Row>
            <ProgressBar value={progress.pct} />
          </Card>
        ))
      )}

      <Pressable onPress={resetDemo} style={styles.reset}>
        <Ionicons name="refresh" size={14} color={colors.muted} />
        <Text style={styles.resetText}>Ripristina dati demo</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.m,
    textTransform: 'capitalize',
  },
  sessionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sessionMeta: { color: colors.muted, fontSize: 12, marginTop: 6 },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  playLabel: { color: '#fff', fontWeight: '700', marginLeft: 4, fontSize: 13 },
  cardCaption: { color: colors.muted, fontSize: 12, marginBottom: spacing.m },
  goalTitle: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  goalValue: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: 6,
  },
  resetText: { color: colors.muted, fontSize: 12 },
});
