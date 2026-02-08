import { SettingsData } from '@/hooks/useSettings';

/**
 * Global settings cache manager
 * Provides centralized memory caching for app settings
 */
class SettingsCache {
  private cache: SettingsData | null = null;
  private isInitialized = false;
  private isLoading = false;
  private loadPromise: Promise<SettingsData> | null = null;

  private readonly defaultSettings: SettingsData = {
    gridColumns: 5,
    gridRows: 4,
    sidebarCollapsed: false,
    showHeader: true,
    randomAutoLoadEnabled: false,
    randomAutoLoadIntervalSeconds: 10,
  };

  /**
   * Check if cache is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.cache !== null;
  }

  /**
   * Check if cache is currently loading
   */
  isLoadingCache(): boolean {
    return this.isLoading;
  }

  /**
   * Get cached settings (returns null if not cached)
   */
  getCached(): SettingsData | null {
    return this.cache;
  }

  /**
   * Get settings with fallback to defaults
   */
  getSettings(): SettingsData {
    return this.cache || this.defaultSettings;
  }

  /**
   * Set cache with new settings
   */
  setCache(settings: SettingsData): void {
    this.cache = { ...settings };
    this.isInitialized = true;
    console.log('Settings cache updated:', this.cache);
  }

  /**
   * Update specific settings in cache
   */
  updateCache(partialSettings: Partial<SettingsData>): SettingsData {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...partialSettings };
    this.setCache(updatedSettings);
    return updatedSettings;
  }

  /**
   * Reset cache to defaults
   */
  resetCache(): void {
    this.cache = { ...this.defaultSettings };
    this.isInitialized = true;
    console.log('Settings cache reset to defaults');
  }

  /**
   * Clear cache completely
   */
  clearCache(): void {
    this.cache = null;
    this.isInitialized = false;
    this.isLoading = false;
    this.loadPromise = null;
    console.log('Settings cache cleared');
  }

  /**
   * Load settings into cache (prevents duplicate loading)
   */
  async loadIntoCache(loadFunction: () => Promise<SettingsData>): Promise<SettingsData> {
    // Return cached data if available
    if (this.isReady()) {
      return this.cache!;
    }

    // Return existing load promise if already loading
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = loadFunction().then(
      (settings) => {
        this.setCache(settings);
        this.isLoading = false;
        this.loadPromise = null;
        return settings;
      },
      (error) => {
        this.isLoading = false;
        this.loadPromise = null;
        throw error;
      }
    );

    return this.loadPromise;
  }

  /**
   * Invalidate cache on error
   */
  invalidate(): void {
    if (this.isInitialized) {
      console.warn('Settings cache invalidated due to error');
      this.clearCache();
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    isInitialized: boolean;
    isLoading: boolean;
    hasData: boolean;
    currentSettings: SettingsData;
    cacheSize: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      hasData: this.cache !== null,
      currentSettings: this.getSettings(),
      cacheSize: this.cache ? JSON.stringify(this.cache).length : 0,
    };
  }

  /**
   * Preload cache with settings
   */
  preload(settings: SettingsData): void {
    if (!this.isInitialized) {
      this.setCache(settings);
    }
  }
}

// Export singleton instance
export const settingsCache = new SettingsCache();

// Export type for external use
export type { SettingsData };
