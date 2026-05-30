import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { Radar } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeviceCard } from '../components/DeviceCard';
import { RemoteButton } from '../components/RemoteButton';
import { useRemoteContext } from '../context/RemoteContext';
import { useNetworkScan } from '../hooks/useNetworkScan';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme';

type Props = StackScreenProps<RootStackParamList, 'Scanning'>;

export function ScanningScreen({ navigation }: Props) {
  const { devices } = useRemoteContext();
  const { error, isScanning, localIp, startScan, subnet } = useNetworkScan();
  const radarScale = useSharedValue(0.72);
  const radarOpacity = useSharedValue(0.9);

  useEffect(() => {
    radarScale.value = withRepeat(withTiming(1.18, { duration: 1200 }), -1, false);
    radarOpacity.value = withRepeat(withTiming(0.16, { duration: 1200 }), -1, false);
  }, [radarOpacity, radarScale]);

  useFocusEffect(
    useCallback(() => {
      startScan();
    }, [startScan])
  );

  const radarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radarScale.value }],
    opacity: radarOpacity.value
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.radarWrap}>
          <Animated.View style={[styles.radarPulse, radarStyle]} />
          <Radar color={colors.success} size={58} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>Buscando TVs na sua rede...</Text>
        <Text style={styles.subtitle}>{subnet ? `Faixa ${subnet}.1 - ${subnet}.254` : localIp ? `IP local ${localIp}` : 'Preparando varredura local'}</Text>

        <View style={styles.list}>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </View>

        {!isScanning && devices.length === 0 ? <Text style={styles.empty}>{error ?? 'Nenhuma TV encontrada nesta varredura.'}</Text> : null}

        {!isScanning ? (
          <View style={styles.actions}>
            <RemoteButton label="Ver dispositivos" width={190} height={48} shape="pill" variant="inner" onPress={() => navigation.replace('DeviceList')} />
            <RemoteButton label="Buscar novamente" width={190} height={48} shape="pill" variant="default" onPress={startScan} textStyle={styles.secondaryText} />
          </View>
        ) : null}
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
    paddingVertical: 32
  },
  radarWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  radarPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: 'rgba(149, 227, 109, 0.08)'
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 22,
    letterSpacing: 0
  },
  list: {
    width: '100%',
    maxWidth: 360,
    gap: 12
  },
  empty: {
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
    letterSpacing: 0
  },
  actions: {
    gap: 12,
    alignItems: 'center',
    marginTop: 26
  },
  secondaryText: {
    color: colors.textSoft
  }
});