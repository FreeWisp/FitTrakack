// Agenda settimanale: navigazione tra settimane, selezione del giorno,
// gestione dello stato delle sessioni (da svolgere / completata / saltata).
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../state/AppContext';
import { Badge, Card, Chip, EmptyState, FAB, IconButton, Row, Screen } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';
import {
  addDays,
  dayNum,
  dayShortName,
  formatLong,
  startOfWeek,
  todayISO,
  weekDays,
  weekLabel,
} from '../../utils/dates';
import { SESSION_STATUS, sessionTypeMeta, statusMeta } from '../../constants';
import { confirmAsync } from '../../utils/confirm';

export default function PlannerScreen({ navigation }) {
  const { state, actions } = useApp();
  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const [weekStart, setWeekStart] = useState(startOfWeek(today));

  const days = weekDays(weekStart);

  const sessionsByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      map[d] = state.sessions
        .filter((s) => s.date === d)
        .sort((a, b) => a.title.localeCompare(b.title));
    });
    return map;
  }, [state.sessions, weekStart]);

  const daySessions = sessionsByDay[selected] || [];

  const goToToday = () => {
    setSelected(today);
    setWeekStart(startOfWeek(today));
  };

  const changeWeek = (dir) => {
    const newStart = addDays(weekStart, 7 * dir);
    setWeekStart(newStart);
    setSelected(newStart);
  };

  const removeSession = async (session) => {
    const ok = await confirmAsync('Eliminare questa sessione?', session.title);
    if (ok) actions.deleteSession(session.id);
  };

  const startWorkout = (session) => {
    navigation.navigate('SchedeTab', {
      screen: 'WorkoutPlayer',
      params: { planId: session.planId, sessionId: session.id },
      initial: false,
    });
  };

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" color={colors.accent} onPress={() => changeWeek(-1)} />
        <Pressable onPress={goToToday}>
          <Text style={styles.weekLabel}>{weekLabel(weekStart)}</Text>
          <Text style={styles.todayHint}>tocca per andare a oggi</Text>
        </Pressable>
        <IconButton icon="chevron-forward" color={colors.accent} onPress={() => changeWeek(1)} />
      </View>

      <View style={styles.daysRow}>
        {days.map((d) => {
          const active = d === selected;
          const isToday = d === today;
          const count = (sessionsByDay[d] || []).length;
          return (
            <Pressable
              key={d}
              onPress={() => setSelected(d)}
              style={[styles.dayCell, active && styles.dayCellActive]}
            >
              <Text style={[styles.dayName, (active || isToday) && { color: colors.accent }]}>
                {dayShortName(d)}
              </Text>
              <Text style={[styles.dayNum, active && { color: colors.accent, fontWeight: '800' }]}>
                {dayNum(d)}
              </Text>
              <View style={styles.dotsRow}>
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.selectedDate}>{formatLong(selected)}</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.l, paddingBottom: 120 }}
      >
        {daySessions.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Nessuna sessione in questo giorno"
            message="Usa il pulsante + per pianificare una sessione."
          />
        ) : (
          daySessions.map((s) => {
            const type = sessionTypeMeta(s.type);
            const plan = state.plans.find((p) => p.id === s.planId);
            return (
              <Card key={s.id} onPress={() => navigation.navigate('SessionForm', { id: s.id })}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.sessionTitle}>{s.title}</Text>
                    <Row style={{ marginTop: 6, flexWrap: 'wrap' }}>
                      <Badge label={type.label} color={type.color} icon={type.icon} />
                      {plan ? <Badge label={plan.name} color={colors.muted} /> : null}
                    </Row>
                  </View>
                  <IconButton icon="trash-outline" color={colors.danger} onPress={() => removeSession(s)} />
                </Row>

                <Row style={{ marginTop: spacing.m, justifyContent: 'space-between' }}>
                  <Row style={{ gap: 6 }}>
                    {SESSION_STATUS.map((st) => {
                      const active = s.status === st.key;
                      return (
                        <Pressable
                          key={st.key}
                          onPress={() => actions.setSessionStatus(s.id, st.key)}
                          style={[
                            styles.statusBtn,
                            active && { backgroundColor: st.color + '26', borderColor: st.color },
                          ]}
                        >
                          <Ionicons
                            name={st.icon}
                            size={14}
                            color={active ? st.color : colors.muted}
                          />
                          <Text style={[styles.statusText, active && { color: st.color }]}>
                            {st.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </Row>
                </Row>

                {plan && s.status === 'planned' ? (
                  <Pressable style={styles.startBtn} onPress={() => startWorkout(s)}>
                    <Ionicons name="play" size={15} color="#fff" />
                    <Text style={styles.startLabel}>Avvia allenamento guidato</Text>
                  </Pressable>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB label="Sessione" onPress={() => navigation.navigate('SessionForm', { date: selected })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  weekLabel: { color: colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  todayHint: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 2 },
  daysRow: { flexDirection: 'row', paddingHorizontal: spacing.l, gap: 4, marginBottom: spacing.s },
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
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 4, height: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  selectedDate: {
    color: colors.muted,
    fontSize: 13,
    paddingHorizontal: spacing.l,
    marginBottom: spacing.s,
    textTransform: 'capitalize',
  },
  sessionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.m,
    paddingVertical: 10,
    marginTop: spacing.m,
    gap: 6,
  },
  startLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
