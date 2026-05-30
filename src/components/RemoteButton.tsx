import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, shadows } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RemoteButtonProps {
  label?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  onPress?: () => void | Promise<void>;
  size?: number;
  width?: number;
  height?: number;
  shape?: 'circle' | 'pill' | 'rounded' | 'ghost';
  variant?: 'default' | 'inner' | 'netflix' | 'danger' | 'ghost';
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function RemoteButton({
  label,
  icon: Icon,
  children,
  onPress,
  size = 44,
  width,
  height,
  shape = 'circle',
  variant = 'default',
  iconSize = 20,
  iconColor = colors.text,
  disabled = false,
  style,
  textStyle
}: RemoteButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    await onPress?.();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={[
        styles.base,
        styles[shape],
        styles[variant],
        { width: width ?? size, height: height ?? size },
        disabled && styles.disabled,
        animatedStyle,
        style
      ]}
    >
      {Icon ? <Icon color={iconColor} size={iconSize} strokeWidth={2.2} /> : null}
      {label ? <Text style={[styles.label, textStyle]}>{label}</Text> : null}
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.button,
    ...shadows.button
  },
  circle: {
    borderRadius: 999
  },
  pill: {
    borderRadius: 999
  },
  rounded: {
    borderRadius: 8
  },
  ghost: {
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0
  },
  default: {
    backgroundColor: colors.button
  },
  inner: {
    backgroundColor: colors.buttonRaised
  },
  netflix: {
    backgroundColor: colors.netflix,
    borderColor: colors.netflix
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  disabled: {
    opacity: 0.46
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center'
  }
});