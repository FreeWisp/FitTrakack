// Dati dimostrativi caricati al primo avvio. Le date sono generate in modo
// relativo a "oggi", così la demo risulta sempre attuale.
import { addDays, endOfMonth, startOfMonth, todayISO } from '../utils/dates';

export function buildSeed() {
  const today = todayISO();

  const exercises = [
    {
      id: 'ex-panca',
      name: 'Panca piana',
      description:
        'Sdraiati sulla panca, impugna il bilanciere poco oltre le spalle, scendi controllato al petto e spingi verso l\'alto senza bloccare i gomiti.',
      primaryMuscle: 'Petto',
      secondaryMuscles: ['Tricipiti', 'Spalle'],
      difficulty: 'intermedio',
      equipment: 'Bilanciere',
      durationMin: 15,
      repsHint: '4×8',
      notes: 'Tenere le scapole addotte per tutta la serie.',
    },
    {
      id: 'ex-squat',
      name: 'Squat con bilanciere',
      description:
        'Bilanciere sul trapezio, piedi larghezza spalle, scendi mantenendo la schiena neutra fino a cosce parallele al pavimento, poi risali.',
      primaryMuscle: 'Gambe',
      secondaryMuscles: ['Glutei', 'Core'],
      difficulty: 'intermedio',
      equipment: 'Bilanciere',
      durationMin: 15,
      repsHint: '4×6-8',
      notes: 'Riscaldarsi sempre con serie a vuoto.',
    },
    {
      id: 'ex-stacco',
      name: 'Stacco da terra',
      description:
        'Con il bilanciere a terra, fletti anche e ginocchia, schiena neutra, e solleva il carico distendendo le gambe fino alla posizione eretta.',
      primaryMuscle: 'Schiena',
      secondaryMuscles: ['Gambe', 'Glutei', 'Core'],
      difficulty: 'avanzato',
      equipment: 'Bilanciere',
      durationMin: 15,
      repsHint: '3×5',
      notes: 'Curare la tecnica prima di aumentare il carico.',
    },
    {
      id: 'ex-trazioni',
      name: 'Trazioni alla sbarra',
      description:
        'Impugna la sbarra con presa prona, parti da braccia distese e tira il corpo verso l\'alto fino a superare la sbarra con il mento.',
      primaryMuscle: 'Schiena',
      secondaryMuscles: ['Bicipiti'],
      difficulty: 'avanzato',
      equipment: 'Corpo libero',
      durationMin: 10,
      repsHint: '4×max',
      notes: 'In alternativa usare la lat machine o gli elastici.',
    },
    {
      id: 'ex-military',
      name: 'Military press',
      description:
        'In piedi, bilanciere all\'altezza delle clavicole, spingi sopra la testa mantenendo core e glutei contratti.',
      primaryMuscle: 'Spalle',
      secondaryMuscles: ['Tricipiti', 'Core'],
      difficulty: 'intermedio',
      equipment: 'Bilanciere',
      durationMin: 12,
      repsHint: '4×8',
      notes: '',
    },
    {
      id: 'ex-curl',
      name: 'Curl con manubri',
      description:
        'In piedi o seduto, fletti l\'avambraccio portando il manubrio verso la spalla senza oscillare il busto.',
      primaryMuscle: 'Bicipiti',
      secondaryMuscles: [],
      difficulty: 'principiante',
      equipment: 'Manubri',
      durationMin: 8,
      repsHint: '3×12',
      notes: '',
    },
    {
      id: 'ex-french',
      name: 'French press',
      description:
        'Sdraiato, porta il bilanciere EZ dietro la testa flettendo solo i gomiti, poi distendi le braccia.',
      primaryMuscle: 'Tricipiti',
      secondaryMuscles: [],
      difficulty: 'principiante',
      equipment: 'Manubri',
      durationMin: 8,
      repsHint: '3×12',
      notes: '',
    },
    {
      id: 'ex-affondi',
      name: 'Affondi con manubri',
      description:
        'Passo avanti mantenendo il busto verticale, scendi finché il ginocchio posteriore sfiora il pavimento, poi torna in posizione.',
      primaryMuscle: 'Gambe',
      secondaryMuscles: ['Glutei'],
      difficulty: 'principiante',
      equipment: 'Manubri',
      durationMin: 10,
      repsHint: '3×10 per gamba',
      notes: '',
    },
    {
      id: 'ex-plank',
      name: 'Plank',
      description:
        'In appoggio su avambracci e punte dei piedi, mantieni il corpo in linea contraendo addome e glutei.',
      primaryMuscle: 'Core',
      secondaryMuscles: ['Spalle'],
      difficulty: 'principiante',
      equipment: 'Corpo libero',
      durationMin: 5,
      repsHint: '3×45s',
      notes: 'Non far cadere il bacino.',
    },
    {
      id: 'ex-lat',
      name: 'Lat machine',
      description:
        'Seduto alla macchina, tira la barra verso l\'alto del petto tenendo i gomiti verso il basso, controlla la risalita.',
      primaryMuscle: 'Schiena',
      secondaryMuscles: ['Bicipiti'],
      difficulty: 'principiante',
      equipment: 'Macchina',
      durationMin: 10,
      repsHint: '3×10',
      notes: '',
    },
    {
      id: 'ex-corsa',
      name: 'Corsa su tapis roulant',
      description:
        'Corsa a ritmo costante o a intervalli. Regolare velocità e pendenza in base al livello.',
      primaryMuscle: 'Cardio',
      secondaryMuscles: ['Gambe'],
      difficulty: 'principiante',
      equipment: 'Tapis roulant',
      durationMin: 30,
      repsHint: '30 min',
      notes: '',
    },
    {
      id: 'ex-crunch',
      name: 'Crunch',
      description:
        'Sdraiato con ginocchia flesse, solleva le spalle da terra contraendo l\'addome, senza tirare il collo.',
      primaryMuscle: 'Core',
      secondaryMuscles: [],
      difficulty: 'principiante',
      equipment: 'Corpo libero',
      durationMin: 6,
      repsHint: '3×20',
      notes: '',
    },
  ];

  const plans = [
    {
      id: 'p-fullbody',
      name: 'Full Body A',
      description: 'Scheda completa per tutto il corpo, tre volte a settimana.',
      goal: 'Forza',
      level: 'intermedio',
      durationMin: 60,
      frequency: '3 volte a settimana',
      notes: 'Aumentare il carico quando si completano tutte le serie previste.',
      items: [
        { exerciseId: 'ex-squat', sets: 4, reps: 8, restSec: 90, weight: 60 },
        { exerciseId: 'ex-panca', sets: 4, reps: 8, restSec: 90, weight: 50 },
        { exerciseId: 'ex-lat', sets: 3, reps: 10, restSec: 75, weight: 45 },
        { exerciseId: 'ex-military', sets: 3, reps: 8, restSec: 90, weight: 30 },
        { exerciseId: 'ex-plank', sets: 3, reps: 45, restSec: 45, weight: 0 },
      ],
    },
    {
      id: 'p-upper',
      name: 'Upper Body Ipertrofia',
      description: 'Focus sulla parte alta del corpo con volumi medio-alti.',
      goal: 'Ipertrofia',
      level: 'intermedio',
      durationMin: 50,
      frequency: '2 volte a settimana',
      notes: '',
      items: [
        { exerciseId: 'ex-panca', sets: 4, reps: 10, restSec: 75, weight: 45 },
        { exerciseId: 'ex-trazioni', sets: 4, reps: 8, restSec: 90, weight: 0 },
        { exerciseId: 'ex-military', sets: 3, reps: 10, restSec: 75, weight: 25 },
        { exerciseId: 'ex-curl', sets: 3, reps: 12, restSec: 60, weight: 12 },
        { exerciseId: 'ex-french', sets: 3, reps: 12, restSec: 60, weight: 10 },
      ],
    },
    {
      id: 'p-cardio',
      name: 'Cardio & Core',
      description: 'Seduta leggera di cardio e addominali, ideale come richiamo.',
      goal: 'Dimagrimento',
      level: 'principiante',
      durationMin: 40,
      frequency: '1-2 volte a settimana',
      notes: '',
      items: [
        { exerciseId: 'ex-corsa', sets: 1, reps: 30, restSec: 0, weight: 0 },
        { exerciseId: 'ex-crunch', sets: 3, reps: 20, restSec: 45, weight: 0 },
        { exerciseId: 'ex-plank', sets: 3, reps: 45, restSec: 45, weight: 0 },
        { exerciseId: 'ex-affondi', sets: 3, reps: 10, restSec: 60, weight: 8 },
      ],
    },
  ];

  const sessions = [
  ];

  // Storico allenamenti
  const logs = [
  ];
  // Storico obiettivi
  const goals = [
  ];

  return { exercises, plans, sessions, logs, goals };
}
