import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    apiKey: '',
    model: 'gemini-2.5-pro-exp-03-25',
    interfaceLanguage: 'en',
    contextCaching: true,
    fontSize: 1,
    fontFamily: 'questrial',
    autoStopVoice: true
  });

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = await AsyncStorage.getItem('gemini_api_key') || '';
        const savedModel = await AsyncStorage.getItem('gemini_model') || 'gemini-2.5-pro-exp-03-25';
        const savedLanguage = await AsyncStorage.getItem('interface_language') || 'en';
        const savedCaching = await AsyncStorage.getItem('context_caching') !== 'false'; // Default to true if not set
        const savedFontSize = parseFloat(await AsyncStorage.getItem('font_size')) || 1; // Default to 1.0
        const savedFontFamily = await AsyncStorage.getItem('app_font_family') || 'questrial';
        const savedAutoStop = await AsyncStorage.getItem('voice_auto_stop') !== 'false'; // Default to true if not set

        setSettings({
          apiKey: savedApiKey,
          model: savedModel,
          interfaceLanguage: savedLanguage,
          contextCaching: savedCaching,
          fontSize: savedFontSize,
          fontFamily: savedFontFamily,
          autoStopVoice: savedAutoStop
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage
  const saveSettings = async (newSettings) => {
    try {
      // Update state
      setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));

      // Save to AsyncStorage
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('gemini_api_key', updatedSettings.apiKey);
      await AsyncStorage.setItem('gemini_model', updatedSettings.model);
      await AsyncStorage.setItem('interface_language', updatedSettings.interfaceLanguage);
      await AsyncStorage.setItem('context_caching', updatedSettings.contextCaching.toString());
      await AsyncStorage.setItem('font_size', updatedSettings.fontSize.toString());
      await AsyncStorage.setItem('app_font_family', updatedSettings.fontFamily);
      await AsyncStorage.setItem('voice_auto_stop', updatedSettings.autoStopVoice.toString());

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  // Get platform information
  const platformInfo = {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web'
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, platformInfo }}>
      {children}
    </SettingsContext.Provider>
  );
};
