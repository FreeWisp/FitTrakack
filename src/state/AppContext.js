// Store centrale dell'app: Context + useReducer con persistenza su AsyncStorage.
// Le schermate leggono lo stato con useApp() e lo modificano tramite "actions".
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uid } from '../utils/ids';
import { addDays } from '../utils/dates';
import { buildSeed } from '../data/seed';

const STORAGE_KEY = 'fittrack:v1';

const initialState = {
  hydrated: false,
  exercises: [],
  plans: [],
  sessions: [],
  logs: [],
  goals: [],
};

const upsert = (list, id, data) =>
  list.map((x) => (x.id === id ? { ...x, ...data } : x));

function reducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case 'hydrate':
      return { ...initialState, ...payload, hydrated: true };

    // --- Esercizi ---
    case 'add_exercise':
      return { ...state, exercises: [...state.exercises, payload] };
    case 'update_exercise':
      return { ...state, exercises: upsert(state.exercises, payload.id, payload.data) };
    case 'delete_exercise':
      // Cancellazione con integrità referenziale: l'esercizio viene rimosso
      // anche dalle schede. Il diario conserva il nome (snapshot) e non si tocca.
      return {
        ...state,
        exercises: state.exercises.filter((e) => e.id !== payload),
        plans: state.plans.map((p) => ({
          ...p,
          items: p.items.filter((i) => i.exerciseId !== payload),
        })),
      };

    // --- Schede ---
    case 'add_plan':
      return { ...state, plans: [...state.plans, payload] };
    case 'update_plan':
      return { ...state, plans: upsert(state.plans, payload.id, payload.data) };
    case 'delete_plan':
      // Le sessioni e i log che puntavano alla scheda restano validi:
      // il riferimento viene azzerato ma titolo e contenuti sono conservati.
      return {
        ...state,
        plans: state.plans.filter((p) => p.id !== payload),
        sessions: state.sessions.map((s) =>
          s.planId === payload ? { ...s, planId: null } : s
        ),
        logs: state.logs.map((l) => (l.planId === payload ? { ...l, planId: null } : l)),
      };
    case 'duplicate_plan': {
      const src = state.plans.find((p) => p.id === payload.id);
      if (!src) return state;
      const copy = {
        ...src,
        id: payload.newId,
        name: src.name + ' (copia)',
        items: src.items.map((i) => ({ ...i })),
      };
      return { ...state, plans: [...state.plans, copy] };
    }

    // --- Sessioni pianificate ---
    case 'add_session':
      return { ...state, sessions: [...state.sessions, payload] };
    case 'update_session':
      return { ...state, sessions: upsert(state.sessions, payload.id, payload.data) };
    case 'delete_session':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== payload) };
    case 'duplicate_session': {
      const src = state.sessions.find((s) => s.id === payload.id);
      if (!src) return state;
      const copy = {
        ...src,
        id: payload.newId,
        date: payload.date,
        status: 'planned',
      };
      return { ...state, sessions: [...state.sessions, copy] };
    }

    // --- Diario allenamenti ---
    case 'add_log':
      return { ...state, logs: [...state.logs, payload] };
    case 'update_log':
      return { ...state, logs: upsert(state.logs, payload.id, payload.data) };
    case 'delete_log':
      return { ...state, logs: state.logs.filter((l) => l.id !== payload) };

    // --- Obiettivi ---
    case 'add_goal':
      return { ...state, goals: [...state.goals, payload] };
    case 'update_goal':
      return { ...state, goals: upsert(state.goals, payload.id, payload.data) };
    case 'delete_goal':
      return { ...state, goals: state.goals.filter((g) => g.id !== payload) };

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef(null);

  // Idratazione iniziale: carica i dati salvati oppure il seed dimostrativo.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        dispatch({ type: 'hydrate', payload: raw ? JSON.parse(raw) : buildSeed() });
      } catch (e) {
        dispatch({ type: 'hydrate', payload: buildSeed() });
      }
    })();
  }, []);

  // Persistenza: ogni modifica dello stato viene salvata (con debounce).
  useEffect(() => {
    if (!state.hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const { hydrated, ...data } = state;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const actions = useMemo(
    () => ({
      // Esercizi
      addExercise(data) {
        const exercise = { id: uid(), ...data };
        dispatch({ type: 'add_exercise', payload: exercise });
        return exercise;
      },
      updateExercise: (id, data) => dispatch({ type: 'update_exercise', payload: { id, data } }),
      deleteExercise: (id) => dispatch({ type: 'delete_exercise', payload: id }),

      // Schede
      addPlan(data) {
        const plan = { id: uid(), ...data };
        dispatch({ type: 'add_plan', payload: plan });
        return plan;
      },
      updatePlan: (id, data) => dispatch({ type: 'update_plan', payload: { id, data } }),
      deletePlan: (id) => dispatch({ type: 'delete_plan', payload: id }),
      duplicatePlan: (id) => dispatch({ type: 'duplicate_plan', payload: { id, newId: uid() } }),

      // Sessioni
      addSession(data) {
        const session = { id: uid(), ...data };
        dispatch({ type: 'add_session', payload: session });
        return session;
      },
      updateSession: (id, data) => dispatch({ type: 'update_session', payload: { id, data } }),
      deleteSession: (id) => dispatch({ type: 'delete_session', payload: id }),
      setSessionStatus: (id, status) =>
        dispatch({ type: 'update_session', payload: { id, data: { status } } }),
      duplicateSession(id, srcDate, offsetDays = 7) {
        dispatch({
          type: 'duplicate_session',
          payload: { id, newId: uid(), date: addDays(srcDate, offsetDays) },
        });
      },

      // Diario
      addLog(data) {
        const log = { id: uid(), ...data };
        dispatch({ type: 'add_log', payload: log });
        return log;
      },
      updateLog: (id, data) => dispatch({ type: 'update_log', payload: { id, data } }),
      deleteLog: (id) => dispatch({ type: 'delete_log', payload: id }),

      // Obiettivi
      addGoal(data) {
        const goal = { id: uid(), ...data };
        dispatch({ type: 'add_goal', payload: goal });
        return goal;
      },
      updateGoal: (id, data) => dispatch({ type: 'update_goal', payload: { id, data } }),
      deleteGoal: (id) => dispatch({ type: 'delete_goal', payload: id }),

      // Ripristino dei dati dimostrativi
      resetDemoData: () => dispatch({ type: 'hydrate', payload: buildSeed() }),
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve essere usato dentro <AppProvider>');
  return ctx;
}
