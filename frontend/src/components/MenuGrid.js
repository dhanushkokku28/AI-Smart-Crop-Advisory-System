import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radii, shadows, spacing } from '../styles/theme';

export default function MenuGrid({ items }) {
  return (
    <View style={styles.grid}>
      {items.map((item, index) => (
        <Animated.View
          entering={FadeInDown.delay(index * 100).duration(450)}
          key={item.title}
          style={styles.gridItem}
        >
          <Pressable onPress={item.onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <item.Icon name={item.icon} size={26} color={colors.primary} />
            <Text style={styles.title}>{item.title}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    minHeight: 118,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    ...shadows.card,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
