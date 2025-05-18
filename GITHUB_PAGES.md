# Deploying to GitHub Pages

This document provides detailed instructions for deploying the English-Vietnamese Translation Chatbot to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Node.js and npm installed

## Setup GitHub Repository

1. Create a new repository on GitHub named `language-chatbot`
2. Initialize your local repository and connect it to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/language-chatbot.git
git push -u origin main
```

## Deployment Options

### Option 1: Automatic Deployment with GitHub Actions

The repository is already configured with GitHub Actions for automatic deployment. When you push changes to the `main` branch, GitHub Actions will automatically build and deploy your application to GitHub Pages.

1. Push your changes to the `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. Go to your repository on GitHub, click on "Actions" to see the deployment progress
3. Once the workflow completes successfully, your site will be available at `https://your-username.github.io/language-chatbot/`

### Option 2: Manual Deployment with gh-pages

You can also manually deploy your application using the gh-pages package:

#### On Linux/macOS:

```bash
npm run predeploy
npm run deploy
```

#### On Windows:

```bash
npm run predeploy:win
npm run deploy
```

### Option 3: Manual Deployment with Custom Script

For more control over the deployment process, you can use the provided deployment scripts:

#### On Linux/macOS:

```bash
chmod +x deploy.sh
./deploy.sh
```

#### On Windows:

```powershell
powershell -File deploy.ps1
```

## Troubleshooting

If your deployment is not working:

1. Check if GitHub Pages is enabled in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages" section
   - Make sure the source is set to "Deploy from a branch" and the branch is set to "gh-pages"

2. Check if the gh-pages branch exists:
   - Go to your repository on GitHub
   - Click on the branch dropdown and see if "gh-pages" is listed
   - If not, you need to create it by running the deployment process

3. Check for build errors:
   - Look at the GitHub Actions logs for any errors
   - Try building the application locally with `npm run build` to see if there are any issues

4. Make sure your vite.config.js has the correct base path:
   - The base path should be set to `/language-chatbot/`

5. Ensure you have a .nojekyll file:
   - This file should be present in the root of your gh-pages branch
   - It tells GitHub Pages not to process your site with Jekyll

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [gh-pages npm package](https://www.npmjs.com/package/gh-pages)
