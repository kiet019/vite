# PowerShell deployment script for Windows

# Build the project
Write-Host "Building the project..." -ForegroundColor Green
npm run build

# Create .nojekyll file to prevent Jekyll processing
Write-Host "Creating .nojekyll file..." -ForegroundColor Green
New-Item -Path "dist/.nojekyll" -ItemType File -Force | Out-Null

# Deploy to GitHub Pages
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Green
npx gh-pages -d dist

Write-Host "Deployment complete!" -ForegroundColor Green
