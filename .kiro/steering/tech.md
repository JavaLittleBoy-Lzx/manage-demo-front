# Technology Stack

## Frontend Framework
- **Vue 3.2.14** with Composition API
- **Element Plus 1.1.0-beta.1** for UI components
- **Vue Router 4.0.11** for routing (Hash mode)
- **Vuex 4.0.2** for state management

## Build System & Tools
- **Vue CLI 4.5.0** for project scaffolding and build
- **Babel** for JavaScript transpilation
- **Sass 1.26.5** for CSS preprocessing
- **ESLint** with Vue 3 rules for code quality

## Key Libraries
- **axios 0.21.4** - HTTP client for API requests
- **element-plus** - Primary UI component library
- **vue-echarts 6.0.0** - Charts and data visualization
- **xlsx 0.16.0** - Excel file processing
- **qrcode.vue 3.3.3** - QR code generation
- **wangeditor 4.7.15** - Rich text editor
- **js-cookie 3.0.5** - Cookie management
- **svg-sprite-loader 6.0.11** - SVG icon handling

## Development Configuration
- **Port**: 9999 (development server)
- **Source Maps**: Enabled for debugging
- **Hot Reload**: Enabled
- **Proxy**: Configured for API calls (commented out)

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (runs on port 9999)
npm run serve

# Build for production
npm run build

# Run linting
npm run lint
```

### Code Style Rules
- ESLint configured with Vue 3 essential rules
- Console and debugger statements allowed in development
- No unused variables warnings disabled
- Tabs and irregular whitespace allowed

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ with limited support
- Mobile responsive design