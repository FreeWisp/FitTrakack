import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/state/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

// Mostra la navigazione solo quando lo stato è stato caricato dallo storage.
function Gate() {
  const { state } = useApp();
  if (!state.hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <Gate />
      </AppProvider>
    </SafeAreaProvider>
  );
}
