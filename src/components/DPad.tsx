import { StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '../theme';
import type { RemoteCommand } from '../types';
import { RemoteButton } from './RemoteButton';

interface DPadProps {
  onCommand: (command: RemoteCommand) => void | Promise<void>;
}

export function DPad({ onCommand }: DPadProps) {
  return (
    <View style={styles.outer}>
      <RemoteButton shape="ghost" variant="ghost" width={64} height={46} style={styles.up} onPress={() => onCommand('up')}>
        <Text style={styles.arrow}>?</Text>
      </RemoteButton>
      <RemoteButton shape="ghost" variant="ghost" width={64} height={46} style={styles.down} onPress={() => onCommand('down')}>
        <Text style={styles.arrow}>?</Text>
      </RemoteButton>
      <RemoteButton shape="ghost" variant="ghost" width={46} height={64} style={styles.left} onPress={() => onCommand('left')}>
        <Text style={styles.arrow}>?</Text>
      </RemoteButton>
      <RemoteButton shape="ghost" variant="ghost" width={46} height={64} style={styles.right} onPress={() => onCommand('right')}>
        <Text style={styles.arrow}>?</Text>
      </RemoteButton>
      <RemoteButton label="OK" size={82} variant="inner" textStyle={styles.okText} onPress={() => onCommand('ok')} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.control,
    borderWidth: 1,
    borderColor: '#202020',
    ...shadows.insetLike
  },
  up: {
    position: 'absolute',
    top: 2
  },
  down: {
    position: 'absolute',
    bottom: 2
  },
  left: {
    position: 'absolute',
    left: 2
  },
  right: {
    position: 'absolute',
    right: 2
  },
  arrow: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0
  },
  okText: {
    fontSize: 18,
    fontWeight: '500'
  }
});