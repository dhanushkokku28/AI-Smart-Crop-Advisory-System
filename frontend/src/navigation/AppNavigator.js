import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/LanguageScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import RecommendedCropsScreen from '../screens/RecommendedCropsScreen';
import FindBestCropScreen from '../screens/FindBestCropScreen';
import WeatherScreen from '../screens/WeatherScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

const commonHeader = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '800' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={commonHeader}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Language" component={LanguageScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RecommendedCrops" component={RecommendedCropsScreen} options={{ title: 'Recommended Crops' }} />
        <Stack.Screen name="FindBestCrop" component={FindBestCropScreen} options={{ title: 'Find Best Crop' }} />
        <Stack.Screen name="Weather" component={WeatherScreen} options={{ title: 'Weather' }} />
        <Stack.Screen name="DiseaseDetection" component={DiseaseDetectionScreen} options={{ title: 'Disease Detection' }} />
        <Stack.Screen name="MarketPrices" component={MarketPricesScreen} options={{ title: 'Market Prices' }} />
        <Stack.Screen name="ProfileDetails" component={ProfileScreen} options={{ title: 'Farmer Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
