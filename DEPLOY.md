# Deployment Guide: Blockchain Mastery Speedrun

Your application has been prepped for a production-grade deployment on Netlify. 

## 🚀 Quickest Deployment (Drag & Drop)

1.  Log in to [Netlify](https://app.netlify.com/).
2.  Go to the **"Sites"** tab.
3.  Drag the entire `Finals` folder onto the "Drag and drop your site folder here" area.
4.  **Done!** Netlify will deploy `index.html` automatically.

## 🛠️ Professional Deployment (Git)

1.  Push this project to a GitHub, GitLab, or Bitbucket repository.
2.  Log in to Netlify and click **"Add new site"** > **"Import an existing project"**.
3.  Select your repository.
4.  **Build Settings**:
    *   **Base directory**: (leave empty or use `.`)
    *   **Publish directory**: (leave empty or use `.`)
    *   **Build command**: (leave empty)
5.  Click **"Deploy"**.

## 📦 What We Added for "Finals Prep" Readiness

To ensure this app is robust for your exams, we added:

*   **`index.html`**: A production copy of `index2.html` (standard entry point).
*   **PWA Support (`manifest.json` & `sw.js`)**: You can now **install this app** on your phone or desktop. Updates work offline!
*   **SEO & Social Tags**: Added proper title, description, and Open Graph tags so links look good when shared.
*   **Offline Capability**: The app uses a Service Worker to cache questions, so you can study even without internet.
*   **Mobile Icon**: An SVG icon was created for the home screen installation.

## � How to Download & Use Offline

### Option A: The "Install" Button (Easiest)
1.  Open the site on your phone or computer.
2.  Look for the **"⬇️ Install App"** button at the top right.
3.  Tap it and follow the prompt to add to your home screen.

### Option B: Browser Menu
**On iPhone (iOS Safari):**
1.  Tap the "Share" button (square with arrow up).
2.  Scroll down and tap **"Add to Home Screen"**.

**On Android (Chrome):**
1.  Tap the three dots `⋮` menu.
2.  Tap **"Install app"** or **"Add to Home screen"**.

**Once installed**:
*   Turn off your WiFi/Data.
*   Open the app from your home screen.
*   **It works perfectly!** (Questions are cached automatically).

## �🔍 Verification

After deployment, open the link on your phone. You should see an "Add to Home Screen" prompt (or find it in the browser menu). The app will feel like a native mobile app.
