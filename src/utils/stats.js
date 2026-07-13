// Funzioni pure che derivano statistiche e riepiloghi dallo stato dell'app.
import { addDays, dayNum, parseISO, startOfWeek, todayISO } from './dates';

// Volume totale di un allenamento registrato (somma di rip × carico).
export function logVolume(log) {
  return log.entries.reduce(
    (tot, e) => tot + e.sets.reduce((s, x) => s + (x.reps || 0) * (x.weight || 0), 0),
    0
  );
}

export function logSetsCount(log) {
  return log.entries.reduce((tot, e) => tot + e.sets.length, 0);
}

export function totalMinutes(logs) {
  return logs.reduce((tot, l) => tot + (l.durationMin || 0), 0);
}

// Distribuzione degli esercizi per gruppo muscolare principale.
export function exercisesByMuscle(exercises) {
  const counts = {};
  exercises.forEach((e) => {
    counts[e.primaryMuscle] = (counts[e.primaryMuscle] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

// Numero di allenamenti registrati per ciascuna delle ultime n settimane.
export function logsPerWeek(logs, nWeeks) {
  const currentMonday = startOfWeek(todayISO());
  const buckets = [];
  for (let i = nWeeks - 1; i >= 0; i--) {
    const start = addDays(currentMonday, -7 * i);
    const end = addDays(start, 7);
    const value = logs.filter((l) => l.date >= start && l.date < end).length;
    buckets.push({ label: `${dayNum(start)}/${parseISO(start).getMonth() + 1}`, value });
  }
  return buckets;
}

export function logsInRange(logs, fromISO, toISOIncluded) {
  return logs.filter(
    (l) => l.date >= fromISO && (!toISOIncluded || l.date <= toISOIncluded)
  );
}

// Media di allenamenti a settimana nelle ultime n settimane (1 decimale).
export function avgPerWeek(logs, nWeeks = 4) {
  const from = addDays(startOfWeek(todayISO()), -7 * (nWeeks - 1));
  const count = logs.filter((l) => l.date >= from).length;
  return Math.round((count / nWeeks) * 10) / 10;
}

// Valore attuale di un obiettivo: calcolato dallo storico per le categorie
// automatiche (frequenza, durata), manuale per le altre.
export function goalCurrentValue(goal, logs) {
  if (goal.category === 'frequenza' || goal.category === 'durata') {
    const relevant = logsInRange(logs, goal.startDate, goal.deadline || null);
    return goal.category === 'frequenza' ? relevant.length : totalMinutes(relevant);
  }
  return goal.current || 0;
}

export function goalStatus(goal, logs) {
  const current = goalCurrentValue(goal, logs);
  if (goal.target > 0 && current >= goal.target) return 'done';
  if (goal.deadline && goal.deadline < todayISO()) return 'expired';
  return 'active';
}

export function goalProgress(goal, logs) {
  const current = goalCurrentValue(goal, logs);
  const pct = goal.target > 0 ? Math.min(1, current / goal.target) : 0;
  return { current, pct, status: goalStatus(goal, logs) };
}
