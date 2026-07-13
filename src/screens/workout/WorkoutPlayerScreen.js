// Allenamento guidato: accompagna l'utente esercizio per esercizio e serie
// per serie, con timer di recupero automatico. Al termine l'allenamento viene
// salvato nel diario e la sessione collegata viene marcata come completata.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/AppContext';
import { Button, Card, EmptyState, ProgressBar, Row } from '../../components/ui';
import { ChipGroup } from '../../components/forms';
import { colors, radius, spacing } from '../../theme';
import { formatSeconds, todayISO } from '../../utils/dates';
import { confirmAsync } from '../../utils/confirm';

const FATIGUE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  key: i + 1,
  label: String(i + 1),
}));

export default function WorkoutPlayerScreen({ route, navigation }) {
  const { planId, sessionId } = route.params || {};
  const { state, actions } = useApp();
  const insets = useSafeAreaInsets();

  const plan = state.plans.find((p) => p.id === planId);

  // Esercizi della scheda arricchiti con i dati dell'esercizio.
  const items = useMemo(() => {
    if (!plan) return [];
    return plan.items
      .map((item) => ({
        ...item,
        exercise: state.exercises.find((e) => e.id === item.exerciseId),
      }))
      .filter((item) => item.exercise);
  }, [plan]);

  const [idx, setIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [phase, setPhase] = useState('work'); // work | rest | summary
  const [restLeft, setRestLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [performed, setPerformed] = useState(() => items.map(() => []));
  const [fatigue, setFatigue] = useState(6);
  const [saved, setSaved] = useState(false);
  const pendingNext = useRef(null);

  // Timer del tempo totale trascorso.
  useEffect(() => {
    if (phase === 'summary') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Countdown del recupero.
  useEffect(() => {
    if (phase !== 'rest') return;
    const t = setInterval(() => setRestLeft((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Fine recupero: vibrazione e passaggio alla serie/esercizio successivo.
  useEffect(() => {
    if (phase === 'rest' && restLeft <= 0) {
      if (Platform.OS !== 'web') Vibration.vibrate(500);
      applyNext();
    }
  }, [phase, restLeft]);

  if (!plan || items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <EmptyState
          icon="barbell-outline"
          title="Scheda non disponibile"
          message="La scheda non esiste più oppure non contiene esercizi."
        />
        <Button label="Torna indietro" onPress={() => navigation.goBack()} style={{ margin: spacing.l }} />
      </View>
    );
  }

  const item = items[idx];
  const totalSets = items.reduce((t, i) => t + i.sets, 0);
  const doneSets = performed.reduce((t, sets) => t + sets.length, 0);

  const applyNext = () => {
    const next = pendingNext.current;
    if (!next) return;
    pendingNext.current = null;
    setIdx(next.idx);
    setSetNum(next.setNum);
    setPhase('work');
  };

  const startRest = (seconds) => {
    if (seconds <= 0) {
      applyNext();
      return;
    }
    setRestLeft(seconds);
    setPhase('rest');
  };

  const completeSet = () => {
    setPerformed((p) =>
      p.map((sets, i) => (i === idx ? [...sets, { reps: item.reps, weight: item.weight || 0 }] : sets))
    );
    if (setNum < item.sets) {
      pendingNext.current = { idx, setNum: setNum + 1 };
      startRest(item.restSec);
    } else if (idx < items.length - 1) {
      pendingNext.current = { idx: idx + 1, setNum: 1 };
      startRest(item.restSec);
    } else {
      setPhase('summary');
    }
  };

  const skipExercise = () => {
    if (idx < items.length - 1) {
      setIdx(idx + 1);
      setSetNum(1);
      setPhase('work');
    } else {
      setPhase('summary');
    }
  };

  const exit = async () => {
    if (phase === 'summary' || (await confirmAsync('Uscire dall\'allenamento?', 'I progressi non salvati andranno persi.'))) {
      navigation.goBack();
    }
  };

  const saveLog = () => {
    if (saved) return;
    const entries = items
      .map((it, i) => ({
        exerciseId: it.exerciseId,
        exerciseName: it.exercise.name,
        sets: performed[i],
      }))
      .filter((e) => e.sets.length > 0);
    actions.addLog({
      date: todayISO(),
      title: plan.name,
      planId: plan.id,
      durationMin: Math.max(1, Math.round(elapsed / 60)),
      fatigue,
      notes: 'Registrato con l\'allenamento guidato.',
      entries,
    });
    if (sessionId) actions.setSessionStatus(sessionId, 'done');
    setSaved(true);
    navigation.popToTop();
    navigation.navigate('DiarioTab', { screen: 'LogsList' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header custom */}
      <View style={styles.header}>
        <Pressable onPress={exit} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.muted} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {plan.name}
          </Text>
          <Text style={styles.headerElapsed}>⏱ {formatSeconds(elapsed)}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar value={doneSets / totalSets} height={6} />
        <Text style={styles.progressText}>
          {doneSets}/{totalSets} serie completate
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {phase === 'work' ? (
          <>
            <Text style={styles.stepLabel}>
              Esercizio {idx + 1} di {items.length}
            </Text>
            <Text style={styles.exerciseName}>{item.exercise.name}</Text>
            <Text style={styles.setLabel}>
              Serie {setNum} di {item.sets}
            </Text>
            <View style={styles.targetBox}>
              <Text style={styles.targetValue}>
                {item.reps} <Text style={styles.targetUnit}>ripetizioni</Text>
                {item.weight > 0 ? (
                  <Text style={styles.targetValue}>
                    {'  ·  '}
                    {item.weight} <Text style={styles.targetUnit}>kg</Text>
                  </Text>
                ) : null}
              </Text>
            </View>
            {item.exercise.description ? (
              <Card style={{ backgroundColor: colors.surface }}>
                <Text style={styles.hint}>{item.exercise.description}</Text>
              </Card>
            ) : null}
            <Pressable style={styles.mainButton} onPress={completeSet}>
              <Ionicons name="checkmark" size={22} color="#fff" />
              <Text style={styles.mainButtonLabel}>Serie completata</Text>
            </Pressable>
            <Button label="Salta esercizio" variant="secondary" onPress={skipExercise} style={{ marginTop: spacing.m }} />
          </>
        ) : null}

        {phase === 'rest' ? (
          <>
            <Text style={styles.stepLabel}>Recupero</Text>
            <Text style={styles.restTime}>{formatSeconds(Math.max(0, restLeft))}</Text>
            <ProgressBar
              value={restLeft / (item.restSec || 1)}
              color={colors.info}
              height={10}
              style={{ marginVertical: spacing.l }}
            />
            <Text style={styles.nextUp}>
              Prossima:{' '}
              {pendingNext.current
                ? `${items[pendingNext.current.idx].exercise.name} · serie ${pendingNext.current.setNum}`
                : ''}
            </Text>
            <Row style={{ gap: spacing.m, marginTop: spacing.l }}>
              <Button
                label="+15 s"
                icon="add"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => setRestLeft((r) => r + 15)}
              />
              <Button
                label="Salta recupero"
                icon="play-skip-forward-outline"
                style={{ flex: 1 }}
                onPress={applyNext}
              />
            </Row>
          </>
        ) : null}

        {phase === 'summary' ? (
          <>
            <Ionicons name="trophy-outline" size={48} color={colors.warning} style={{ alignSelf: 'center' }} />
            <Text style={styles.summaryTitle}>Allenamento completato!</Text>
            <Card>
              <SummaryRow label="Durata" value={formatSeconds(elapsed)} />
              <SummaryRow
                label="Esercizi svolti"
                value={`${performed.filter((s) => s.length > 0).length}/${items.length}`}
              />
              <SummaryRow label="Serie completate" value={`${doneSets}/${totalSets}`} last />
            </Card>
            <ChipGroup
              label="Fatica percepita (1 = leggera, 10 = massima)"
              options={FATIGUE_OPTIONS}
              value={fatigue}
              onChange={setFatigue}
            />
            <Pressable style={styles.mainButton} onPress={saveLog}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.mainButtonLabel}>Salva nel diario</Text>
            </Pressable>
            <Button
              label="Esci senza salvare"
              variant="danger"
              onPress={() => navigation.goBack()}
              style={{ marginTop: spacing.m }}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryRow({ label, value, last }) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryBorder]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
  },
  headerTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  headerElapsed: { color: colors.muted, fontSize: 12, marginTop: 2 },
  progressWrap: { paddingHorizontal: spacing.l, marginBottom: spacing.s },
  progressText: { color: colors.muted, fontSize: 11, marginTop: 6, textAlign: 'center' },
  body: { padding: spacing.l, paddingBottom: 60 },
  stepLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: spacing.l,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.s,
  },
  setLabel: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: spacing.s },
  targetBox: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  targetValue: { color: colors.text, fontSize: 30, fontWeight: '800' },
  targetUnit: { color: colors.muted, fontSize: 15, fontWeight: '400' },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.l,
    paddingVertical: 16,
    gap: 8,
    marginTop: spacing.l,
  },
  mainButtonLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  restTime: {
    color: colors.info,
    fontSize: 64,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  nextUp: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  summaryTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: spacing.l,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLabel: { color: colors.muted, fontSize: 14 },
  summaryValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
});
