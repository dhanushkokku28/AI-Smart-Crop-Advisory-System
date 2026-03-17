import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, shadows, spacing } from '../styles/theme';

export default function CropCard({ crop }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: crop.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{crop.name}</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name="chart-bar" size={16} color={colors.primary} />
          <Text style={styles.meta}>Yield: {crop.yield}</Text>
        </View>
        <View style={styles.row}>
          <MaterialCommunityIcons name="water" size={16} color={colors.secondary} />
          <Text style={styles.meta}>Water Need: {crop.waterNeed}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: 130,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  meta: {
    marginLeft: spacing.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
