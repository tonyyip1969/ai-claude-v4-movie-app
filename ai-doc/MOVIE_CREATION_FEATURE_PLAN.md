# Movie Creation Feature Implementation Plan

## 🎯 **Core Requirements**
1. **Reuse existing `MovieEditForm` UI component**
2. **Add a "Add Movie" button beside the search bar on the home page**
3. **Create a new route `/movie/new` for movie creation**
4. **Implement API endpoint for movie creation**
5. **Integrate with existing TanStack Query architecture**

## 🎯 **Specific Requirements Based on User Input**

1. **Default Values:**
   - Rating: 5 (middle value)
   - Published Date: Today's date
   
2. **Navigation After Creation:**
   - Stay on creation page with success message
   - Reset all form fields for next movie creation
   
3. **Validation Requirements:**
   - Movie code is required (not optional)

## 📋 **Implementation Phases**

### **Phase 1: Type Definitions Update**
**File: `src/types/movie.ts`**

Add `MovieCreatePayload` interface with specifications:
```typescript
export interface MovieCreatePayload {
  // Required fields
  title: string;
  code: string;        // REQUIRED per user request
  videoUrl: string;
  coverUrl: string;
  
  // Optional fields
  description?: string;
  publishedAt?: string; // Will default to today if not provided
  rating?: number;      // Will default to 5 if not provided
}
```

### **Phase 2: Database Layer Update**
**File: `src/lib/database.ts`**

Add `createMovie` method with defaults:
```typescript
createMovie(movieData: MovieCreatePayload): Movie {
  // Set defaults
  const rating = movieData.rating ?? 5;
  const publishedAt = movieData.publishedAt || new Date().toISOString().split('T')[0];
  
  // Validation - code is required
  if (!movieData.code?.trim()) {
    throw new Error('Movie code is required');
  }
  
  // Insert and return created movie
}
```

### **Phase 3: API Layer**
**File: `src/app/api/movies/route.ts`**

Add POST method to handle movie creation:
- Accept `MovieCreatePayload` in request body
- Validate request data
- Call `movieDB.createMovie()`
- Return created movie or error response
- Follow existing error handling patterns

### **Phase 4: Mutation Hooks**
**Files: `src/hooks/use-movie-mutations.ts` & `src/hooks/use-enhanced-movie-actions.ts`**

1. **Add `useCreateMovie` mutation hook**
   - Implement optimistic updates
   - Invalidate relevant query caches
   - Handle loading and error states
   - Follow existing mutation patterns

2. **Extend `useEnhancedMovieActions`**
   - Add `createMovie` action
   - Add `isMovieCreating` loading state
   - Add `createMovieError` error state

### **Phase 5: UI Components Update**
**File: `src/components/MovieEditForm.tsx`**

Make `MovieEditForm` reusable for creation:
1. **Support undefined movie prop** (for creation)
2. **Default form values** when movie is undefined:
   - rating: 5
   - publishedAt: today's date
   - All other fields: empty strings
3. **Form title**: "Create New Movie" vs "Edit Movie Details"
4. **Button text**: "Create Movie" vs "Save Changes"
5. **Reset form** after successful creation (in creation mode)

### **Phase 6: Routing**
**File: `src/app/movie/new/page.tsx`**

Create movie creation page:
- Similar structure to edit page but for creation
- Use `MovieEditForm` in creation mode
- Handle form submission with create mutation
- Stay on page with success message after creation
- Handle breadcrumbs and navigation

Key behaviors:
1. **Success handling**: Show success message and reset form
2. **Stay on page**: Don't navigate away after creation
3. **Breadcrumbs**: Movies / Create
4. **Cancel navigation**: Back to home page

### **Phase 7: Home Page Integration** ✅ **COMPLETED**
**File: `src/app/page.tsx`**

Add "Add Movie" button in section header (Section Header Integration approach):

**Implementation Details**:
1. **Navigation Function**: Added `handleCreateMovie` function using `router.push('/movie/new')`
2. **Button Integration**: Added responsive button in section header with Plus icon
3. **Layout**: Positioned in right side of flex container alongside pagination info
4. **Styling**: Primary color scheme with hover states and focus accessibility
5. **Responsive Design**: Full text on desktop ("Add Movie"), icon-only on mobile

**Key Code Changes**:
```tsx
// Navigation function
const handleCreateMovie = () => {
  router.push('/movie/new');
};

// Button implementation
<button
  onClick={handleCreateMovie}
  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
>
  <Plus className="w-5 h-5" />
  <span className="hidden sm:inline">Add Movie</span>
</button>
```

**Features Implemented**:
- ✅ Contextually perfect next to "Latest Movies"
- ✅ Always visible regardless of search state
- ✅ Natural content management action placement
- ✅ Responsive-friendly with existing flex layout
- ✅ Proper accessibility with focus states
- ✅ Seamless navigation to creation page

## 🔧 **Technical Specifications**

### **Database Schema Considerations**
- Leverage existing table structure
- Ensure `code` uniqueness validation
- Auto-generate `id` and `createdAt`
- Set default values for optional fields

### **Form Behavior**
- **Creation Mode:**
  - Default form values (rating: 5, publishedAt: today)
  - All required fields must be filled
  - Code uniqueness validation
  - "Create Movie" button
  
- **Edit Mode:**
  - Pre-populated with existing data
  - Only changed fields are sent in update
  - "Save Changes" button

### **Navigation Flow**
```
Home Page → [Add Movie Button] → /movie/new → [Create] → Success Message + Form Reset
                                              ↓ [Cancel]
                                           Back to Home
```

### **Cache Invalidation Strategy**
- Invalidate movie list queries after creation
- Invalidate movie counts
- Invalidate search results if applicable
- Follow existing patterns in `use-movie-mutations.ts`

## 🔧 **Specific Implementation Notes**

### **Form Behavior in Creation Mode**
```typescript
const defaultFormData = {
  title: '',
  description: '',
  code: '',
  publishedAt: new Date().toISOString().split('T')[0], // Today
  coverUrl: '',
  videoUrl: '',
  rating: 5 // Default rating
};
```

### **Success Flow**
1. User fills form and clicks "Create Movie"
2. Movie is created successfully
3. Success message appears: "Movie created successfully!"
4. Form resets to default values
5. User can immediately create another movie

### **Validation Rules**
- **Title**: Required, max 200 chars
- **Code**: Required, 3-20 chars, unique
- **Video URL**: Required, valid URL
- **Cover URL**: Required, valid URL
- **Description**: Optional, max 1000 chars
- **Published Date**: Optional, defaults to today, must be valid date
- **Rating**: Optional, defaults to 5, must be 1-10

## 🎨 **UI/UX Flow**

### **Creation Page Layout**
```
Header: [← Back] Movies / Create
Content: MovieEditForm (creation mode)
- Title: "Create New Movie"
- Button: "Create Movie"
- Success message area
- All fields with default values
```

### **Success Message Design**
- Green background with success icon
- Text: "Movie created successfully! You can create another movie."
- Auto-dismiss after 5 seconds
- Form fields reset to defaults

## 📝 **Implementation Status**

- [x] Phase 1: Type Definitions Update ✅ **COMPLETED**
- [x] Phase 2: Database Layer Update ✅ **COMPLETED**
- [x] Phase 3: API Layer ✅ **COMPLETED**
- [x] Phase 4: Mutation Hooks ✅ **COMPLETED**
- [x] Phase 5: UI Components Update ✅ **COMPLETED**
- [x] Phase 6: Routing ✅ **COMPLETED**
- [x] Phase 7: Home Page Integration ✅ **COMPLETED**

🎉 **ALL PHASES COMPLETED SUCCESSFULLY!**

## 📅 **Created**: July 26, 2025
## 🔄 **Last Updated**: July 26, 2025
