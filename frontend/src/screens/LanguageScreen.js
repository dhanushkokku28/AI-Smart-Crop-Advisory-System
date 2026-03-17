import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography } from '../styles/theme';

const LANGUAGES = ['Tamil', 'Hindi', 'English'];

export default function LanguageScreen({ navigation }) {
  const { setLanguage } = useApp();

  const onSelectLanguage = async (language) => {
    await setLanguage(language);
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Language</Text>
      <View style={styles.actions}>
        {LANGUAGES.map((language, index) => (
          <PrimaryButton
            key={language}
            label={language}
            onPress={() => onSelectLanguage(language)}
            style={[styles.button, { backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary }]}
          />
        ))}
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
  title: {
    ...typography.heading,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    paddingVertical: 16,
  },
});
