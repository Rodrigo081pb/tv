import type { StackScreenProps } from '@react-navigation/stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeviceCard } from '../components/DeviceCard';
import { RemoteButton } from '../components/RemoteButton';
import { useRemoteContext } from '../context/RemoteContext';
import { useRemoteController } from '../hooks/useRemoteController';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme';
import type { SmartDevice } from '../types';

type Props = StackScreenProps<RootStackParamList, 'DeviceList'>;

export function DeviceListScreen({ navigation }: Props) {
  const { devices } = useRemoteContext();
  const { connectToDevice } = useRemoteController();
  const [connectingIp, setConnectingIp] = useState<string | null>(null);

  const handleConnect = async (device: SmartDevice) => {
    setConnectingIp(device.ip);

    try {
      await connectToDevice(device);
      navigation.replace('Remote');
    } catch (error) {
      console.warn('Falha ao conectar:', error);
    } finally {
      setConnectingIp(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dispositivos encontrados</Text>
        <Text style={styles.subtitle}>Toque na TV para conectar</Text>

        <View style={styles.list}>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={connectingIp === device.ip ? { ...device, status: 'connecting' } : device} disabled={Boolean(connectingIp)} onPress={() => handleConnect(device)} />
          ))}
        </View>

        {devices.length === 0 ? <Text style={styles.empty}>Nenhum dispositivo listado ainda.</Text> : null}

        <RemoteButton label="Buscar novamente" width={190} height={48} shape="pill" variant="inner" onPress={() => navigation.replace('Scanning')} style={styles.rescan} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 34
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 24,
    fontSize: 14,
    letterSpacing: 0
  },
  list: {
    width: '100%',
    maxWidth: 380,
    gap: 12
  },
  empty: {
    color: colors.textSoft,
    marginTop: 24,
    letterSpacing: 0
  },
  rescan: {
    marginTop: 28
  }
});