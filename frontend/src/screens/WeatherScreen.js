import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import WeatherCard from '../components/WeatherCard';
import { getWeatherToday } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

export default function WeatherScreen() {
  const [weather, setWeather] = useState({
    temperature: 28,
    humidity: 70,
    rainChance: 35,
    condition: 'Light Rain',
    advice: ['Good day for irrigation', 'Avoid pesticide spraying'],
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = useCallback(async () => {
    const data = await getWeatherToday();
    setWeather((prev) => ({ ...prev, ...data }));
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWeather();
    setRefreshing(false);
  }, [fetchWeather]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Today's Weather</Text>
      <WeatherCard weather={weather} />
      <View style={styles.adviceCard}>
        <Text style={styles.adviceTitle}>Crop Advice</Text>
        {weather.advice?.map((item, index) => (
          <Text key={`${item}-${index}`} style={styles.adviceItem}>
            • {item}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  adviceCard: {
    marginTop: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  adviceTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  adviceItem: {
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 21,
  },
});
