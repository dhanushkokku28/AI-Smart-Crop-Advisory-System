import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import MarketCard from '../components/MarketCard';
import { getMarketPrices } from '../services/api';
import { colors, spacing, typography } from '../styles/theme';

export default function MarketPricesScreen() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = useCallback(async () => {
    const data = await getMarketPrices();
    setPrices(data);
  }, []);

  useEffect(() => {
    fetchPrices().finally(() => setLoading(false));
  }, [fetchPrices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPrices();
    setRefreshing(false);
  }, [fetchPrices]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Today's Market Prices</Text>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      {prices.map((item) => (
        <MarketCard key={item.crop} item={item} />
      ))}
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
});
