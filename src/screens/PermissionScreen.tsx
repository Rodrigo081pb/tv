import type { StackScreenProps } from '@react-navigation/stack';
import { Wifi } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RemoteButton } from '../components/RemoteButton';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { requestNetworkAccess } from '../services/NetworkScanner';
import { colors } from '../theme';

type Props = StackScreenProps<RootStackParamList, 'Permission'>;

export function PermissionScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.12, { duration: 900 }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value
  }));

  const handlePermission = async () => {
    setLoading(true);
    await requestNetworkAccess().catch((error) => console.warn('Permissao de rede falhou:', error));
    setLoading(false);
    navigation.replace('Scanning');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.logo, animatedStyle]}>
          <Wifi color={colors.success} size={42} strokeWidth={2.4} />
        </Animated.View>
        <Text style={styles.title}>SmartRemote</Text>
        <Text style={styles.subtitle}>Permita o acesso a rede local para encontrar sua TV</Text>
        <RemoteButton
          label={loading ? undefined : 'Permitir e Buscar'}
          width={210}
          height={52}
          shape="pill"
          variant="inner"
          disabled={loading}
          onPress={handlePermission}
          textStyle={styles.buttonText}
        >
          {loading ? <ActivityIndicator color={colors.text} /> : null}
        </RemoteButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 12
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: 34
  },
  buttonText: {
    fontSize: 15
  }
});