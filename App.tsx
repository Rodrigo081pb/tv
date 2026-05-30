import 'react-native-gesture-handler';

import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RemoteProvider } from './src/context/RemoteContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RemoteProvider>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </RemoteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}