import type { StackScreenProps } from '@react-navigation/stack';
import { Grid3X3, Home, LogIn, Mic, Power, Undo2, Volume2, Wifi } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DPad } from '../components/DPad';
import { RemoteButton } from '../components/RemoteButton';
import { useRemoteContext } from '../context/RemoteContext';
import { useRemoteController } from '../hooks/useRemoteController';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors, shadows } from '../theme';
import type { RemoteCommand } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Remote'>;

export function RemoteScreen({ navigation }: Props) {
  const { selectedDevice } = useRemoteContext();
  const { sendCommand } = useRemoteController();

  useEffect(() => {
    if (!selectedDevice) {
      navigation.replace('DeviceList');
    }
  }, [navigation, selectedDevice]);

  const command = (value: RemoteCommand) => {
    sendCommand(value).catch((error) => console.warn('Falha silenciosa:', error));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedDevice?.name ?? 'SmartRemote'}</Text>
          <View style={styles.headerStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerMeta}>{selectedDevice?.ip}</Text>
          </View>
        </View>

        <View style={styles.remoteBody}>
          <View style={styles.topRow}>
            <RemoteButton icon={Power} size={42} iconColor={colors.textSoft} onPress={() => command('power')} />
            <Wifi color={colors.success} size={22} strokeWidth={2.4} />
            <RemoteButton icon={LogIn} size={42} iconColor={colors.textSoft} onPress={() => command('source')} />
          </View>

          <View style={styles.navigationRow}>
            <RemoteButton icon={Undo2} size={42} iconColor={colors.textSoft} onPress={() => command('back')} />
            <RemoteButton icon={Home} size={42} iconColor={colors.textSoft} onPress={() => command('home')} />
          </View>

          <View style={styles.pillRow}>
            <RemoteButton label="EXIT" width={48} height={22} shape="pill" variant="default" textStyle={styles.pillText} onPress={() => command('exit')} />
            <RemoteButton label="INFO" width={48} height={22} shape="pill" variant="default" textStyle={styles.pillText} onPress={() => command('info')} />
          </View>

          <View style={styles.dpadWrap}>
            <DPad onCommand={command} />
          </View>

          <View style={styles.controlRow}>
            <View style={styles.verticalControl}>
              <RemoteButton label="?" shape="ghost" variant="ghost" width={42} height={28} onPress={() => command('channel_up')} textStyle={styles.verticalGlyph} />
              <Text style={styles.verticalLabel}>ch</Text>
              <RemoteButton label="?" shape="ghost" variant="ghost" width={42} height={28} onPress={() => command('channel_down')} textStyle={styles.verticalGlyph} />
            </View>

            <RemoteButton icon={Grid3X3} size={42} variant="inner" iconColor={colors.textSoft} onPress={() => command('menu')} />

            <View style={styles.verticalControl}>
              <RemoteButton label="+" shape="ghost" variant="ghost" width={42} height={28} onPress={() => command('volume_up')} textStyle={styles.verticalGlyph} />
              <Volume2 color={colors.textSoft} size={17} strokeWidth={2.2} />
              <RemoteButton label="?" shape="ghost" variant="ghost" width={42} height={28} onPress={() => command('volume_down')} textStyle={styles.verticalGlyph} />
            </View>
          </View>

          <View style={styles.footerRow}>
            <RemoteButton icon={Mic} size={42} iconColor={colors.textSoft} onPress={() => command('microphone')} />
            <RemoteButton label="HDMI" width={50} height={38} shape="pill" variant="default" textStyle={styles.hdmiText} onPress={() => command('hdmi')} />
            <RemoteButton label="NETFLIX" size={50} variant="netflix" textStyle={styles.netflixText} onPress={() => command('netflix')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28
  },
  header: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 10
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success
  },
  headerMeta: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 0
  },
  remoteBody: {
    width: '100%',
    maxWidth: 280,
    minHeight: 520,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 22,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#232323',
    ...shadows.insetLike
  },
  topRow: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navigationRow: {
    width: '100%',
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pillRow: {
    width: '100%',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pillText: {
    color: colors.textSoft,
    fontSize: 9,
    fontWeight: '800'
  },
  dpadWrap: {
    marginTop: 8,
    marginBottom: 16
  },
  controlRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24
  },
  verticalControl: {
    width: 46,
    height: 92,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#242424',
    ...shadows.button
  },
  verticalGlyph: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '800'
  },
  verticalLabel: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0
  },
  footerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  hdmiText: {
    color: colors.textSoft,
    fontSize: 9,
    fontWeight: '800'
  },
  netflixText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900'
  }
});