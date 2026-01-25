# 🚀 Revised Launch Plan: Debugging Render Deployment

If you are seeing **502 Bad Gateway** or **Module Not Found** errors, it typically means Render is looking in the wrong folder or the app isn't connecting to the right network port.

Since your code lives in a subfolder (`interview-prep-app`), we need to be very specific with Render.

---

## 🛠 Step 1: Configure "Root Directory" (Critical)
Render defaults to running everything from the top folder. We must tell it to look inside your app folder.

1.  Go to your **[Render Dashboard](https://dashboard.render.com)**.
2.  Click on your **Web Service**.
3.  Click **Settings** on the left sidebar.
4.  Scroll down to the **Build & Deploy** section.
5.  Find the **Root Directory** field.
6.  Enter exactly: `interview-prep-app`
7.  Click **Save Changes**.

*(This ensures Render finds your `requirements.txt` and `app.py`)*

---

## 🛠 Step 2: Update Start Command
We need to make sure Render uses the command from your file, and not an old cached on.

1.  Stay in **Settings**.
2.  Scroll down to **Start Command**.
3.  **Clear this field completely** (make it blank).
    *   *Why?* We just updated your `Procfile` to use a special port binding (`--bind 0.0.0.0:$PORT`). If you have text in the settings box, Render ignores our fix.
4.  Click **Save Changes**.

---

## 🛠 Step 3: Verify Environment Variables
Ensure these are set in the **Environment** tab:

*   `PYTHON_VERSION`: `3.10.0` (Recommended to ensure compatibility)
*   `GEMINI_API_KEY`: ...
*   `ELEVENLABS_API_KEY`: ...
*   `DATABASE_URL`: (Your internal connection string)
*   `SECRET_KEY`: ...

---

## 🛠 Step 4: Redeploy
1.  Click **Manual Deploy** (top right).
2.  Select **Clear Build Cache & Deploy**.

---

## ❓ Troubleshooting
If it still fails, check the **Logs**:
*   **"ModuleNotFoundError: No module named 'app'"**: You skipped Step 1 (Root Directory).
*   **"Address already in use"** or **"Worker failed to boot"**: You skipped Step 2 (Start Command needs to be blank).
