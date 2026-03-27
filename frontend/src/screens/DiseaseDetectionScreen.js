import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { detectDisease, getDiseaseModelStatus } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

const CROP_OPTIONS = [
  { label: 'Rice', value: 'rice' },
  { label: 'Banana', value: 'banana' },
  { label: 'Pepper', value: 'pepper' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Coconut', value: 'coconut' },
];

function getSpeechLanguage(language) {
  const normalized = String(language || '').toLowerCase();
  if (normalized.includes('tamil')) {
    return 'ta-IN';
  }
  if (normalized.includes('hindi')) {
    return 'hi-IN';
  }
  return 'en-US';
}

export default function DiseaseDetectionScreen() {
  const { language } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [modelStatus, setModelStatus] = useState(null);

  const speechLanguage = useMemo(() => getSpeechLanguage(language), [language]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadModelStatus = async () => {
      try {
        const status = await getDiseaseModelStatus();
        if (active) {
          setModelStatus(status);
        }
      } catch (error) {
        if (active) {
          setModelStatus({
            model_name: 'Unavailable',
            model_source: 'unknown',
            model_version: '',
            training_data_available: false,
            supported_languages: [],
          });
        }
      }
    };

    loadModelStatus();
    return () => {
      active = false;
    };
  }, []);

  const openCamera = async () => {
    if (!permission?.granted) {
      const newPermission = await requestPermission();
      if (!newPermission.granted) {
        Alert.alert('Permission denied', 'Camera permission is required.');
        return;
      }
    }

    setCameraVisible(true);
  };

  const onUpload = async () => {
    const resultPicker = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!resultPicker.canceled) {
      setImageUri(resultPicker.assets[0].uri);
      setResult(null);
    }
  };

  const onDetect = async () => {
    if (!imageUri) {
      Alert.alert('No image', 'Please take or upload a crop image first.');
      return;
    }

    try {
      setLoading(true);
      const prediction = await detectDisease({ imageUri, cropName: selectedCrop, language });
      setResult(prediction);
    } catch (error) {
      Alert.alert('Detection failed', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakAdvice = () => {
    if (!result) {
      return;
    }

    const confidenceValue = Number.isFinite(result.confidence) ? Math.round(result.confidence) : null;
    const fertilizerText =
      result.fertilizers && result.fertilizers.length > 0
        ? `Recommended fertilizers: ${result.fertilizers.join('. ')}`
        : 'No specific fertilizer recommendation is available.';

    const message = [
      `Disease check for ${selectedCrop}.`,
      `Detected disease: ${result.disease_display_name || result.disease_name || result.disease || 'unknown'}.`,
      confidenceValue !== null ? `Confidence is ${confidenceValue} percent.` : '',
      `Treatment: ${result.treatment || 'Consult your local agronomist.'}`,
      `Prevention: ${result.prevention || 'Maintain field hygiene and regular monitoring.'}`,
      fertilizerText,
    ]
      .filter(Boolean)
      .join(' ');

    Speech.stop();
    Speech.speak(message, {
      language: speechLanguage,
      rate: 0.95,
      pitch: 1.0,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crop Disease Detection</Text>
      <Text style={styles.subtitle}>Choose crop type first for better diagnosis accuracy.</Text>

      {modelStatus ? (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Model Status</Text>
          <Text style={styles.statusLine}>Model: {modelStatus.model_name || 'Unknown'}</Text>
          <Text style={styles.statusLine}>Source: {modelStatus.model_source || 'runtime'}</Text>
          {modelStatus.model_version ? <Text style={styles.statusLine}>Version: {modelStatus.model_version}</Text> : null}
          <Text style={styles.statusLine}>
            Training Data: {modelStatus.training_data_available ? 'Available' : 'Not found'}
          </Text>
          {Array.isArray(modelStatus.supported_languages) && modelStatus.supported_languages.length > 0 ? (
            <Text style={styles.statusLine}>Supported Languages: {modelStatus.supported_languages.join(', ')}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.cropList}>
        {CROP_OPTIONS.map((crop) => {
          const selected = selectedCrop === crop.value;
          return (
            <TouchableOpacity
              key={crop.value}
              onPress={() => setSelectedCrop(crop.value)}
              style={[styles.cropChip, selected && styles.cropChipSelected]}
            >
              <Text style={[styles.cropChipText, selected && styles.cropChipTextSelected]}>{crop.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Take Photo" onPress={openCamera} />
        <PrimaryButton label="Upload Crop Image" onPress={onUpload} variant="ghost" style={styles.uploadButton} />
      </View>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

      <PrimaryButton label="Analyze Disease" onPress={onDetect} loading={loading} style={styles.detectButton} />

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Detection Result</Text>
          <Text style={styles.resultLine}>Disease Name: {result.disease_display_name || result.disease_name || result.disease}</Text>
          <Text style={styles.resultLine}>
            Confidence: {Number.isFinite(result.confidence) ? `${Math.round(result.confidence)}%` : 'Unknown'}
          </Text>
          <Text style={styles.resultLine}>Severity: {result.severity || 'unknown'}</Text>
          <Text style={styles.resultLine}>Recommended Treatment: {result.treatment || 'Consult local agronomist.'}</Text>
          <Text style={styles.resultLine}>Prevention: {result.prevention || 'Maintain hygiene and regular scouting.'}</Text>

          <Text style={styles.fertilizerTitle}>Fertilizers to Use</Text>
          {result.fertilizers && result.fertilizers.length > 0 ? (
            result.fertilizers.map((fertilizer, idx) => (
              <Text key={`${fertilizer}-${idx}`} style={styles.fertilizerLine}>
                - {fertilizer}
              </Text>
            ))
          ) : (
            <Text style={styles.fertilizerLine}>No specific fertilizer recommendation available.</Text>
          )}

          <Text style={styles.planTitle}>Dosage and Schedule</Text>
          {Array.isArray(result.fertilizer_plan) && result.fertilizer_plan.length > 0 ? (
            result.fertilizer_plan.map((item, idx) => (
              <View key={`${item.name || 'plan'}-${idx}`} style={styles.planCard}>
                <Text style={styles.planName}>{item.name || 'Fertilizer'}</Text>
                <Text style={styles.planLine}>Dosage: {item.dosage || 'As per label'}</Text>
                <Text style={styles.planLine}>Interval: Every {item.interval_days || 15} days</Text>
                <Text style={styles.planLine}>Method: {item.application_method || 'Apply in split doses'}</Text>
                {item.note ? <Text style={styles.planLine}>Note: {item.note}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={styles.planLine}>Detailed dosage plan not available. Follow local agronomist guidance.</Text>
          )}

          {(result.model_name || result.model_source) ? (
            <Text style={styles.modelMeta}>Model: {result.model_name || 'Unknown'} ({result.model_source || 'runtime'})</Text>
          ) : null}

          <PrimaryButton label="Tell Me Cure Advice" onPress={speakAdvice} variant="ghost" style={styles.speakButton} />
        </View>
      ) : null}

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
          <View style={styles.cameraFooter}>
            <TouchableOpacity onPress={() => setCameraVisible(false)} style={styles.cameraButton}>
              <MaterialCommunityIcons name="camera-off" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const photo = await ImagePicker.launchCameraAsync({ quality: 0.8 });
                if (!photo.canceled) {
                  setImageUri(photo.assets[0].uri);
                  setResult(null);
                }
                setCameraVisible(false);
              }}
              style={[styles.cameraButton, styles.cameraButtonCenter]}
            >
              <MaterialCommunityIcons name="camera" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statusTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusLine: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cropList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cropChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  cropChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropChipText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cropChipTextSelected: {
    color: '#fff',
  },
  actions: {
    gap: spacing.sm,
  },
  uploadButton: {
    marginTop: spacing.xs,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  detectButton: {
    marginTop: spacing.md,
  },
  resultCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
  resultTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  resultLine: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 2,
  },
  fertilizerTitle: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  fertilizerLine: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 2,
  },
  planTitle: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  planCard: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.sm,
    backgroundColor: '#F7FBF2',
  },
  planName: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  planLine: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 1,
  },
  modelMeta: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  speakButton: {
    marginTop: spacing.md,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 34,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cameraButtonCenter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
  },
});
