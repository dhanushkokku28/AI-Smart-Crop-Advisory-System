import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import CropCard from '../components/CropCard';
import { getCropRecommendations } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

function CropChart({ crops }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Crop Recommendation Chart</Text>
      {crops.map((crop, index) => {
        const score = crop.yield === 'High' ? 90 : crop.yield === 'Medium' ? 70 : 55;
        return (
          <View key={`${crop.name}-${index}`} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{crop.name}</Text>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${score}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function RecommendedCropsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [crops, setCrops] = useState([]);

  const fetchData = useCallback(async () => {
    const data = await getCropRecommendations();
    setCrops(data);
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const cardList = useMemo(() => crops.map((crop) => <CropCard key={crop.id || crop.name} crop={crop} />), [crops]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Recommended Crops</Text>
      <CropChart crops={crops} />
      {cardList}
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
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  chartTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chartRow: {
    marginTop: spacing.sm,
  },
  chartLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  track: {
    height: 10,
    backgroundColor: '#E5F3DD',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
});
