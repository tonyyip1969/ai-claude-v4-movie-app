'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsCache } from '@/lib/settingsCache';
import { SettingsMigration } from '@/lib/settingsMigration';

interface SettingsContextType {
  isGloballyLoaded: boolean;
  preloadError: string | null;
  cacheStats: ReturnType<typeof settingsCache.getCacheStats>;
  refreshCache: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Settings provider that preloads settings at the app level
 * This ensures settings are available immediately when components mount
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [isGloballyLoaded, setIsGloballyLoaded] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState(settingsCache.getCacheStats());

  // Preload settings when provider mounts
  useEffect(() => {
    const preloadSettings = async () => {
      try {
        // Check if cache is already ready
        if (settingsCache.isReady()) {
          setIsGloballyLoaded(true);
          setCacheStats(settingsCache.getCacheStats());
          return;
        }

        // Load settings into cache
        await settingsCache.loadIntoCache(async () => {
          const migrationResult = await SettingsMigration.performMigration();
          
          if (migrationResult.success) {
            if (migrationResult.migrated) {
              console.log('Settings preloaded and migrated successfully');
            }
            
            if (migrationResult.error) {
              console.warn('Settings preload warning:', migrationResult.error);
            }
            
            return migrationResult.settings;
          } else {
            throw new Error('Settings migration failed during preload');
          }
        });

        setIsGloballyLoaded(true);
        setPreloadError(null);
        setCacheStats(settingsCache.getCacheStats());
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Settings preload failed:', errorMessage);
        setPreloadError(errorMessage);
        setIsGloballyLoaded(true); // Still mark as loaded to prevent blocking
        setCacheStats(settingsCache.getCacheStats());
      }
    };

    preloadSettings();
  }, []);

  // Refresh cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(settingsCache.getCacheStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshCache = async () => {
    try {
      settingsCache.clearCache();
      await settingsCache.loadIntoCache(async () => {
        const migrationResult = await SettingsMigration.performMigration();
        if (migrationResult.success) {
          return migrationResult.settings;
        } else {
          throw new Error('Settings refresh failed');
        }
      });
      setPreloadError(null);
      setCacheStats(settingsCache.getCacheStats());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPreloadError(errorMessage);
      setCacheStats(settingsCache.getCacheStats());
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        isGloballyLoaded,
        preloadError,
        cacheStats,
        refreshCache,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings context
 */
export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}

/**
 * Hook to get cache statistics for debugging
 */
export function useSettingsCache() {
  const context = useContext(SettingsContext);
  return {
    cacheStats: context?.cacheStats || settingsCache.getCacheStats(),
    refreshCache: context?.refreshCache || (() => Promise.resolve()),
    isProviderActive: context !== undefined,
  };
}
