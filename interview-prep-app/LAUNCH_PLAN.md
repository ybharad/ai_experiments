# 🚀 Launch Plan: AI Interview Prep App

This guide outlines the most cost-effective path to launching your application ("productionizing") so it is accessible to users over the internet.

## 📋 Requirements
To go live, we need:
1.  **Code Hosting**: A place to store your code (GitHub).
2.  **App Hosting**: A server to run the Python/Flask code 24/7.
3.  **Database**: A production-grade database (PostgreSQL) instead of the local file-based SQLite.
4.  **API Keys**: Secure production keys for Google Gemini and ElevenLabs.

---

## 💰 Cost Analysis (The "Thrifty" Route)

We can launch this app for **Free** to **$5/month** using modern cloud platforms.

### Option 1: The "Hobbyist" Stack (Recommended for Startups/Portfolios)
*   **Platform**: **Render.com** (Best balance of free usage and ease of use)
*   **Web Service**: **Free** (Spins down after 15 mins of inactivity, spins up in 30s) or **$7/month** (Always on).
*   **Database**: **Free** (PostgreSQL on Render, 90 days validity then reset) or use **Supabase** (Free Tier forever).
*   **Storage**: **Free** (Ephemeral filesystem is fine for temp uploads; if you want to keep resumes forever, you need AWS S3, but for this app's current logic, ephemeral is fine).

**Total Estimated Output**: **$0/month** (Initial Launch) -> **$7/month** (if you want it fast/always-on).

### Operating Costs (APIs)
*   **Google Gemini**: Free tier available (rate limited). Pay-as-you-go is very cheap for text.
*   **ElevenLabs**: Free tier gives ~10 mins audio/month.
    *   *Upgrade*: Creator tier is ~$22/month if you get popular.
    *   *Usage*: This is your main cost driver if users scale up.

---

## 🛠 Step-by-Step Launch Guide

### Phase 1: Preparation (Done Locally)
I have already updated your code environment for production:
1.  Created a `Procfile` (tells the server how to run the app).
2.  Updated `requirements.txt` with production server tools (`gunicorn`, `gevent`).

### Phase 2: Git Setup
1.  Create a repository on **GitHub**.
2.  Push your code to the repository:
    ```bash
    git init
    git add .
    git commit -m "Initial launch commit"
    # Follow GitHub instructions to push
    git remote add origin <your-github-url>
    git push -u origin main
    ```

### Phase 3: Deploy on Render (Free)
1.  Sign up at [dashboard.render.com](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Name**: `ai-interview-prep`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn -k flask_sock.workers.GeventWebSocketWorker -w 1 app:app` (Plan typically auto-detects this from Procfile).
5.  **Environment Variables** (Crucial!):
    *   Add `GEMINI_API_KEY`: Paste your key.
    *   Add `ELEVENLABS_API_KEY`: Paste your key.
    *   Add `SECRET_KEY`: Generate a random string (e.g., `openssl rand -hex 32`).
    *   Add `DATABASE_URL`: *See Phase 4*.

### Phase 4: Database Setup (PostgreSQL)
1.  On Render Dashboard, Click **New +** -> **PostgreSQL**.
2.  Name it (e.g., `interview-db`), keep it on the **Free** tier.
3.  Once created, copy the `Internal Database URL`.
4.  Go back to your **Web Service** -> **Environment** settings.
5.  Add/Edit the `DATABASE_URL` variable and paste the connection string.
    *   *Note*: In `config.py`, we need to ensure the app reads this URL. (I will verify this for you next).

### Phase 5: Go Live! 🚀
1.  Click **Deploy**.
2.  Render will install dependencies and start the server.
3.  Your app will be live at `https://ai-interview-prep.onrender.com` (automatically HTTPS secured!).

---

## ⚠️ Important Considerations
1.  **Database Persistence**: In the free tier of some platforms, databases might pause or reset. For true production, consider a managed DB service like **Supabase** (Free Tier is excellent) or Neon.tech.
2.  **File Storage**: Currently, the app saves PDFs/Audio to the local `uploads/` folder. On simplified cloud hosting (like Render/Heroku), the filesystem is **ephemeral**. This means if the server restarts (which it does daily), **all uploaded files disappear**.
    *   *Fix*: For a real product, we should integrate **AWS S3** or **Google Cloud Storage** to save files permanently.
    *   *For MVP*: It is fine, as the database saves the *text* content of the resume and the answers. The actual PDF file is less critical after extraction.

## Next Steps for You
1.  Push code to GitHub.
2.  Create Render account.
3.  Connect and Deploy!
