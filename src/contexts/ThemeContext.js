import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
const lightTheme = {
  background: '#ffffff',
  text: '#000000',
  primary: '#4a5568',
  secondary: '#718096',
  accent: '#4299e1',
  error: '#e53e3e',
  border: '#e2e8f0',
  card: '#f7fafc',
  userMessage: '#ebf8ff',
  botMessage: '#f0fff4',
  disabled: '#cbd5e0',
  placeholder: '#a0aec0',
  statusBar: 'dark',
};

const darkTheme = {
  background: '#1a202c',
  text: '#f7fafc',
  primary: '#4a5568',
  secondary: '#a0aec0',
  accent: '#4299e1',
  error: '#fc8181',
  border: '#2d3748',
  card: '#2d3748',
  userMessage: '#2c5282',
  botMessage: '#276749',
  disabled: '#4a5568',
  placeholder: '#718096',
  statusBar: 'light',
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? darkTheme : lightTheme);

  // Load theme preference from AsyncStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme') || 'system';
        setThemeMode(savedTheme);
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Update theme when themeMode or device theme changes
  useEffect(() => {
    const newTheme = 
      themeMode === 'system' ? (deviceTheme === 'dark' ? darkTheme : lightTheme) :
      themeMode === 'dark' ? darkTheme : lightTheme;
    
    setTheme(newTheme);
  }, [themeMode, deviceTheme]);

  // Function to change theme
  const changeTheme = async (newThemeMode) => {
    try {
      setThemeMode(newThemeMode);
      await AsyncStorage.setItem('app_theme', newThemeMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
