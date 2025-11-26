// DOM Elements
const uploadArea = document.getElementById('upload-area');
const resumeInput = document.getElementById('resume-input');
const uploadStatus = document.getElementById('upload-status');
const statusMessage = document.getElementById('status-message');
const uploadSection = document.getElementById('upload-section');
const questionsSection = document.getElementById('questions-section');
const questionsContainer = document.getElementById('questions-container');
const newUploadBtn = document.getElementById('new-upload-btn');

// Event Listeners
uploadArea.addEventListener('click', () => resumeInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
resumeInput.addEventListener('change', handleFileSelect);
newUploadBtn.addEventListener('click', resetUpload);

// Form submission
const responsesForm = document.getElementById('responses-form');
responsesForm.addEventListener('submit', handleResponseSubmit);

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// File Upload Handler
async function handleFile(file) {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showError('Please upload a PDF file');
        return;
    }

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
        showError('File size must be less than 16MB');
        return;
    }

    // Show loading state
    showLoading('Processing your resume...');

    // Create form data
    const formData = new FormData();
    formData.append('resume', file);

    try {
        // Upload resume
        const response = await fetch('/api/upload-resume', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Show success message briefly
            showLoading('Generating interview questions...');

            // Wait a moment for effect
            setTimeout(() => {
                displayQuestions(data.questions, data.resume_id);
                hideLoading();
            }, 1000);
        } else {
            showError(data.error || 'Failed to process resume');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('An error occurred while uploading your resume');
    }
}

// Display Questions
let currentResumeId = null;

function displayQuestions(questions, resumeId) {
    // Store resume ID for later submission
    currentResumeId = resumeId;

    // Clear previous questions
    questionsContainer.innerHTML = '';

    // Create question cards with text areas
    questions.forEach((question, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="question-number">${index + 1}</div>
            <div class="question-text">${escapeHtml(question)}</div>
            <textarea 
                class="response-textarea" 
                id="response-${index}"
                placeholder="Type your answer here..."
                rows="5"
                required
            ></textarea>
        `;

        questionsContainer.appendChild(card);
    });

    // Show questions section, hide upload section
    uploadSection.classList.add('hidden');
    questionsSection.classList.remove('hidden');

    // Scroll to questions
    questionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// UI State Management
function showLoading(message) {
    statusMessage.textContent = message;
    uploadStatus.classList.remove('hidden');
}

function hideLoading() {
    uploadStatus.classList.add('hidden');
}

function showError(message) {
    hideLoading();

    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Handle Response Submission
async function handleResponseSubmit(e) {
    e.preventDefault();

    // Collect all responses
    const responses = [];
    const questionCards = document.querySelectorAll('.question-card');

    questionCards.forEach((card, index) => {
        const questionText = card.querySelector('.question-text').textContent;
        const answerTextarea = card.querySelector('.response-textarea');
        const answer = answerTextarea.value.trim();

        responses.push({
            question: questionText,
            answer: answer
        });
    });

    // Validate all questions are answered
    const unanswered = responses.filter(r => !r.answer).length;
    if (unanswered > 0) {
        showError(`Please answer all ${unanswered} remaining question(s)`);
        return;
    }

    // Show loading
    showLoading('Submitting your responses...');

    try {
        const response = await fetch('/api/submit-responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resume_id: currentResumeId,
                responses: responses
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            hideLoading();

            // Hide the form
            questionsSection.classList.add('hidden');

            // Show success page
            showSuccessPage();
        } else {
            hideLoading();
            showError(data.error || 'Failed to submit responses');
        }
    } catch (error) {
        console.error('Submission error:', error);
        hideLoading();
        showError('An error occurred while submitting your responses');
    }
}

function showSuccessPage() {
    // Create success page HTML
    const successHTML = `
        <div class="success-page">
            <div class="success-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="40" fill="url(#successGradient)" opacity="0.2"/>
                    <path d="M25 40L35 50L55 30" stroke="url(#successGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <defs>
                        <linearGradient id="successGradient" x1="0" y1="0" x2="80" y2="80">
                            <stop offset="0%" stop-color="#10b981"/>
                            <stop offset="100%" stop-color="#059669"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h2 class="success-title">Responses Submitted Successfully!</h2>
            <p class="success-message">Your interview practice responses have been saved.</p>
            <button id="new-practice-btn" class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Start New Practice Session
            </button>
        </div>
    `;

    // Replace questions container content
    questionsContainer.innerHTML = successHTML;

    // Hide the form actions (submit button, etc.)
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.style.display = 'none';
    }

    // Show questions section
    questionsSection.classList.remove('hidden');

    // Add event listener to new practice button
    document.getElementById('new-practice-btn').addEventListener('click', resetUpload);

    // Scroll to success page
    questionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetUpload() {
    // Reset file input
    resumeInput.value = '';

    // Hide questions, show upload
    questionsSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');

    // Scroll to upload section
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .error-notification {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 0.95rem;
    }
`;
document.head.appendChild(style);

// Initialize
console.log('AI Interview Prep App initialized');
