# REPRO PLAN v3.0 - Assets Directory

This directory contains all static assets (images, logos, icons) for the REPRO PLAN application.

## Directory Structure

```
assets/
├── images/          # General images and photos
├── logos/           # Brand logos and icons
└── index.ts         # Centralized asset exports
```

## Usage

Import assets from the centralized index file:

```typescript
import { Logo192, Logo512, Favicon } from '../assets';
```

## Brand Assets

### Logos
- `logo192.png` - 192x192px app icon
- `logo512.png` - 512x512px app icon
- `favicon.ico` - Browser favicon

### Brand Colors
- Primary Pink: `#de3673` (RGB: 222, 54, 115)
- Secondary Blue-Purple: `#5c67b6` (RGB: 92, 103, 182)
- Accent Light Lavender: `#edf0fd` (RGB: 237, 240, 253)

### Typography
- Primary Font: **Blinker**
  - Weights: Light (200), Regular (300), Semibold (600), Bold (700, 800)

## Adding New Assets

1. Place the asset file in the appropriate directory (`images/` or `logos/`)
2. Export it from `index.ts`:
   ```typescript
   export { default as AssetName } from './path/to/asset.png';
   ```
3. Import and use in your components:
   ```typescript
   import { AssetName } from '../assets';
   ```

