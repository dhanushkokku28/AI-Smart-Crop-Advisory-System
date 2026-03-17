import Constants from 'expo-constants';
import axios from 'axios';
import { Platform } from 'react-native';

const EXPO_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;
const FALLBACK_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : Platform.OS === 'web' ? 'http://localhost:8000' : 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: EXPO_BASE_URL || FALLBACK_BASE_URL,
  timeout: 12000,
});

const fallbackCrops = [
  {
    id: 'rice',
    name: 'Rice',
    yield: 'High',
    waterNeed: 'Medium',
    image:
      'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'maize',
    name: 'Maize',
    yield: 'Medium',
    waterNeed: 'Low',
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    yield: 'High',
    waterNeed: 'Low',
    image:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  },
];

function normalizeCropResponse(data) {
  const backendCrops = data?.recommended_crops;
  if (Array.isArray(backendCrops) && backendCrops.length > 0) {
    return backendCrops.map((crop, idx) => ({
      id: `${crop.name}-${idx}`,
      name: crop.name,
      yield: crop.expected_yield_level || (crop.confidence >= 0.7 ? 'High' : 'Average'),
      waterNeed: crop.suitable_season?.toLowerCase() === 'kharif' ? 'Medium' : 'Low',
      image: fallbackCrops[idx % fallbackCrops.length].image,
      confidence: crop.confidence,
      reason: crop.reason,
    }));
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

export async function sendOtp(mobileNumber) {
  return {
    success: true,
    otpSent: true,
    message: `OTP flow not available in backend yet for ${mobileNumber}.`,
  };
}

export async function registerFarmer(userData) {
  return {
    success: true,
    message: `Account created successfully for ${userData.mobileNumber}.`,
    user: userData,
  };
}

export async function getCropRecommendations() {
  const { data } = await api.post('/crop/recommend', {
    district: 'Ernakulam',
    season: 'Kharif',
    soil_type: 'Loamy',
    rainfall: 120,
    temperature: 29,
  });

  const crops = normalizeCropResponse(data);
  return crops.length > 0 ? crops : fallbackCrops;
}

export async function findBestCrop(payload) {
  const backendPayload = {
    district: payload.location || 'Ernakulam',
    season: payload.season,
    soil_type: payload.soilType,
    rainfall: 100,
    temperature: 28,
  };

  const { data } = await api.post('/crop/recommend', backendPayload);
  const crops = normalizeCropResponse(data);
  return crops.length > 0 ? crops : fallbackCrops;
}

export async function getWeatherToday({ lat = 10.8505, lon = 76.2711 } = {}) {
  const { data } = await api.get('/weather/advisory', {
    params: { lat, lon },
  });

  const rainy = String(data?.rainfall_forecast || '').toLowerCase().includes('rain');
  return {
    temperature: rainy ? 26 : 31,
    humidity: rainy ? 82 : 64,
    rainChance: rainy ? 72 : 24,
    advice: [data?.advisory || 'Check weather before irrigation'],
    condition: data?.rainfall_forecast || 'Unknown',
  };
}

export async function detectDisease({ imageUri, cropName = 'paddy' }) {
  const formData = new FormData();
  formData.append('crop_name', cropName);
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'crop-image.jpg',
  });

  const { data } = await api.post('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return {
    disease_name: data?.disease || 'Unknown disease',
    confidence: (data?.confidence || 0) * 100,
    treatment: data?.treatment || 'Consult agronomist',
    prevention: data?.prevention || '',
    severity: data?.severity || '',
  };
}

const trackedCrops = ['rice', 'maize', 'groundnut'];

export async function getMarketPrices() {
  const responses = await Promise.all(
    trackedCrops.map((crop) => api.get('/market/prices', { params: { crop } })),
  );

  return responses.map((response) => {
    const trendValue = String(response.data?.trend || '').toLowerCase() === 'rising' ? 4 : -3;
    return {
      crop: response.data?.crop,
      price: response.data?.price,
      trend: trendValue,
      market: response.data?.market,
      date: response.data?.date,
    };
  });
}

export async function getUserProfile() {
  return {
    name: 'Farmer Selvam',
    location: 'Coimbatore, Tamil Nadu',
    image:
      'https://images.unsplash.com/photo-1595433562696-4d9f4be33f41?auto=format&fit=crop&w=400&q=80',
  };
}

export default api;
