## Tech Stack

Frontend-only stack for the current phase. Backend will be added later.

### Core Frontend
- **React**: `react`, `react-dom` (SPA UI)
- **TypeScript**: `typescript` (typed UI code)
- **Routing**: `react-router-dom`
- **UI Icons**: `lucide-react`
- **Styling**: Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`)

### PWA & Offline
- **Service Worker**: `workbox-webpack-plugin`, `workbox-window`
- **Offline Storage**: `localforage`
- **IndexedDB Helper**: `idb`

### Data Visualization
- **Charts**: `recharts`

### Internationalization
- **i18n**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`

### SEO & Meta
- **Document Head**: `react-helmet-async`

### Utilities
- **Dates**: `date-fns`
- **UUIDs**: `uuid`, `@types/uuid`

### Build & Tooling
- **App Scripts**: `react-scripts` (Create React App)
- **Testing**: `react-scripts test` (Jest via CRA)
- **Types**: `@types/react`, `@types/react-dom`, `@types/node`, `@types/jest`

### Deployment
- **Hosting**: Netlify (see `frontend/package.json` scripts)
