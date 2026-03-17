import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, radii, shadows, spacing } from '../styles/theme';

export default function WeatherCard({ weather }) {
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [glow]);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.95 + glow.value * 0.05 }],
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.glowBubble, animatedGlow]} />
      <View style={styles.rowTop}>
        <Text style={styles.title}>Weather Today</Text>
        <Feather name="cloud-rain" size={22} color={colors.primary} />
      </View>
      <Text style={styles.temp}>{weather.temperature}°C | {weather.condition}</Text>
      <Text style={styles.meta}>Humidity: {weather.humidity}%</Text>
      <Text style={styles.meta}>Rain chance: {weather.rainChance}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: '#E8F5E9',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.card,
  },
  glowBubble: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 100,
    backgroundColor: 'rgba(102, 187, 106, 0.35)',
    top: -20,
    right: -20,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  temp: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  meta: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
