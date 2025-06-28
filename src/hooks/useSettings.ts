'use client';

import { useState, useEffect } from 'react';

export interface SettingsData {
  gridColumns: number;
  gridRows: number;
}

const defaultSettings: SettingsData = {
  gridColumns: 5,
  gridRows: 4,
};

const STORAGE_KEY = 'movie-app-settings';

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const moviesPerPage = settings.gridColumns * settings.gridRows;

  return {
    settings,
    moviesPerPage,
    isLoaded,
    updateSettings,
    resetSettings,
  };
}
