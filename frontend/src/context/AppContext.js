import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LANGUAGE_KEY = 'app_language';
const USER_KEY = 'app_user';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguageState] = useState('English');
  const [user, setUserState] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadState = async () => {
      try {
        const [savedLanguage, savedUser] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (!mounted) {
          return;
        }

        if (savedLanguage) {
          setLanguageState(savedLanguage);
        }

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUserState(parsed);
          setIsGuest(Boolean(parsed?.isGuest));
        }
      } catch (error) {
        console.warn('Failed to restore app state', error);
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    loadState();

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  }, []);

  const setUser = useCallback(async (nextUser) => {
    setUserState(nextUser);
    setIsGuest(Boolean(nextUser?.isGuest));
    if (!nextUser) {
      await AsyncStorage.removeItem(USER_KEY);
      return;
    }

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(async () => {
    setUserState(null);
    setIsGuest(false);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      language,
      setLanguage,
      user,
      setUser,
      isGuest,
      logout,
    }),
    [isReady, language, setLanguage, user, setUser, isGuest, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
}
