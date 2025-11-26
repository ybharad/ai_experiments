from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
import PyPDF2
from models import db, Resume, Response
from config import Config, allowed_file

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('instance', exist_ok=True)

def extract_text_from_pdf(pdf_path):
    """Extract text content from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def generate_interview_questions(resume_text):
    """Generate behavioral interview questions using Google Gemini"""
    
    print(f"=== generate_interview_questions called ===")
    print(f"API Key from config: '{app.config.get('GEMINI_API_KEY')}'")
    print(f"API Key exists: {bool(app.config.get('GEMINI_API_KEY'))}")
    
    # Check if API key is configured
    if not app.config['GEMINI_API_KEY'] or app.config['GEMINI_API_KEY'].strip() == '':
        print("WARNING: GEMINI_API_KEY is not configured. Using fallback questions.")
        print("Please add your API key to the .env file")
        return [
            "Can you describe the most technically challenging project you've worked on? What made it challenging and how did you approach solving those challenges?",
            "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you go about learning it?",
            "Describe a specific bug or technical issue in one of your projects that took significant time to resolve. What was your debugging process?",
            "Walk me through a project where you had to make important architectural or design decisions. What factors did you consider?"
        ]
    
    print(f"API Key configured: {app.config['GEMINI_API_KEY'][:10]}...")
    
    try:
        print(f"Generating questions for resume (length: {len(resume_text)} chars)")
        
        prompt = f"""Based on this resume, generate exactly 4 behavioral interview questions. Each question must reference a specific project or technology from the resume.

Resume:
{resume_text[:2000]}

Generate 4 numbered questions (1., 2., 3., 4.):"""

        print("Calling Gemini API via REST...")
        
        # Use REST API instead of SDK to avoid version issues
        import requests
        import json
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={app.config['GEMINI_API_KEY']}"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096,
                "responseModalities": ["TEXT"]
            }
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        # Log the response for debugging
        if response.status_code != 200:
            print(f"API Error Response: {response.text}")
        
        response.raise_for_status()
        
        result = response.json()
        print(f"API Response: {result}")
        
        # Check if content was blocked
        if 'candidates' not in result or len(result['candidates']) == 0:
            print("WARNING: No candidates in API response. Content may have been blocked.")
            return [
                "Can you describe the most technically challenging project you've worked on? What made it challenging and how did you approach solving those challenges?",
                "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you go about learning it?",
                "Describe a specific bug or technical issue in one of your projects that took significant time to resolve. What was your debugging process?",
                "Walk me through a project where you had to make important architectural or design decisions. What factors did you consider?"
            ]
        
        candidate = result['candidates'][0]
        
        # Check if content exists
        if 'content' not in candidate:
            print("WARNING: No content in candidate. Using fallback questions.")
            return [
                "Can you describe the most technically challenging project you've worked on? What made it challenging and how did you approach solving those challenges?",
                "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you go about learning it?",
                "Describe a specific bug or technical issue in one of your projects that took significant time to resolve. What was your debugging process?",
                "Walk me through a project where you had to make important architectural or design decisions. What factors did you consider?"
            ]
        
        # Extract text from parts
        if 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
            response_text = candidate['content']['parts'][0]['text']
        elif 'text' in candidate['content']:
            response_text = candidate['content']['text']
        else:
            print("WARNING: Could not extract text from response. Using fallback questions.")
            return [
                "Can you describe the most technically challenging project you've worked on? What made it challenging and how did you approach solving those challenges?",
                "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you go about learning it?",
                "Describe a specific bug or technical issue in one of your projects that took significant time to resolve. What was your debugging process?",
                "Walk me through a project where you had to make important architectural or design decisions. What factors did you consider?"
            ]
        
        print(f"Gemini API response received (length: {len(response_text)} chars)")
        print(f"Response preview: {response_text[:200]}...")
        
        # Parse the response to extract questions
        questions_text = response_text.strip()
        questions = []
        
        # Split by newlines and filter for numbered questions
        lines = questions_text.split('\n')
        for line in lines:
            line = line.strip()
            # Check if line starts with a number followed by a period or parenthesis
            if line and (line[0].isdigit() or line.startswith('**')):
                # Remove numbering and clean up
                question = line
                # Remove common numbering patterns
                for i in range(1, 20):
                    question = question.replace(f"{i}.", "", 1).replace(f"{i})", "", 1).replace(f"**{i}.**", "", 1).replace(f"**{i})", "", 1)
                question = question.strip().replace("**", "")
                if question and len(question) > 20:  # Ensure it's a real question
                    questions.append(question)
        
        print(f"Parsed {len(questions)} questions from AI response")
        
        # Ensure we have at least some questions
        if len(questions) < 2:
            print("WARNING: AI generated fewer than 2 questions. Using fallback questions.")
            # If AI generation mostly failed, create project-focused fallback questions
            return [
                "Can you describe the most technically challenging project you've worked on? What made it challenging and how did you approach solving those challenges?",
                "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you go about learning it?",
                "Describe a specific bug or technical issue in one of your projects that took significant time to resolve. What was your debugging process?",
                "Walk me through a project where you had to make important architectural or design decisions. What factors did you consider?"
            ]
        
        print(f"Successfully generated {len(questions[:4])} project-specific questions")
        return questions[:4]  # Return up to 4 questions
        
    except Exception as e:
        print(f"ERROR generating questions: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return project-focused fallback questions if AI generation fails
        return [
            "Can you describe the most technically challenging project you've worked on? What made it challenging and how did you approach solving those challenges?",
            "Tell me about a time when you had to learn a new technology or framework quickly for a project. How did you go about learning it?",
            "Describe a specific bug or technical issue in one of your projects that took significant time to resolve. What was your debugging process?",
            "Walk me through a project where you had to make important architectural or design decisions. What factors did you consider?"
        ]

@app.route('/')
def index():
    """Render main application page"""
    return render_template('index.html')

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Handle resume upload and generate questions"""
    try:
        # Check if file is present
        if 'resume' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['resume']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check if file is allowed
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract text from PDF
        try:
            resume_text = extract_text_from_pdf(filepath)
        except Exception as e:
            os.remove(filepath)  # Clean up file
            return jsonify({'error': f'Failed to extract text from PDF: {str(e)}'}), 400
        
        # Generate interview questions
        questions = generate_interview_questions(resume_text)
        
        # Save to database
        resume = Resume(
            filename=filename,
            content=resume_text,
            questions=questions
        )
        db.session.add(resume)
        db.session.commit()
        
        # Clean up uploaded file (optional - keep if you want to store PDFs)
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'resume_id': resume.id,
            'questions': questions,
            'message': 'Resume processed successfully!'
        }), 200
        
    except Exception as e:
        print(f"ERROR in upload_resume: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/get-questions/<int:resume_id>', methods=['GET'])
def get_questions(resume_id):
    """Retrieve questions for a specific resume"""
    try:
        resume = Resume.query.get(resume_id)
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        return jsonify({
            'success': True,
            'resume': resume.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/resumes', methods=['GET'])
def get_all_resumes():
    """Get all uploaded resumes"""
    try:
        resumes = Resume.query.order_by(Resume.upload_date.desc()).all()
        return jsonify({
            'success': True,
            'resumes': [resume.to_dict() for resume in resumes]
        }), 200
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/submit-responses', methods=['POST'])
def submit_responses():
    """Submit user responses to interview questions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('resume_id'):
            return jsonify({'error': 'Resume ID is required'}), 400
        
        if not data.get('responses'):
            return jsonify({'error': 'Responses are required'}), 400
        
        # Get the resume to link filename and upload time
        resume = Resume.query.get(data['resume_id'])
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Create response record
        response = Response(
            resume_filename=resume.filename,
            resume_upload_time=resume.upload_date,
            responses=data['responses']
        )
        
        db.session.add(response)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'response_id': response.id,
            'message': 'Responses saved successfully!'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
