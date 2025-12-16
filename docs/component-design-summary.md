# Component Design Summary

## Architecture Overview

The application is built on the Next.js App Router with nested routes and a component‑driven design to achieve clear separation of concerns and maintainable structure.

## Core Design Principles

### 1. URL‑Driven State Management
- Use Next.js dynamic route params (`[spaceId]`, `[projectId]`, `[libraryId]`) to reflect application state.
- URL changes automatically trigger page updates.
- Supports browser back/forward, bookmarks, and sharing.

### 2. Global State via Context API
- **AuthContext**: Centralizes user authentication state to avoid duplicating logic across components.
- **NavigationContext**: Automatically builds breadcrumbs from route params and exposes current route information.

### 3. Clear Component Responsibilities
- **Layout components**: Own page structure (Sidebar + TopBar).
- **Page components**: Own specific content rendering.
- **Business logic**: Lives in Context and service layers.

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── SupabaseProvider (database client)
├── AuthProvider (auth state)
└── NavigationProvider (navigation state)
    └── DashboardLayout (app/(dashboard)/layout.tsx)
        ├── Sidebar
        │   ├── UserProfile (user info)
        │   ├── ProjectsList (project list, clickable for navigation)
        │   └── LibrariesList (library list, clickable for navigation)
        └── MainContent
            ├── TopBar
            │   ├── Breadcrumb (auto‑generated, clickable)
            │   └── ActionButtons (action buttons)
            └── PageContent (dynamic content based on route)
                ├── SpacePage
                ├── ProjectPage
                └── LibraryPage
```

## Key Components

### DashboardLayout
**Location**: `src/components/layout/DashboardLayout.tsx`

**Responsibilities**:
- Provide a unified layout (Sidebar + TopBar + Content).
- Perform auth checks (render auth form when unauthenticated).
- Pull breadcrumb information from NavigationContext and pass it to TopBar.

**Characteristics**:
- Uses Context for state, avoiding prop drilling.
- Handles auth state transitions automatically.

### Sidebar
**Location**: `src/components/layout/Sidebar.tsx`

**Responsibilities**:
- Display user info (avatar, name).
- Display projects list (navigate to project page on click).
- Display libraries list (navigate to library page on click).
- Highlight the active project/library based on the current route.

**Interactions**:
- Click project: `router.push('/${spaceId}/${projectId}')`
- Click library: `router.push('/${spaceId}/${projectId}/${libraryId}')`
- Use `useNavigation()` to read current route and determine highlighting.

### TopBar
**Location**: `src/components/layout/TopBar.tsx`

**Responsibilities**:
- Display breadcrumb navigation (auto‑generated from NavigationContext).
- Provide action buttons (Share, More, Add).

**Interactions**:
- Clicking a breadcrumb item navigates to the corresponding path.
- The last breadcrumb item is not clickable (represents the current page).

### NavigationContext
**Location**: `src/lib/contexts/NavigationContext.tsx`

**Responsibilities**:
- Automatically generate breadcrumbs from Next.js route params.
- Provide current route information (`spaceId`, `projectId`, `libraryId`).

**Characteristics**:
- Entirely URL‑driven; no manual state management needed.
- Automatically reacts to route changes.

### AuthContext
**Location**: `src/lib/contexts/AuthContext.tsx`

**Responsibilities**:
- Manage user authentication state.
- Fetch user profile information.
- Provide sign‑out functionality.

**Characteristics**:
- Centralizes auth logic to avoid duplication.
- Automatically listens to Supabase auth state changes.

## Route Structure

```
app/
├── layout.tsx                    # Root layout (Providers)
├── page.tsx                      # Home (optional, redirect)
└── (dashboard)/                  # Route group for all authenticated pages
    ├── layout.tsx               # Dashboard layout
    ├── page.tsx                 # Default page (redirect)
    └── [spaceId]/               # Dynamic route: space
        ├── page.tsx            # Space detail page
        └── [projectId]/        # Dynamic route: project
            ├── page.tsx       # Project detail page
            └── [libraryId]/   # Dynamic route: library
                └── page.tsx  # Library detail page
```

## Data Flow

```
1. User clicks a project/library item in the Sidebar
   ↓
2. `router.push()` updates the URL
   ↓
3. Next.js Router updates route params
   ↓
4. NavigationContext detects route change and rebuilds breadcrumbs
   ↓
5. Page component reads route params and fetches data from Supabase
   ↓
6. Sidebar highlights the active item based on current route
   ↓
7. TopBar displays updated breadcrumbs
   ↓
8. Page content updates
```

## Advantages

1. **Maintainability**: Clear separation of component responsibilities; easy to understand and modify.
2. **Extensibility**: Easy to add new routes and pages.
3. **User Experience**: URL reflects application state and supports browser navigation.
4. **Code Reuse**: Context and layout components are reusable across multiple pages.
5. **Type Safety**: TypeScript provides full static type checking.

## Future Improvements

1. **Data Caching**: Use React Query or SWR to cache data.
2. **Loading States**: Add Suspense and loading indicators.
3. **Error Handling**: Introduce unified error boundaries and error handling patterns.
4. **Access Control**: Add permission checks at the routing layer.
5. **SEO**: Add metadata and structured data if SEO becomes a requirement.
