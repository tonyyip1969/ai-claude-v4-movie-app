# Settings Migration Plan: localStorage to Database

## Overview
Migration plan to move user settings from localStorage to SQLite database with memory caching, automatic migration, and global scope.

## Current State
- Settings stored in localStorage using `useSettings` hook
- Settings: `gridColumns` (number), `gridRows` (number)
- Database: SQLite with `better-sqlite3`
- Single user application (no multi-user support needed)

## Requirements
- ✅ **Global Scope**: Settings are app-wide, not user-specific
- ✅ **Automatic Migration**: Migration occurs on first visit
- ✅ **Memory Cache**: Settings cached in memory for performance
- ✅ **Flat Structure**: Simple key-value pairs
- ✅ **Backward Compatible**: Graceful fallback to localStorage

## Implementation Plan

### Phase 1: Database Schema & Methods

#### 1.1 Settings Table Structure
```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 Database Methods (Add to `MovieDatabase` class)
- `getAllSettings()` - Get all settings as key-value pairs
- `setSetting(key, value)` - Set/update single setting
- `setSettings(settings)` - Bulk update settings
- `deleteSetting(key)` - Remove setting
- `clearSettings()` - Reset all settings

### Phase 2: API Routes

#### 2.1 Settings API Endpoint
**File**: `src/app/api/settings/route.ts`

**Methods**:
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings (single or bulk)
- `DELETE /api/settings` - Reset all settings

**Response Format**:
```json
{
  "gridColumns": "5",
  "gridRows": "4"
}
```

### Phase 3: Updated useSettings Hook

#### 3.1 Enhanced Hook Features
- **Memory Cache**: Settings cached in memory after first load
- **Automatic Migration**: Check localStorage on first visit, migrate to DB
- **Optimistic Updates**: Immediate UI updates, sync to DB in background
- **Error Handling**: Graceful fallback to localStorage if DB fails
- **Loading States**: Proper loading indicators

#### 3.2 Hook Interface (Unchanged)
```typescript
export interface SettingsData {
  gridColumns: number;
  gridRows: number;
}

// Hook returns same interface
return {
  settings,
  moviesPerPage,
  isLoaded,
  updateSettings,
  resetSettings,
};
```

### Phase 4: Migration Logic

#### 4.1 Migration Flow
```
1. Check if DB has settings
2. If empty, check localStorage
3. If localStorage has data, migrate to DB
4. Clear localStorage after successful migration
5. Cache settings in memory
```

#### 4.2 Migration Steps
1. **First Load**: Check database for existing settings
2. **Fallback Check**: If DB empty, check localStorage
3. **Migration**: Copy localStorage data to database
4. **Cleanup**: Remove localStorage data after successful migration
5. **Cache**: Store settings in memory for subsequent requests

### Phase 5: Memory Caching Strategy

#### 5.1 Cache Implementation
- Settings loaded once on app initialization
- Updates applied to cache immediately (optimistic updates)
- Background sync to database
- Cache invalidation on errors with fallback to localStorage

#### 5.2 Cache Flow
```
Load → DB → Memory Cache → UI
Update → Memory Cache → UI (immediate) → DB (background)
Error → Fallback to localStorage
```

## File Structure Changes

```
src/
├── lib/
│   └── database.ts (add settings methods)
├── app/api/
│   └── settings/
│       └── route.ts (new API endpoint)
└── hooks/
    └── useSettings.ts (updated hook)
```

## Technical Implementation Details

### Database Integration
- Extend existing `MovieDatabase` class
- Add settings table creation in `initializeDatabase()`
- Use JSON serialization for complex values
- Maintain type safety with TypeScript interfaces

### API Design
- RESTful endpoint design
- Error handling with proper HTTP status codes
- Request/response validation
- Consistent error messaging

### Hook Enhancement
- Maintain existing public API
- Add internal caching mechanism
- Implement optimistic updates
- Add proper loading states
- Enhanced error handling

## Migration Benefits

1. **Performance**: Memory cache eliminates repeated DB queries
2. **Reliability**: Automatic fallback if DB operations fail
3. **User Experience**: Seamless migration without user intervention
4. **Maintainability**: Simple flat structure easy to extend
5. **Consistency**: All app data in single database
6. **Type Safety**: Maintained TypeScript interfaces
7. **Scalability**: Easy to add new settings without code changes

## Risk Mitigation

1. **Database Failures**: Fallback to localStorage
2. **Migration Failures**: Graceful error handling, keep localStorage as backup
3. **Performance**: Memory caching prevents DB bottlenecks
4. **Data Loss**: Validate migration before clearing localStorage
5. **Backward Compatibility**: Maintain localStorage support during transition

## Testing Strategy

1. **Unit Tests**: Test database methods, API endpoints, hook functionality
2. **Integration Tests**: Test migration flow, error scenarios
3. **Edge Cases**: Empty settings, corrupted data, network failures
4. **Performance Tests**: Memory usage, cache efficiency

## Rollback Plan

1. **Immediate**: Revert to localStorage-only implementation
2. **Partial**: Keep database but disable migration
3. **Graceful**: Maintain dual storage during transition period

## Success Criteria

- [ ] Settings successfully migrated from localStorage to database
- [ ] Memory caching improves performance (no repeated DB queries)
- [ ] Hook maintains existing public API
- [ ] Graceful error handling and fallbacks
- [ ] No data loss during migration
- [ ] Consistent user experience across app restart
