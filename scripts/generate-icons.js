// Script to generate PWA icons and splash screens
// Run with: node scripts/generate-icons.js

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Create directories if they don't exist
const iconsDir = path.join('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Define icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Define splash screen sizes for iOS
const splashScreens = [
  { width: 640, height: 1136, name: 'splash-640x1136.png' }, // iPhone 5/SE
  { width: 750, height: 1334, name: 'splash-750x1334.png' }, // iPhone 6/7/8
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' }, // iPhone 6+/7+/8+
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' }, // iPad
];

// Function to generate icons using ImageMagick (requires ImageMagick to be installed)
function generateIcons() {
  console.log('Generating PWA icons...');

  try {
    // Check if ImageMagick is installed
    execSync('magick --version', { stdio: 'ignore' });

    // Generate icons
    iconSizes.forEach(size => {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      console.log(`Generating ${outputPath}`);

      // Use a solid color with text as a placeholder
      // In a real app, you would use your app logo as the source
      execSync(`magick -size ${size}x${size} canvas:#4285F4 -fill white -gravity center -pointsize ${size/4} -annotate 0 "EN-VI" ${outputPath}`);
    });

    // Generate splash screens
    splashScreens.forEach(screen => {
      const outputPath = path.join(iconsDir, screen.name);
      console.log(`Generating ${outputPath}`);

      // Create a splash screen with app name
      execSync(`magick -size ${screen.width}x${screen.height} canvas:linear-gradient(to bottom, #4285F4, #34A853) -fill white -gravity center -pointsize ${screen.width/10} -annotate 0 "Translator" ${outputPath}`);
    });

    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error.message);
    console.log('Please install ImageMagick or manually create the icon files.');

    // Create empty placeholder files if ImageMagick is not available
    iconSizes.forEach(size => {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, '');
        console.log(`Created empty placeholder: ${outputPath}`);
      }
    });

    splashScreens.forEach(screen => {
      const outputPath = path.join(iconsDir, screen.name);
      if (!fs.existsSync(outputPath)) {
        fs.writeFileSync(outputPath, '');
        console.log(`Created empty placeholder: ${outputPath}`);
      }
    });
  }
}

// Run the icon generation
generateIcons();
