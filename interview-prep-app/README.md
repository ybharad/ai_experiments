# AI Interview Prep App

An AI-powered interview preparation application that generates personalized behavioral interview questions based on your resume.

## Features

- 📄 **Resume Upload**: Drag-and-drop PDF resume upload
- 🤖 **AI-Powered**: Uses Google Gemini AI to generate tailored questions
- 💾 **Database Storage**: SQLite database for storing resumes and questions
- 🎨 **Modern UI**: Premium dark theme with glassmorphism effects
- 📱 **Responsive**: Works on all devices

## Setup Instructions

### 1. Install Dependencies

```bash
cd interview-prep-app
pip install -r requirements.txt
```

### 2. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
GEMINI_API_KEY=your_actual_api_key_here
SECRET_KEY=your_secret_key_here
```

### 4. Run the Application

```bash
python app.py
```

The app will be available at: **http://localhost:5000**

## Usage

1. Open your browser to `http://localhost:5000`
2. Upload your resume (PDF format)
3. Wait for AI to generate personalized interview questions
4. Practice your responses to the behavioral questions

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite (free, serverless)
- **AI**: Google Gemini Pro (free tier available)
- **Frontend**: HTML, CSS, JavaScript
- **PDF Processing**: PyPDF2

## Project Structure

```
interview-prep-app/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── config.py              # Configuration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── static/
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       └── app.js        # Frontend logic
├── templates/
│   └── index.html        # Main page
└── instance/
    └── resumes.db        # SQLite database (auto-created)
```

## Notes

- Maximum file size: 16MB
- Supported format: PDF only
- The app uses Google Gemini's free tier
- Database is created automatically on first run
