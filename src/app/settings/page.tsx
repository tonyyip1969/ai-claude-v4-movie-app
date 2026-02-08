'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, Grid, Sidebar, Eye, EyeOff, Timer } from 'lucide-react';
import { useSettings, SettingsData } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Update local settings when global settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Check if settings have changed from saved values
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(hasChanges);
  }, [localSettings, settings]);

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      updateSettings(localSettings);
      setTimeout(() => {
        setSaveStatus('saved');
        setHasChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('idle');
    }
  };

  const handleReset = () => {
    resetSettings();
    setSaveStatus('idle');
  };

  const updateLocalSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotalCards = () => {
    return localSettings.gridColumns * localSettings.gridRows;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            App{' '}
            <span className="bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
        </div>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Customize your movie browsing experience with personalized grid layout settings. 
          The number of movies displayed per page is automatically calculated based on your grid configuration.
        </p>
      </div>

      {/* Settings Form */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Display Preferences Setting */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Display Preferences</h3>
              <p className="text-gray-400 text-sm">Configure page header and visual elements</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-white font-medium">Show Page Headers</label>
                <p className="text-gray-400 text-sm">Display decorative headers with titles and descriptions on pages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={localSettings.showHeader}
                  onChange={(e) => updateLocalSetting('showHeader', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  localSettings.showHeader ? 'bg-emerald-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform ${
                    localSettings.showHeader ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {localSettings.showHeader ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <p className="text-sm text-gray-400">
                  Status: Page headers are {localSettings.showHeader ? 'visible' : 'hidden'}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                When disabled, pages will start directly with content, providing a more compact view. 
                This affects pages like Favorites, Watchlist, and other sections with decorative headers.
              </p>
            </div>
          </div>
        </div>


        {/* Random Discovery Setting */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-lg">
              <Timer className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Random Discovery</h3>
              <p className="text-gray-400 text-sm">Control automatic random movie loading behavior</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-white font-medium">Enable Auto Load</label>
                <p className="text-gray-400 text-sm">Automatically load the next random movie after a delay</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={localSettings.randomAutoLoadEnabled}
                  onChange={(e) => updateLocalSetting('randomAutoLoadEnabled', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  localSettings.randomAutoLoadEnabled ? 'bg-amber-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform ${
                    localSettings.randomAutoLoadEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Auto-load interval (seconds):</label>
                <span className="text-amber-400 font-semibold">{localSettings.randomAutoLoadIntervalSeconds}s</span>
              </div>

              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={localSettings.randomAutoLoadIntervalSeconds}
                onChange={(e) => updateLocalSetting('randomAutoLoadIntervalSeconds', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>3s</span>
                <span>15s</span>
                <span>30s</span>
                <span>45s</span>
                <span>60s</span>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">
                Status: Auto load is {localSettings.randomAutoLoadEnabled ? 'enabled' : 'disabled'}
              </p>
              <p className="text-xs text-gray-500">
                While enabled, the Random page will automatically fetch a new movie every {localSettings.randomAutoLoadIntervalSeconds} second{localSettings.randomAutoLoadIntervalSeconds === 1 ? '' : 's'}.
                You can still use the Space key shortcut or button for immediate refreshes.
              </p>
            </div>
          </div>
        </div>

        {/* Grid Layout Setting */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg">
              <Grid className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Grid Layout</h3>
              <p className="text-gray-400 text-sm">Configure rows and columns for movie grid display</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columns Setting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Columns:</label>
                <span className="text-purple-400 font-semibold">{localSettings.gridColumns}</span>
              </div>
              
              <input
                type="range"
                min="3"
                max="6"
                step="1"
                value={localSettings.gridColumns}
                onChange={(e) => updateLocalSetting('gridColumns', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>

            {/* Rows Setting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Rows:</label>
                <span className="text-purple-400 font-semibold">{localSettings.gridRows}</span>
              </div>
              
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={localSettings.gridRows}
                onChange={(e) => updateLocalSetting('gridRows', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>
          </div>

          {/* Grid Preview */}
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">Grid Preview ({localSettings.gridColumns} × {localSettings.gridRows}):</p>
            <div 
              className="grid gap-1"
              style={{ 
                gridTemplateColumns: `repeat(${localSettings.gridColumns}, 1fr)`,
                gridTemplateRows: `repeat(${localSettings.gridRows}, 1fr)`
              }}
            >
              {Array.from({ length: calculateTotalCards() }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[16/9] bg-gray-700 rounded text-xs flex items-center justify-center text-gray-400"
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total cards per page: {calculateTotalCards()} movies
            </p>
          </div>
        </div>

        {/* Sidebar Setting */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-500/20 rounded-lg">
              <Sidebar className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Sidebar</h3>
              <p className="text-gray-400 text-sm">Configure sidebar display preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-white font-medium">Collapse by Default</label>
                <p className="text-gray-400 text-sm">Start with sidebar collapsed on desktop</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={localSettings.sidebarCollapsed}
                  onChange={(e) => updateLocalSetting('sidebarCollapsed', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  localSettings.sidebarCollapsed ? 'bg-indigo-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform ${
                    localSettings.sidebarCollapsed ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">
                Status: {localSettings.sidebarCollapsed ? 'Collapsed' : 'Expanded'} by default
              </p>
              <p className="text-xs text-gray-500">
                This setting controls whether the sidebar starts collapsed when you visit the app. 
                You can always toggle it manually using the sidebar button.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === 'saving'}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'saved' ? 'Saved!' : 
               'Save Settings'}
            </span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border border-gray-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About Settings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                These settings control how movies are displayed throughout the app, page headers visibility, and sidebar behavior. 
                Changes are saved locally in your browser and will persist between sessions. 
                The number of movies per page is automatically calculated based on your grid layout (rows × columns).
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
