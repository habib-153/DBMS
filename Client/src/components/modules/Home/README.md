# Home Page Modular Components

This directory contains the modular components for the homepage, following the design from the Crimewatch mockup.

## Component Structure

### 🏠 **HomePage** (`/app/(WithCommonLayout)/page.tsx`)

The main homepage that orchestrates all components in a clean layout:

- Uses CSS Grid for responsive layout
- Handles global state and API calls
- Passes data down to child components

### 🎯 **HeroSection** (`HeroSection.tsx`)

- Hero banner with "Stay Informed, Stay Safe" message
- Call-to-action buttons (Register/Login)
- Background image with overlay
- Responsive text sizing

### 📰 **RecentCrimeReports** (`RecentCrimeReports.tsx`)

- Displays recent 6 crime reports in card format
- Each card shows: image, title, description, author, date, location, status
- Loading skeletons for better UX
- "View All Reports" link to full posts page

### 🗺️ **CrimeHeatmap** (`CrimeHeatmap.tsx`)

- Placeholder for interactive crime map
- Legend showing crime density levels
- Ready for integration with mapping services (Google Maps, Mapbox)

### 🚨 **EmergencyContacts** (`EmergencyContacts.tsx`)

- List of emergency services (Police, Hospital, Fire Dept)
- Quick-dial buttons with phone numbers
- Emergency hotline 911 prominently displayed
- Contact cards with addresses

## Design Features

### 🎨 **Visual Design**

- Matches the Crimewatch mockup layout
- Clean card-based design
- Consistent spacing and typography
- Brand color integration (#A50034)

### 📱 **Responsive Layout**

```css
/* Desktop: 3-column grid */
grid-cols-1 lg:grid-cols-3

/* Main content takes 2 columns, sidebar takes 1 */
lg:col-span-2  /* RecentCrimeReports */
/* CrimeHeatmap + EmergencyContacts in sidebar */
```

### ⚡ **Performance**

- Lazy loading for images
- Skeleton loading states
- Minimal API calls (only recent posts)
- Component-level optimization

## Usage

```tsx
import {
  HeroSection,
  RecentCrimeReports,
  CrimeHeatmap,
  EmergencyContacts,
} from "@/src/components/modules/Home";

export default function HomePage() {
  return (
    <div>
      <HeroSection onRegisterClick={handleRegisterClick} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentCrimeReports posts={posts} isLoading={isLoading} />
        </div>
        <div className="space-y-6">
          <CrimeHeatmap />
          <EmergencyContacts />
        </div>
      </div>
    </div>
  );
}
```

## Customization

### 🎨 **Styling**

- All components use HeroUI/TailwindCSS
- Brand colors defined in `globals.css`
- Dark mode support included

### 🔧 **Data Sources**

- **Posts**: Fetched from `/posts` API endpoint
- **Emergency Contacts**: Static data (can be moved to API)
- **Heatmap**: Ready for map service integration

### 🚀 **Extensions**

1. **Real Heatmap**: Integrate Google Maps or Mapbox
2. **Dynamic Emergency Contacts**: Fetch from API based on location
3. **Weather Widget**: Add weather info to sidebar
4. **Statistics Cards**: Add crime statistics overview

## File Organization

```
src/components/modules/Home/
├── index.ts              # Export barrel
├── HeroSection.tsx       # Hero banner
├── RecentCrimeReports.tsx # Main content
├── CrimeHeatmap.tsx      # Map sidebar
└── EmergencyContacts.tsx # Emergency sidebar
```

This modular approach makes the codebase:

- ✅ **Maintainable**: Each component has single responsibility
- ✅ **Reusable**: Components can be used in other pages
- ✅ **Testable**: Each component can be unit tested
- ✅ **Scalable**: Easy to add new sections or modify existing ones
