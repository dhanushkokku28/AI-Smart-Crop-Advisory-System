import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../styles/theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Language');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.logoWrap}>
          <FontAwesome5 name="wheat-awn" size={56} color="#fff" />
        </View>
        <Text style={styles.title}>SMART CROP ADVISORY SYSTEM</Text>
        <Text style={styles.subtitle}>Smart Decisions for Better Farming</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(27, 67, 50, 0.3)',
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#E8F5E9',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  loader: {
    marginTop: 30,
  },
});
