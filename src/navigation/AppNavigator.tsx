import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { DeviceListScreen } from '../screens/DeviceListScreen';
import { PermissionScreen } from '../screens/PermissionScreen';
import { RemoteScreen } from '../screens/RemoteScreen';
import { ScanningScreen } from '../screens/ScanningScreen';

export type RootStackParamList = {
  Permission: undefined;
  Scanning: undefined;
  DeviceList: undefined;
  Remote: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Permission"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#111111' }
        }}
      >
        <Stack.Screen name="Permission" component={PermissionScreen} />
        <Stack.Screen name="Scanning" component={ScanningScreen} />
        <Stack.Screen name="DeviceList" component={DeviceListScreen} />
        <Stack.Screen name="Remote" component={RemoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}