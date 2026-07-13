// Vocabolari di dominio condivisi da tutta l'app.
import { colors } from './theme';

export const MUSCLE_GROUPS = [
  'Petto',
  'Schiena',
  'Spalle',
  'Bicipiti',
  'Tricipiti',
  'Gambe',
  'Glutei',
  'Core',
  'Full body',
  'Cardio',
];

export const DIFFICULTIES = [
  { key: 'principiante', label: 'Principiante', color: colors.success },
  { key: 'intermedio', label: 'Intermedio', color: colors.warning },
  { key: 'avanzato', label: 'Avanzato', color: colors.danger },
];

export const EQUIPMENT = [
  'Corpo libero',
  'Bilanciere',
  'Manubri',
  'Macchina',
  'Cavi',
  'Kettlebell',
  'Elastico',
  'Tapis roulant',
  'Altro',
];

export const PLAN_GOALS = [
  'Forza',
  'Ipertrofia',
  'Dimagrimento',
  'Resistenza',
  'Mobilità',
  'Benessere',
];

export const SESSION_TYPES = [
  { key: 'forza', label: 'Forza', color: colors.accent, icon: 'barbell-outline' },
  { key: 'cardio', label: 'Cardio', color: colors.info, icon: 'heart-outline' },
  { key: 'stretching', label: 'Stretching', color: colors.success, icon: 'body-outline' },
  { key: 'recupero', label: 'Recupero', color: colors.warning, icon: 'bed-outline' },
  { key: 'altro', label: 'Altro', color: colors.muted, icon: 'apps-outline' },
];

export const SESSION_STATUS = [
  { key: 'planned', label: 'Da svolgere', color: colors.info, icon: 'time-outline' },
  { key: 'done', label: 'Completata', color: colors.success, icon: 'checkmark-circle' },
  { key: 'skipped', label: 'Saltata', color: colors.danger, icon: 'close-circle' },
];

// Le categorie con auto = true calcolano l'avanzamento dallo storico allenamenti.
export const GOAL_CATEGORIES = [
  { key: 'frequenza', label: 'Frequenza', unit: 'allenamenti', auto: true },
  { key: 'durata', label: 'Durata', unit: 'minuti', auto: true },
  { key: 'carico', label: 'Carico', unit: 'kg', auto: false },
  { key: 'ripetizioni', label: 'Ripetizioni', unit: 'rip.', auto: false },
  { key: 'peso', label: 'Peso corporeo', unit: 'kg', auto: false },
  { key: 'altro', label: 'Altro', unit: '', auto: false },
];

export const GOAL_STATUS = [
  { key: 'active', label: 'In corso', color: colors.info },
  { key: 'done', label: 'Raggiunto', color: colors.success },
  { key: 'expired', label: 'Scaduto', color: colors.danger },
];

const byKey = (list) => (key) => list.find((x) => x.key === key) || list[list.length - 1];

export const difficultyMeta = byKey(DIFFICULTIES);
export const sessionTypeMeta = byKey(SESSION_TYPES);
export const statusMeta = byKey(SESSION_STATUS);
export const goalCategoryMeta = byKey(GOAL_CATEGORIES);
export const goalStatusMeta = byKey(GOAL_STATUS);
