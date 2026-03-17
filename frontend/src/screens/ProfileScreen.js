import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { getUserProfile } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

const menuItems = [
  { icon: 'edit', label: 'Edit Profile' },
  { icon: 'language', label: 'Language Settings' },
  { icon: 'help-outline', label: 'Help & Support' },
];

export default function ProfileScreen({ navigation }) {
  const { language, user, logout } = useApp();
  const [profile, setProfile] = useState({
    name: user?.name || 'Farmer',
    location: 'Kerala',
    image:
      'https://images.unsplash.com/photo-1595433562696-4d9f4be33f41?auto=format&fit=crop&w=400&q=80',
  });

  useEffect(() => {
    getUserProfile().then((data) => setProfile((prev) => ({ ...prev, ...data })));
  }, []);

  const onLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Farmer Profile</Text>
      <View style={styles.profileCard}>
        <Image source={{ uri: profile.image }} style={styles.image} />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.location}>{profile.location}</Text>
        <Text style={styles.language}>Language: {language}</Text>
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item) => (
          <PrimaryButton
            key={item.label}
            label={item.label}
            variant="ghost"
            onPress={() => Alert.alert(item.label, 'Feature coming soon.')}
            style={styles.menuButton}
          />
        ))}
        <PrimaryButton label="Logout" onPress={onLogout} style={styles.logout} />
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
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  location: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  language: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontWeight: '700',
  },
  menuCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  menuButton: {
    marginBottom: spacing.sm,
  },
  logout: {
    marginTop: spacing.sm,
    backgroundColor: '#C62828',
  },
});
