import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { registerFarmer } from '../services/api';
import { colors, radii, shadows, spacing, typography } from '../styles/theme';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useApp();

    const onRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Invalid Name', 'Please enter your full name.');
            return;
        }
        if (mobileNumber.trim().length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Invalid Location', 'Please enter your location (District/State).');
            return;
        }

        try {
            setLoading(true);
            await registerFarmer({
                name: name.trim(),
                mobileNumber: mobileNumber.trim(),
                location: location.trim(),
            });
            await setUser({
                mobileNumber: mobileNumber.trim(),
                name: name.trim(),
                location: location.trim(),
                isGuest: false,
            });
            navigation.replace('MainTabs');
        } catch (error) {
            Alert.alert('Registration Failed', error?.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get personalized crop advisory</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#7E9D88"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        keyboardType="phone-pad"
                        placeholder="Mobile Number"
                        placeholderTextColor="#7E9D88"
                        maxLength={10}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Location (District, State)"
                        placeholderTextColor="#7E9D88"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <PrimaryButton label="Create Account" onPress={onRegister} loading={loading} style={styles.registerButton} />

                    <PrimaryButton
                        label="Already have an account? Login"
                        onPress={() => navigation.navigate('Login')}
                        variant="ghost"
                        style={styles.loginButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        ...shadows.card,
    },
    title: {
        ...typography.heading,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textLight,
        marginBottom: spacing.lg,
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
    registerButton: {
        marginTop: spacing.sm,
    },
    loginButton: {
        marginTop: spacing.sm,
    },
});
