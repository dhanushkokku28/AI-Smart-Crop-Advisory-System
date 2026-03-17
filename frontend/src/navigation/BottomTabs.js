import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import RecommendedCropsScreen from '../screens/RecommendedCropsScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();

const iconMap = {
  Home: 'home-variant',
  Crops: 'sprout',
  Camera: 'camera',
  Market: 'finance',
  Profile: 'account-circle',
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7A9A7D',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#D6E9CB',
          height: 62,
          paddingBottom: 7,
          paddingTop: 5,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={iconMap[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Crops" component={RecommendedCropsScreen} />
      <Tab.Screen name="Camera" component={DiseaseDetectionScreen} />
      <Tab.Screen name="Market" component={MarketPricesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
