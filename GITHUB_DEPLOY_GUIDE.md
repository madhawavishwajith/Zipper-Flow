# How to Host Your ZipperFlow Website on GitHub Pages

Since **ZipperFlow** is built using clean, static HTML, CSS, and JavaScript, it can be hosted **100% free** on **GitHub Pages** without setting up any servers or databases.

Below are **three different methods** to upload and host your website, starting with the simplest method that requires **no software installation**.

---

## Method 1: Uploading Directly in the Web Browser (Easiest & Simplest)

This method does not require installing any tools on your computer. You just drag and drop the files.

### Step 1: Create a GitHub Account
1. Open your browser and go to [github.com](https://github.com).
2. Sign up for a free account.

### Step 2: Create a New Repository (Repo)
1. Log in to GitHub.
2. In the top-right corner, click the **`+`** icon and select **New repository**.
3. Fill in the details:
   - **Repository name**: `zipperflow`
   - **Description** (optional): `Zipper Order Management System`
   - **Public**: Must be checked (Public repositories get free hosting).
   - Leave other options blank.
4. Click the green **Create repository** button.

### Step 3: Drag & Drop Your Files
1. You will see a setup page. Look for the sentence: *"Get started by creating a new file or **uploading an existing file**."*
2. Click the blue link **uploading an existing file**.
3. Open your computer file explorer to `C:\Users\user\.gemini\antigravity\scratch\zipperflow`.
4. Select all 3 main files:
   - `index.html`
   - `style.css`
   - `app.js`
5. Drag them and drop them into the box on the GitHub page in your browser.
6. Scroll down to the bottom, write a small description (like "Upload ZipperFlow system"), and click the green **Commit changes** button.

### Step 4: Turn on GitHub Pages (Hosting)
1. In your new repository on GitHub, click the **Settings** tab (it has a gear icon next to it in the top menu bar).
2. In the left-hand sidebar, scroll down to the **Code and automation** section and click on **Pages**.
3. Under the **Build and deployment** section:
   - Under **Source**, make sure it says **Deploy from a branch**.
   - Under **Branch**, change **None** to **`main`** (or `master`).
   - Leave the folder as `/ (root)`.
4. Click the **Save** button.
5. Wait 1-2 minutes. Refresh the page, and you will see a banner at the top of the settings page:
   > 🚀 **Your site is live at** `https://your-username.github.io/zipperflow/`
6. Click that link to open your live website from any phone, tablet, or computer!

---

## Method 2: Using GitHub Desktop (Visual App)

If you plan on making frequent changes to the text or prices, GitHub Desktop is a free app that makes syncing files very simple.

1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Open the app and log in with your GitHub account.
3. Click **File** -> **New Repository**.
4. Name it `zipperflow`, set the path to where you want it on your computer, and create it.
5. Copy the `index.html`, `style.css`, and `app.js` from `C:\Users\user\.gemini\antigravity\scratch\zipperflow` into the folder GitHub Desktop just created.
6. The app will automatically show the added files.
7. Write a title (e.g. "Initial release") in the bottom left, click **Commit to main**, and then click **Publish repository** at the top.
8. Go to your repository on GitHub.com and follow **Step 4** of Method 1 to turn on GitHub Pages.

---

## Method 3: Using the Command Line (For Developers)

If you have Git installed in your terminal, you can run these commands in the project folder:

```bash
# Initialize a new git repo
git init

# Add all files
git add index.html style.css app.js GITHUB_DEPLOY_GUIDE.md

# Commit
git commit -m "Initialize ZipperFlow website & dashboard"

# Rename branch to main
git branch -M main

# Connect to your GitHub repository (replace with your username)
git remote add origin https://github.com/your-username/zipperflow.git

# Push the files
git push -u origin main
```

After pushing, follow **Step 4** of Method 1 in the GitHub web interface to enable Pages.
