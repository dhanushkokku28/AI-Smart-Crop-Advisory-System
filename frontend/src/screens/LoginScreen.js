import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { sendOtp } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

export default function LoginScreen({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useApp();

  const onSendOtp = async () => {
    if (mobileNumber.trim().length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid mobile number.');
      return;
    }

    try {
      setLoading(true);
      await sendOtp(mobileNumber.trim());
      await setUser({
        mobileNumber: mobileNumber.trim(),
        name: 'Farmer',
        isGuest: false,
      });
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('OTP Failed', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGuest = async () => {
    await setUser({ name: 'Guest Farmer', isGuest: true });
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=450&q=80',
          }}
          style={styles.avatar}
        />
        <Text style={styles.title}>Welcome Farmer</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Mobile Number"
          placeholderTextColor="#7E9D88"
          maxLength={10}
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
        <PrimaryButton label="Send OTP" onPress={onSendOtp} loading={loading} />
        <PrimaryButton label="Don't have an account? Sign Up" onPress={() => navigation.navigate('Signup')} variant="ghost" style={styles.guestButton} />
        <PrimaryButton label="Continue as Guest" onPress={onGuest} variant="ghost" style={styles.guestButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
    backgroundColor: '#F9FFF4',
  },
  guestButton: {
    marginTop: spacing.sm,
  },
});
