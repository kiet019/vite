#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Create .nojekyll file to prevent Jekyll processing
echo "Creating .nojekyll file..."
touch dist/.nojekyll

# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "Deployment complete!"
