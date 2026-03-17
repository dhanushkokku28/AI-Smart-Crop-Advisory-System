import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, radii, shadows, spacing } from '../styles/theme';

function TrendBars({ trend = 0 }) {
  const bars = [1, 2, 3, 4, 5];
  const intensity = Math.min(5, Math.max(1, Math.abs(Math.round(trend))));

  return (
    <View style={styles.trendRow}>
      {bars.map((bar) => (
        <View
          key={bar}
          style={[
            styles.bar,
            {
              height: 6 + bar * 3,
              opacity: bar <= intensity ? 1 : 0.3,
              backgroundColor: trend >= 0 ? colors.primary : colors.danger,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function MarketCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <FontAwesome5 name="seedling" size={18} color={colors.primary} />
        <Text style={styles.crop}>{item.crop}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>Rs {item.price} / Quintal</Text>
        <TrendBars trend={item.trend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.card,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crop: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
});
