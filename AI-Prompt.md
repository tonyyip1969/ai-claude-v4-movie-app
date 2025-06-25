# Modern Movie Web Application - Development Prompt

Create a comprehensive full-stack movie web application using Next.js with server-side rendering, featuring a Netflix/YouTube-inspired dark theme design with modern UI/UX principles.

## 🎯 Project Overview

Build a responsive movie browsing platform that displays movies in an elegant card-based layout with video playback capabilities, search functionality, and favorites management. The application should prioritize user experience with smooth animations, intuitive navigation, and a visually appealing dark theme.

## 🎨 Design Requirements

### Visual Design
- **Dark Theme**: Deep dark backgrounds (#0f0f0f, #1a1a1a) with subtle gradients
- **Accent Colors**: Purple to blue gradients (#8b5cf6 to #3b82f6)
- **Modern Typography**: Clean, hierarchical text with excellent readability
- **Card Design**: Elevated shadows, rounded corners, smooth hover transitions
- **Micro-interactions**: Subtle animations for buttons, cards, and navigation elements
- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop

### UI Components
- **Movie Cards**: 
  - Elegant hover effects with scale and shadow transformations
  - Overlay gradients for text readability
  - Smooth transition animations (300ms)
- **Navigation**: 
  - Collapsible sidebar with smooth slide animations
  - Clean pagination controls with modern styling
- **Video Player**: 
  - Custom controls with dark theme
  - Loading states and error handling
  - Fullscreen capabilities

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: TailwindCSS 3+ with custom dark theme configuration
- **State Management**: React hooks (useState, useEffect, useContext)
- **Video Player**: HTML5 video element with HLS.js for M3U8 support
- **Icons**: Lucide React or Heroicons
- **Animations**: Framer Motion or CSS transitions

### Backend Stack
- **Database**: SQLite with better-sqlite3
- **API Routes**: Next.js API routes for server-side logic
- **Data Fetching**: Server components and API calls
- **File Structure**: Organized components, pages, and utilities

## 📊 Database Schema

### Movie Table
```sql
CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    videoUrl TEXT NOT NULL,
    coverUrl TEXT NOT NULL,
    isFavourite BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK(rating >= 1 AND rating <= 10),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    publishedAt DATETIME
);
```

## 🎬 Feature Specifications

### Application Header
- **Brand**: "Movie App" with modern logo/typography
- **Theme**: Dark gradient background with subtle border
- **Responsive**: Collapsible on mobile devices

### Sidebar Navigation
- **Home**: Latest 20 movies in 4x5 grid layout
- **Favourites**: Favorite movies in 4x5 grid layout
- **Random**: Random movie selection feature
- **Collapsible**: Smooth slide-in/out animation
- **Active States**: Visual indicators for current page

### Movie Card Components
Display the following information with elegant styling:
- **Cover Image**: High-quality poster with lazy loading
- **Title**: Truncated with ellipsis for long titles
- **Rating**: Star rating or numerical display (1-10)
- **Favorite Status**: Heart icon with toggle functionality
- **Hover Effects**: Scale, shadow, and overlay animations

### Movie Detail Page
- **Layout**: Hero section with movie poster and details
- **Information Display**:
  - Title, description, rating, publish date
  - Favorite toggle button
  - Play button with prominent styling
- **Video Player**: 
  - Support for MP4 and M3U8 formats
  - Custom dark-themed controls
  - Responsive aspect ratio
- **Navigation**: Back button to previous page

### Search Functionality
- **Search Bar**: Prominent placement in header or body
- **Real-time Search**: Debounced search with loading states
- **Results Display**: Same card layout as main pages
- **No Results State**: Elegant empty state design

### Pagination System
- **Controls**: First, Previous, Next, Last buttons
- **Styling**: Modern button design with hover states
- **Logic**: Server-side pagination with proper state management
- **Responsive**: Mobile-friendly pagination controls

## 🎯 User Experience Features

### Interactive Elements
- **Smooth Transitions**: 300ms ease-in-out for all interactions
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error messages with retry options
- **Accessibility**: ARIA labels, keyboard navigation, focus management

### Performance Optimizations
- **Image Optimization**: Next.js Image component with proper sizing
- **Code Splitting**: Dynamic imports for video player components
- **Caching**: Proper cache headers for API responses
- **SEO**: Meta tags and structured data for movie pages

## 🛠️ Implementation Guidelines

### Project Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── movie/[id]/page.tsx
│   └── api/
├── components/
│   ├── ui/
│   ├── MovieCard.tsx
│   ├── VideoPlayer.tsx
│   ├── Sidebar.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── database.ts
│   └── utils.ts
└── types/
    └── movie.ts
```

### Styling Guidelines
- Use TailwindCSS utility classes for rapid development
- Create custom components for reusable UI elements
- Implement dark theme with CSS custom properties
- Use responsive design patterns (sm:, md:, lg:, xl:)

### Data Management
- Implement proper TypeScript interfaces for type safety
- Use server components for initial data loading
- Implement client-side state management for interactivity
- Handle loading and error states gracefully

## 🎲 Sample Data Generation

Create 100 dummy movies with realistic data:
- **Titles**: Mix of popular movie naming conventions
- **Descriptions**: Engaging movie plot summaries (100-300 words)
- **Cover URLs**: High-quality movie poster placeholders
- **Video URLs**: Mix of MP4 and M3U8 format examples
- **Ratings**: Random ratings between 1-10
- **Dates**: Realistic creation and publish dates
- **Codes**: Unique identifiers (e.g., "MOV001", "MOV002")

## 🎨 Color Palette

### Primary Colors
- **Background**: #0f0f0f (main), #1a1a1a (secondary)
- **Cards**: #262626 with subtle transparency
- **Text**: #ffffff (primary), #a1a1aa (secondary)
- **Accents**: #8b5cf6 to #3b82f6 (gradient)
- **Success**: #10b981 (favorites)
- **Warning**: #f59e0b (ratings)

### Interactive States
- **Hover**: Subtle color shifts and shadows
- **Active**: Pressed states with color changes
- **Focus**: Visible focus rings for accessibility
- **Disabled**: Muted colors and reduced opacity

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px (1 column layout)
- **Tablet**: 768px - 1024px (2-3 columns)
- **Desktop**: 1024px+ (4-5 columns as specified)
- **Large Desktop**: 1440px+ (maintain 5 columns max)

## 🚀 Development Priorities

1. **Database Setup**: SQLite schema and seeding
2. **Basic Layout**: Header, sidebar, and main content areas
3. **Movie Cards**: Display and basic interactivity
4. **Navigation**: Sidebar and pagination functionality
5. **Movie Details**: Individual movie pages
6. **Video Player**: MP4 and M3U8 support
7. **Search**: Real-time search implementation
8. **Favorites**: Toggle and display functionality
9. **Polish**: Animations, loading states, error handling
10. **Testing**: Responsive design and cross-browser compatibility

## 🎯 Success Criteria

The completed application should demonstrate:
- **Visual Excellence**: Modern, professional dark theme design
- **Smooth Performance**: Fast loading and responsive interactions
- **Full Functionality**: All specified features working correctly
- **Code Quality**: Clean, maintainable, and well-structured code
- **User Experience**: Intuitive navigation and engaging interactions
- **Responsive Design**: Perfect display across all device sizes

---

**Note**: Focus on creating a production-ready application that showcases modern web development best practices while maintaining the Netflix/YouTube-inspired aesthetic with smooth, professional interactions throughout the user journey.