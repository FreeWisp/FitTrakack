// Struttura di navigazione: 5 tab, ognuna con il proprio stack.
// Il passaggio di dati tra schermate avviene tramite route params (id delle
// entità), mentre i dati veri risiedono nello store globale (AppContext).
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import GoalsScreen from '../screens/goals/GoalsScreen';
import GoalFormScreen from '../screens/goals/GoalFormScreen';
import ExercisesScreen from '../screens/exercises/ExercisesScreen';
import ExerciseDetailScreen from '../screens/exercises/ExerciseDetailScreen';
import ExerciseFormScreen from '../screens/exercises/ExerciseFormScreen';
import PlansScreen from '../screens/plans/PlansScreen';
import PlanDetailScreen from '../screens/plans/PlanDetailScreen';
import PlanFormScreen from '../screens/plans/PlanFormScreen';
import WorkoutPlayerScreen from '../screens/workout/WorkoutPlayerScreen';
import PlannerScreen from '../screens/planner/PlannerScreen';
import SessionFormScreen from '../screens/planner/SessionFormScreen';
import LogsScreen from '../screens/logs/LogsScreen';
import LogDetailScreen from '../screens/logs/LogDetailScreen';
import LogFormScreen from '../screens/logs/LogFormScreen';
import CompareScreen from '../screens/logs/CompareScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'FitTrack' }} />
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Statistiche' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Obiettivi' }} />
      <Stack.Screen name="GoalForm" component={GoalFormScreen} options={{ title: 'Obiettivo' }} />
    </Stack.Navigator>
  );
}

function ExercisesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ExercisesList" component={ExercisesScreen} options={{ title: 'Esercizi' }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Dettaglio esercizio' }} />
      <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} options={{ title: 'Esercizio' }} />
    </Stack.Navigator>
  );
}

function PlansStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="PlansList" component={PlansScreen} options={{ title: 'Schede' }} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'Dettaglio scheda' }} />
      <Stack.Screen name="PlanForm" component={PlanFormScreen} options={{ title: 'Scheda' }} />
      <Stack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function PlannerStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Planner" component={PlannerScreen} options={{ title: 'Agenda' }} />
      <Stack.Screen name="SessionForm" component={SessionFormScreen} options={{ title: 'Sessione' }} />
    </Stack.Navigator>
  );
}

function LogsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="LogsList" component={LogsScreen} options={{ title: 'Diario' }} />
      <Stack.Screen name="LogDetail" component={LogDetailScreen} options={{ title: 'Allenamento' }} />
      <Stack.Screen name="LogForm" component={LogFormScreen} options={{ title: 'Registra allenamento' }} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{ title: 'Confronto' }} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  HomeTab: ['home', 'home-outline'],
  EserciziTab: ['barbell', 'barbell-outline'],
  SchedeTab: ['albums', 'albums-outline'],
  AgendaTab: ['calendar', 'calendar-outline'],
  DiarioTab: ['book', 'book-outline'],
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

// Deep linking: sul web ogni schermata ha un proprio percorso URL.
const linking = {
  prefixes: [],
  config: {
    screens: {
      HomeTab: {
        path: '',
        screens: { Home: '', Stats: 'statistiche', Goals: 'obiettivi', GoalForm: 'obiettivi/form' },
      },
      EserciziTab: {
        path: 'esercizi',
        screens: { ExercisesList: '', ExerciseDetail: 'dettaglio/:id', ExerciseForm: 'form' },
      },
      SchedeTab: {
        path: 'schede',
        screens: {
          PlansList: '',
          PlanDetail: 'dettaglio/:id',
          PlanForm: 'form',
          WorkoutPlayer: 'allenamento/:planId',
        },
      },
      AgendaTab: { path: 'agenda', screens: { Planner: '', SessionForm: 'sessione' } },
      DiarioTab: {
        path: 'diario',
        screens: { LogsList: '', LogDetail: 'dettaglio/:id', LogForm: 'form', Compare: 'confronto' },
      },
    },
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ focused, color, size }) => {
            const [filled, outline] = TAB_ICONS[route.name];
            return <Ionicons name={focused ? filled : outline} size={size - 2} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
        <Tab.Screen name="EserciziTab" component={ExercisesStack} options={{ title: 'Esercizi' }} />
        <Tab.Screen name="SchedeTab" component={PlansStack} options={{ title: 'Schede' }} />
        <Tab.Screen name="AgendaTab" component={PlannerStack} options={{ title: 'Agenda' }} />
        <Tab.Screen name="DiarioTab" component={LogsStack} options={{ title: 'Diario' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
