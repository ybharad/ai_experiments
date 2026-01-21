# How to Set Up Your Gemini API Key

## Step 1: Get Your API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (it will look like: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)

## Step 2: Add API Key to .env File

Open the `.env` file in the project directory and add your key:

```bash
# Edit this file
nano .env

# Or use any text editor to edit:
# /Users/yash/.gemini/antigravity/scratch/interview-prep-app/.env
```

Replace the empty value with your actual API key:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=dev-secret-key-for-testing
```

**IMPORTANT:** Make sure there are NO spaces around the = sign and NO quotes around the key.

## Step 3: Restart the Server

The Flask server should auto-reload, but if not:

1. Stop the server (Ctrl+C in the terminal)
2. Restart it: `./venv/bin/python app.py`

## Step 4: Test

1. Go to http://localhost:5001
2. Upload a resume PDF
3. Check the terminal logs - you should see:
   - "Generating questions for resume..."
   - "Calling Gemini API..."
   - "Successfully generated X project-specific questions"

If you see "WARNING: GEMINI_API_KEY is not configured", the key wasn't set correctly.

## Troubleshooting

**If you see generic questions:**
- Check that the API key is actually in the `.env` file (not `.env.example`)
- Make sure there are no extra spaces or quotes
- Verify the key is valid by testing at https://makersuite.google.com

**Check the logs:**
The terminal running the Flask server will show detailed logs about what's happening with the AI generation.
