import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import PrimaryButton from '../components/PrimaryButton';
import CropCard from '../components/CropCard';
import { findBestCrop } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy'];
const SEASONS = ['Kharif', 'Rabi'];

export default function FindBestCropScreen() {
  const [location, setLocation] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [season, setSeason] = useState('Kharif');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const detectLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow location access to continue.');
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    setLocation(`${current.coords.latitude.toFixed(4)}, ${current.coords.longitude.toFixed(4)}`);
  };

  const onRecommend = async () => {
    try {
      setLoading(true);
      const data = await findBestCrop({ location, soilType, season });
      setResults(data);
    } catch (error) {
      Alert.alert('Recommendation failed', error?.message || 'Unable to fetch recommendation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find Best Crop</Text>

      <Text style={styles.label}>Location</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Enter district or coordinates"
        placeholderTextColor="#7E9D88"
        style={styles.input}
      />
      <PrimaryButton label="Detect Location" onPress={detectLocation} variant="ghost" style={styles.detectButton} />

      <Text style={styles.label}>Soil Type</Text>
      <View style={styles.choiceRow}>
        {SOIL_TYPES.map((item) => (
          <PrimaryButton
            key={item}
            label={item}
            variant={soilType === item ? 'primary' : 'ghost'}
            onPress={() => setSoilType(item)}
            style={styles.choiceButton}
          />
        ))}
      </View>

      <Text style={styles.label}>Season</Text>
      <View style={styles.choiceRow}>
        {SEASONS.map((item) => (
          <PrimaryButton
            key={item}
            label={item}
            variant={season === item ? 'primary' : 'ghost'}
            onPress={() => setSeason(item)}
            style={styles.choiceButton}
          />
        ))}
      </View>

      <PrimaryButton label="Get Recommendation" onPress={onRecommend} loading={loading} style={styles.recommendButton} />

      <View style={styles.resultWrap}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
        {results.map((crop) => (
          <CropCard key={crop.id || crop.name} crop={crop} />
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
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#F9FFF4',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  detectButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  choiceButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  recommendButton: {
    marginTop: spacing.sm,
  },
  resultWrap: {
    marginTop: spacing.lg,
    backgroundColor: '#EEF9E8',
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
});
