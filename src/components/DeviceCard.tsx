import { Cast, Monitor, RadioReceiver, Tv, Wifi } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '../theme';
import type { Manufacturer, SmartDevice } from '../types';

interface DeviceCardProps {
  device: SmartDevice;
  onPress?: () => void;
  disabled?: boolean;
}

const icons: Record<Manufacturer, LucideIcon> = {
  samsung: Tv,
  lg: Monitor,
  roku: Cast,
  philips: RadioReceiver,
  sony: Tv,
  generic: Wifi
};

export function DeviceCard({ device, onPress, disabled = false }: DeviceCardProps) {
  const Icon = icons[device.manufacturer];

  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, disabled && styles.disabled]}>
      <View style={styles.iconWrap}>
        <Icon color={colors.text} size={22} strokeWidth={2.2} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{device.ip} • {device.manufacturer.toUpperCase()}</Text>
      </View>
      <View style={[styles.statusDot, device.status === 'connected' && styles.connectedDot]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.button
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.button
  },
  disabled: {
    opacity: 0.62
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.button,
    borderWidth: 1,
    borderColor: colors.border
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0
  },
  meta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 0
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning
  },
  connectedDot: {
    backgroundColor: colors.success
  }
});