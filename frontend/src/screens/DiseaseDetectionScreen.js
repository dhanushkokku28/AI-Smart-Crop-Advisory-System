import React, { useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { detectDisease } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

export default function DiseaseDetectionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
      const prediction = await detectDisease({ imageUri, cropName: 'paddy' });
      setResult(prediction);
    } catch (error) {
      Alert.alert('Detection failed', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crop Disease Detection</Text>

      <View style={styles.actions}>
        <PrimaryButton label="Take Photo" onPress={openCamera} />
        <PrimaryButton label="Upload Crop Image" onPress={onUpload} variant="ghost" style={styles.uploadButton} />
      </View>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

      <PrimaryButton label="Analyze Disease" onPress={onDetect} loading={loading} style={styles.detectButton} />

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Detection Result</Text>
          <Text style={styles.resultLine}>Disease Name: {result.disease_name || result.disease}</Text>
          <Text style={styles.resultLine}>Confidence: {Math.round(result.confidence || 90)}%</Text>
          <Text style={styles.resultLine}>Recommended Treatment: {result.treatment || 'Consult local agronomist.'}</Text>
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
    marginBottom: spacing.md,
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
