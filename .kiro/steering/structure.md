# Project Structure

## Root Directory
```
manage-front/
├── public/           # Static assets and HTML template
├── src/             # Source code
├── dist/            # Production build output
├── node_modules/    # Dependencies
└── config files     # Vue CLI, Babel, ESLint configs
```

## Source Code Organization (`src/`)

### Core Application Files
- `main.js` - Application entry point with Vue app initialization
- `App.vue` - Root component with Element Plus locale configuration

### Directory Structure
```
src/
├── api/             # API service layer
│   └── index.js     # Centralized API endpoints
├── assets/          # Static resources
│   ├── css/         # Global stylesheets
│   ├── img/         # Images and graphics
│   └── font_*/      # Custom fonts
├── components/      # Reusable Vue components
│   ├── Header.vue   # Top navigation bar
│   ├── Sidebar.vue  # Side navigation menu
│   └── Verify.vue   # Verification component
├── icons/           # SVG icon collections
│   ├── svg/         # Standard icons
│   └── svg-black/   # Dark theme icons
├── plugins/         # Vue plugin configurations
│   └── element.js   # Element Plus setup
├── router/          # Vue Router configuration
│   └── index.js     # Route definitions and guards
├── store/           # Vuex state management
│   └── index.js     # Global state store
├── utils/           # Utility functions and helpers
│   ├── auth.js      # Authentication utilities
│   ├── request.js   # HTTP request wrapper
│   ├── validate.js  # Form validation helpers
│   └── preventReClick.js # Anti-duplicate click directive
└── views/           # Page components
    ├── admin/       # Administrative pages
    ├── Login.vue    # Login page
    ├── 403.vue      # Access denied page
    └── 404.vue      # Page not found
```

## Naming Conventions
- **Components**: PascalCase (e.g., `Header.vue`, `Sidebar.vue`)
- **Views**: PascalCase for page components
- **Utils**: camelCase for JavaScript files
- **Assets**: lowercase with hyphens for CSS, descriptive names for images

## Module Organization
- **Feature-based grouping** in `views/admin/` directory
- **Shared components** in `components/` for reusability
- **Centralized utilities** in `utils/` for common functions
- **API layer separation** in `api/` directory

## Permission-Based Structure
Views are organized by permission codes (11-76):
- **11-15**: System management (users, roles, permissions)
- **21-26**: Community management (settings, residents, access)
- **31-35**: Daily operations (approvals, procurement)
- **41-49**: Vehicle management (reservations, records)
- **51-64**: Asset management (allocation, maintenance)
- **71-76**: Analytics and reporting

## Configuration Files
- `vue.config.js` - Vue CLI configuration with custom webpack settings
- `babel.config.js` - Babel transpilation settings
- `jsconfig.json` - JavaScript project configuration
- `package.json` - Dependencies and scripts