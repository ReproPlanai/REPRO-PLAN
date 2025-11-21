/**
 * Logo Processing Script for REPRO PLAN
 * This script processes the logo image to create circular versions and generate favicon/icon sizes
 * 
 * Requirements: npm install sharp --save-dev
 * Usage: node scripts/process-logo.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp module not found. Please install it first:');
  console.error('  npm install sharp --save-dev');
  process.exit(1);
}

const logoPath = path.join(__dirname, '../src/assets/logos/REPRO Plan Logo.jpg');
const outputDir = path.join(__dirname, '../src/assets/logos');
const publicDir = path.join(__dirname, '../public');

// Ensure output directories exist
[outputDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function createCircularLogo(inputPath, outputPath, size) {
  try {
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Calculate the size for the circular crop (use the smaller dimension)
    const cropSize = Math.min(metadata.width, metadata.height);
    const left = Math.floor((metadata.width - cropSize) / 2);
    const top = Math.floor((metadata.height - cropSize) / 2);
    
    // Create a circular mask
    const svgMask = `
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `;
    
    // Process the image: resize, extract center square, apply circular mask, resize to target size
    await image
      .extract({ left, top, width: cropSize, height: cropSize })
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .composite([{
        input: Buffer.from(svgMask),
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Created ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error.message);
  }
}

async function createFavicon(inputPath, outputPath, size) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const cropSize = Math.min(metadata.width, metadata.height);
    const left = Math.floor((metadata.width - cropSize) / 2);
    const top = Math.floor((metadata.height - cropSize) / 2);
    
    const svgMask = `
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `;
    
    await image
      .extract({ left, top, width: cropSize, height: cropSize })
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .composite([{
        input: Buffer.from(svgMask),
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Created ${path.basename(outputPath)} (${size}x${size})`);
  } catch (error) {
    console.error(`Error creating favicon ${outputPath}:`, error.message);
  }
}

async function processLogo() {
  console.log('🎨 Processing REPRO PLAN Logo...\n');
  
  if (!fs.existsSync(logoPath)) {
    console.error(`Error: Logo file not found at ${logoPath}`);
    process.exit(1);
  }
  
  try {
    // Create circular logo versions for different sizes
    await createCircularLogo(logoPath, path.join(outputDir, 'logo-circular.png'), 512);
    await createCircularLogo(logoPath, path.join(outputDir, 'logo192.png'), 192);
    await createCircularLogo(logoPath, path.join(outputDir, 'logo512.png'), 512);
    await createCircularLogo(logoPath, path.join(outputDir, 'logo64.png'), 64);
    await createCircularLogo(logoPath, path.join(outputDir, 'logo32.png'), 32);
    await createCircularLogo(logoPath, path.join(outputDir, 'logo16.png'), 16);
    
    // Create favicon (16x16 for .ico)
    await createFavicon(logoPath, path.join(publicDir, 'favicon.png'), 32);
    
    // Copy logo files to public directory
    fs.copyFileSync(
      path.join(outputDir, 'logo192.png'),
      path.join(publicDir, 'logo192.png')
    );
    fs.copyFileSync(
      path.join(outputDir, 'logo512.png'),
      path.join(publicDir, 'logo512.png')
    );
    
    console.log('\n✅ Logo processing complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Convert favicon.png to favicon.ico using an online tool or:');
    console.log('      - Visit https://convertio.co/png-ico/');
    console.log('      - Upload public/favicon.png');
    console.log('      - Download and save as public/favicon.ico');
    console.log('   2. The logo files are ready to use in your components!');
    
  } catch (error) {
    console.error('Error processing logo:', error);
    process.exit(1);
  }
}

processLogo();

