# Logo Processing Script

This script processes the REPRO PLAN logo image to create circular versions and generate favicon/icon sizes.

## Prerequisites

Install the required dependency:

```bash
npm install sharp --save-dev
```

## Usage

Run the script from the frontend directory:

```bash
cd frontend
node scripts/process-logo.js
```

## What it does

1. Reads the original logo from `src/assets/logos/REPRO Plan Logo.jpg`
2. Creates circular versions of the logo in multiple sizes:
   - `logo-circular.png` (512x512) - Main circular logo
   - `logo192.png` (192x192) - App icon
   - `logo512.png` (512x512) - Large app icon
   - `logo64.png`, `logo32.png`, `logo16.png` - Various sizes
3. Generates `favicon.png` (32x32) in the public directory
4. Copies logo files to the public directory for use in the app

## Next Steps

After running the script:

1. Convert `public/favicon.png` to `public/favicon.ico`:
   - Visit https://convertio.co/png-ico/ or similar tool
   - Upload `public/favicon.png`
   - Download and save as `public/favicon.ico`

2. The logo files are now ready to use in your components!

## Notes

- The script creates circular logos by applying a mask to the original image
- All logos are saved as PNG files for transparency support
- The original logo file is preserved and not modified

