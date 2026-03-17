import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MenuGrid from '../components/MenuGrid';
import WeatherCard from '../components/WeatherCard';
import { useApp } from '../context/AppContext';
import { getWeatherToday } from '../services/api';
import { colors, spacing, typography } from '../styles/theme';

export default function DashboardScreen({ navigation }) {
  const { user } = useApp();
  const [weather, setWeather] = useState({
    temperature: 28,
    humidity: 70,
    rainChance: 35,
    condition: 'Light Rain',
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

  const gridItems = useMemo(
    () => [
      {
        title: 'Crop Advice',
        icon: 'sprout-outline',
        Icon: MaterialCommunityIcons,
        onPress: () => navigation.navigate('RecommendedCrops'),
      },
      {
        title: 'Weather',
        icon: 'weather-partly-rainy',
        Icon: MaterialCommunityIcons,
        onPress: () => navigation.navigate('Weather'),
      },
      {
        title: 'Soil Health',
        icon: 'map-marker-radius-outline',
        Icon: MaterialCommunityIcons,
        onPress: () => navigation.navigate('FindBestCrop'),
      },
      {
        title: 'Pest Alert',
        icon: 'ladybug',
        Icon: MaterialCommunityIcons,
        onPress: () => navigation.navigate('DiseaseDetection'),
      },
    ],
    [navigation],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Good Morning {user?.name || 'Farmer'}</Text>
      <WeatherCard weather={weather} />
      <Text style={styles.menuTitle}>Quick Access</Text>
      <MenuGrid items={gridItems} />
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
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  menuTitle: {
    ...typography.subheading,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
