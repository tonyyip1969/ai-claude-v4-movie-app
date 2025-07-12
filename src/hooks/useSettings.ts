'use client';

import { useState, useEffect, useCallback } from 'react';
import { SettingsMigration } from '@/lib/settingsMigration';
import { settingsCache } from '@/lib/settingsCache';

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

  // Helper function to serialize settings for API
  const serializeSettings = useCallback((settingsData: SettingsData): Record<string, string> => {
    return {
      gridColumns: settingsData.gridColumns.toString(),
      gridRows: settingsData.gridRows.toString(),
    };
  }, []);

  // Save settings to database via API
  const saveSettingsToAPI = useCallback(async (settingsData: SettingsData): Promise<void> => {
    const serialized = serializeSettings(settingsData);
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serialized),
    });
    if (!response.ok) {
      throw new Error(`Failed to save settings: ${response.status}`);
    }
  }, [serializeSettings]);

  // Load settings with migration and caching
  const loadSettings = useCallback(async (): Promise<SettingsData> => {
    // Use cache manager to prevent duplicate loading
    return settingsCache.loadIntoCache(async () => {
      try {
        // Use the dedicated migration utility
        const migrationResult = await SettingsMigration.performMigration();
        
        if (migrationResult.success) {
          if (migrationResult.migrated) {
            console.log('Settings migration completed successfully');
          }
          
          if (migrationResult.error) {
            console.warn('Migration warning:', migrationResult.error);
          }
          
          return migrationResult.settings;
        } else {
          throw new Error('Migration failed');
        }
      } catch (error) {
        console.error('Error during settings migration:', error);
        
        // Fallback to localStorage
        try {
          const savedSettings = localStorage.getItem(STORAGE_KEY);
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            return { ...defaultSettings, ...parsed };
          }
        } catch (localError) {
          console.error('Error loading settings from localStorage fallback:', localError);
        }
        
        // Final fallback to defaults
        return defaultSettings;
      }
    });
  }, []);

  // Load settings on mount
  useEffect(() => {
    // Check if cache is already ready
    if (settingsCache.isReady()) {
      setSettings(settingsCache.getSettings());
      setIsLoaded(true);
      return;
    }

    // Load settings with caching
    loadSettings().then(loadedSettings => {
      setSettings(loadedSettings);
      setIsLoaded(true);
    }).catch(error => {
      console.error('Failed to load settings:', error);
      // Use cache fallback or defaults
      const fallbackSettings = settingsCache.getSettings();
      setSettings(fallbackSettings);
      setIsLoaded(true);
    });
  }, [loadSettings]);

  const updateSettings = useCallback((newSettings: Partial<SettingsData>) => {
    // Optimistic update - update cache and UI immediately
    const updated = settingsCache.updateCache(newSettings);
    setSettings(updated);
    
    // Save to database in background
    saveSettingsToAPI(updated).catch(error => {
      console.error('Error saving settings to database:', error);
      
      // Invalidate cache on error
      settingsCache.invalidate();
      
      // Fallback to localStorage on error
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log('Settings saved to localStorage fallback');
      } catch (localError) {
        console.error('Error saving settings to localStorage fallback:', localError);
      }
    });
  }, [saveSettingsToAPI]);

  const resetSettings = useCallback(async () => {
    // Optimistic update - update cache and UI immediately
    settingsCache.resetCache();
    setSettings(defaultSettings);
    
    try {
      // Clear database settings
      const response = await fetch('/api/settings', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to reset settings: ${response.status}`);
      }
    } catch (error) {
      console.error('Error resetting settings in database:', error);
      
      // Invalidate cache on error
      settingsCache.invalidate();
      
      // Fallback to localStorage cleanup
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Settings cleared from localStorage fallback');
      } catch (localError) {
        console.error('Error clearing localStorage fallback:', localError);
      }
    }
  }, []);

  const moviesPerPage = settings.gridColumns * settings.gridRows;

  return {
    settings,
    moviesPerPage,
    isLoaded,
    updateSettings,
    resetSettings,
  };
}
