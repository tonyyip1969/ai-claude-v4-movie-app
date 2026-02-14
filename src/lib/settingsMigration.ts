import { SettingsData } from '@/hooks/useSettings';

const STORAGE_KEY = 'movie-app-settings';

export interface MigrationResult {
  success: boolean;
  migrated: boolean;
  settings: SettingsData;
  error?: string;
}

export class SettingsMigration {
  private static defaultSettings: SettingsData = {
    gridColumns: 5,
    gridRows: 4,
    sidebarCollapsed: false,
    showHeader: true,
    randomAutoLoadEnabled: false,
    randomAutoLoadIntervalSeconds: 10,
    playHistoryLimit: 20,
  };

  /**
   * Check if localStorage has settings that need migration
   */
  static hasLocalStorageSettings(): boolean {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      return savedSettings !== null;
    } catch (error) {
      console.error('Error checking localStorage settings:', error);
      return false;
    }
  }

  /**
   * Load settings from localStorage
   */
  static loadFromLocalStorage(): SettingsData {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return this.defaultSettings;
  }

  /**
   * Check if database has any settings
   */
  static async hasDatabaseSettings(): Promise<boolean> {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        return false;
      }
      const settings = await response.json();
      
      // Check if any setting exists in the database
      return Object.keys(settings).length > 0;
    } catch (error) {
      console.error('Error checking database settings:', error);
      return false;
    }
  }

  /**
   * Migrate settings from localStorage to database
   */
  static async migrateToDatabase(settings: SettingsData): Promise<boolean> {
    try {
      const serialized = {
        gridColumns: settings.gridColumns.toString(),
        gridRows: settings.gridRows.toString(),
        sidebarCollapsed: settings.sidebarCollapsed.toString(),
        showHeader: settings.showHeader.toString(),
        randomAutoLoadEnabled: settings.randomAutoLoadEnabled.toString(),
        randomAutoLoadIntervalSeconds: settings.randomAutoLoadIntervalSeconds.toString(),
        playHistoryLimit: settings.playHistoryLimit.toString(),
      };

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serialized),
      });

      return response.ok;
    } catch (error) {
      console.error('Error migrating settings to database:', error);
      return false;
    }
  }

  /**
   * Clear localStorage settings after successful migration
   */
  static clearLocalStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('localStorage settings cleared after migration');
    } catch (error) {
      console.error('Error clearing localStorage settings:', error);
    }
  }

  /**
   * Perform complete migration process
   */
  static async performMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migrated: false,
      settings: this.defaultSettings,
    };

    try {
      // Step 1: Check if database already has settings
      const hasDbSettings = await this.hasDatabaseSettings();
      
      if (hasDbSettings) {
        // Database already has settings, load from there
        const response = await fetch('/api/settings');
        if (response.ok) {
          const rawSettings = await response.json();
          result.settings = this.parseSettings(rawSettings);
          result.success = true;
          return result;
        }
      }

      // Step 2: Check if localStorage has settings to migrate
      const hasLocalSettings = this.hasLocalStorageSettings();
      
      if (!hasLocalSettings) {
        // No settings anywhere, use defaults
        result.settings = this.defaultSettings;
        result.success = true;
        return result;
      }

      // Step 3: Load settings from localStorage
      const localSettings = this.loadFromLocalStorage();

      // Step 4: Migrate to database
      const migrationSuccess = await this.migrateToDatabase(localSettings);
      
      if (migrationSuccess) {
        // Step 5: Clear localStorage after successful migration
        this.clearLocalStorage();
        result.settings = localSettings;
        result.success = true;
        result.migrated = true;
        console.log('Settings successfully migrated from localStorage to database');
      } else {
        // Migration failed, keep localStorage as fallback
        result.settings = localSettings;
        result.success = true;
        result.error = 'Migration to database failed, using localStorage';
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Migration process failed:', errorMessage);
      
      // Final fallback: try to load from localStorage
      try {
        result.settings = this.loadFromLocalStorage();
        result.success = true;
        result.error = `Migration failed: ${errorMessage}`;
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';
        result.settings = this.defaultSettings;
        result.success = true;
        result.error = `Migration and fallback failed: ${errorMessage}, fallback: ${fallbackErrorMessage}`;
      }
      
      return result;
    }
  }

  /**
   * Parse settings from API response
   */
  private static parseSettings(rawSettings: Record<string, string>): SettingsData {
    const parsed: SettingsData = { ...this.defaultSettings };
    
    if (rawSettings.gridColumns) {
      const gridColumns = parseInt(rawSettings.gridColumns, 10);
      if (!isNaN(gridColumns) && gridColumns > 0) {
        parsed.gridColumns = gridColumns;
      }
    }
    
    if (rawSettings.gridRows) {
      const gridRows = parseInt(rawSettings.gridRows, 10);
      if (!isNaN(gridRows) && gridRows > 0) {
        parsed.gridRows = gridRows;
      }
    }
    
    if (rawSettings.sidebarCollapsed !== undefined) {
      parsed.sidebarCollapsed = rawSettings.sidebarCollapsed === 'true';
    }
    
    if (rawSettings.showHeader !== undefined) {
      parsed.showHeader = rawSettings.showHeader === 'true';
    }

    if (rawSettings.randomAutoLoadEnabled !== undefined) {
      parsed.randomAutoLoadEnabled = rawSettings.randomAutoLoadEnabled === 'true';
    }

    if (rawSettings.randomAutoLoadIntervalSeconds) {
      const randomAutoLoadIntervalSeconds = parseInt(rawSettings.randomAutoLoadIntervalSeconds, 10);
      if (!isNaN(randomAutoLoadIntervalSeconds) && randomAutoLoadIntervalSeconds > 0) {
        parsed.randomAutoLoadIntervalSeconds = randomAutoLoadIntervalSeconds;
      }
    }

    if (rawSettings.playHistoryLimit) {
      const playHistoryLimit = parseInt(rawSettings.playHistoryLimit, 10);
      if (!isNaN(playHistoryLimit) && playHistoryLimit > 0) {
        parsed.playHistoryLimit = playHistoryLimit;
      }
    }
    
    return parsed;
  }

  /**
   * Get migration status for debugging
   */
  static async getMigrationStatus(): Promise<{
    hasLocalStorage: boolean;
    hasDatabase: boolean;
    recommendMigration: boolean;
  }> {
    const hasLocalStorage = this.hasLocalStorageSettings();
    const hasDatabase = await this.hasDatabaseSettings();
    
    return {
      hasLocalStorage,
      hasDatabase,
      recommendMigration: hasLocalStorage && !hasDatabase,
    };
  }
}
