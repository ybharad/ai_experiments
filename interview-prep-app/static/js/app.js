// DOM Elements
const uploadArea = document.getElementById('upload-area');
const resumeInput = document.getElementById('resume-input');
const uploadStatus = document.getElementById('upload-status');
const statusMessage = document.getElementById('status-message');
const uploadSection = document.getElementById('upload-section');
const questionsSection = document.getElementById('questions-section');
const questionsContainer = document.getElementById('questions-container');


// Event Listeners
uploadArea.addEventListener('click', () => resumeInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
resumeInput.addEventListener('change', handleFileSelect);


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
// Display Questions
let currentResumeId = null;
let allQuestions = [];
let currentQuestionIndex = 0;
let userResponses = [];

function displayQuestions(questions, resumeId) {
    // Store data
    currentResumeId = resumeId;
    allQuestions = questions;
    currentQuestionIndex = 0;
    userResponses = [];

    // Show questions section, hide upload section
    uploadSection.classList.add('hidden');
    questionsSection.classList.remove('hidden');

    // Render the first question
    renderCurrentQuestion();
}

function renderCurrentQuestion() {
    // Clear container
    questionsContainer.innerHTML = '';

    const question = allQuestions[currentQuestionIndex];
    const index = currentQuestionIndex;

    // Create single question card
    const card = document.createElement('div');
    card.className = 'question-card active';
    // Remove animation delay for immediate feel or keep it simple
    card.style.animationDelay = '0s';

    const progressPercentage = ((index + 1) / allQuestions.length) * 100;

    card.innerHTML = `
        <div class="question-header" style="margin-bottom: 2rem;">
            <div class="progress-wrapper" style="margin-bottom: 1rem;">
                <div class="progress-track" style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div class="progress-fill" style="width: ${progressPercentage}%; height: 100%; background: var(--accent-gradient); transition: width 0.5s ease;"></div>
                </div>
            </div>
            <div class="question-meta" style="display: flex; justify-content: space-between; align-items: center;">
                <span class="question-label" style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--accent-primary); background: #f1f5f9; padding: 4px 12px; border-radius: 20px;">
                    Question ${index + 1} / ${allQuestions.length}
                </span>
                <span class="status-text" style="font-size: 0.875rem; color: var(--text-tertiary); font-weight: 500;">
                    ${Math.round(progressPercentage)}% Completed
                </span>
            </div>
        </div>
        <div class="question-text" style="font-size: 1.5rem; margin-bottom: 2rem; color: var(--text-primary); font-weight: 600;">${escapeHtml(question)}</div>
        <div class="input-group">
            <textarea 
                class="response-textarea" 
                id="response-${index}"
                placeholder="Type your answer here or record audio (English only)..."
                rows="8"
                required
            ></textarea>
            <button type="button" class="record-btn" onclick="toggleRecording(${index})" title="Record Audio">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 10V11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 18V22M8 22H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <input type="hidden" id="audio-${index}" value="">
    `;

    questionsContainer.appendChild(card);

    // Update submit button text
    const submitBtn = document.getElementById('submit-btn');
    const isLast = index === allQuestions.length - 1;

    // Preserve icon but change text
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 5L7.5 14L3.5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${isLast ? 'Finish & Submit' : 'Next Question'}
    `;

    // Scroll to top of questions
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

// Audio Recording Logic
let mediaRecorders = {};
let audioChunks = {};
let webSockets = {};

// Transcript storage for real-time display
let transcripts = {};

async function toggleRecording(index) {
    const btn = document.querySelector(`#response-${index}`).parentElement.querySelector('.record-btn');

    if (btn.classList.contains('recording')) {
        await stopRecording(index);
    } else {
        await startRecording(index);
    }
}

let audioContexts = {};
let processors = {};
let audioStreams = {};

async function startRecording(index) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreams[index] = stream;

        // Initialize transcript storage
        transcripts[index] = { committed: '', partial: '' };
        const textarea = document.getElementById(`response-${index}`);

        // Setup MediaRecorder for file upload (existing functionality)
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorders[index] = mediaRecorder;
        audioChunks[index] = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks[index].push(event.data);
            }
        };

        // Setup AudioContext for real-time transcription (PCM)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        audioContexts[index] = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processors[index] = processor;

        // WebSocket for real-time transcription
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws/transcribe`);
        webSockets[index] = ws;

        ws.onopen = () => {
            console.log(`WebSocket connected for question ${index}`);
            // Start processing audio once WS is open
            source.connect(processor);
            processor.connect(audioContext.destination);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Transcription event:', data);

            if (data.message_type === 'partial_transcript') {
                transcripts[index].partial = data.text;
                updateTextarea(index);
            } else if (data.message_type === 'committed_transcript') {
                transcripts[index].committed += (transcripts[index].committed ? ' ' : '') + data.text;
                transcripts[index].partial = '';
                updateTextarea(index);
            } else if (data.error) {
                console.error('Transcription error:', data.error);
                showError(`Transcription error: ${data.error}`);
            }
        };

        processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to Int16 PCM
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
            }

            // Convert PCM to base64
            const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(pcmData.buffer)));

            ws.send(JSON.stringify({
                type: 'audio',
                audio: base64Audio,
                sample_rate: 16000
            }));
        };

        mediaRecorder.onstop = async () => {
            // Create audio blob and upload
            const audioBlob = new Blob(audioChunks[index], { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            try {
                const response = await fetch('/api/upload-audio', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    document.getElementById(`audio-${index}`).value = data.filename;
                }
            } catch (error) {
                console.error('Error uploading audio:', error);
            }
        };

        // Start recording
        mediaRecorder.start();
        const btn = document.querySelector(`#response-${index}`).parentElement.querySelector('.record-btn');
        btn.classList.add('recording');

    } catch (error) {
        console.error('Error starting recording:', error);
        showError('Could not access microphone or initialize audio context.');
    }
}

function updateTextarea(index) {
    const textarea = document.getElementById(`response-${index}`);
    const { committed, partial } = transcripts[index];
    textarea.value = committed + (partial ? (committed ? ' ' : '') + partial : '');
    // Auto-scroll to bottom of textarea
    textarea.scrollTop = textarea.scrollHeight;
}

async function stopRecording(index) {
    // Stop MediaRecorder
    if (mediaRecorders[index] && mediaRecorders[index].state !== 'inactive') {
        mediaRecorders[index].stop();
    }

    // Stop Audio Processing
    if (processors[index]) {
        processors[index].disconnect();
        delete processors[index];
    }

    if (audioContexts[index]) {
        await audioContexts[index].close();
        delete audioContexts[index];
    }

    if (audioStreams[index]) {
        audioStreams[index].getTracks().forEach(track => track.stop());
        delete audioStreams[index];
    }

    // Close WebSocket
    if (webSockets[index]) {
        if (webSockets[index].readyState === WebSocket.OPEN) {
            webSockets[index].close();
        }
        delete webSockets[index];
    }

    const btn = document.querySelector(`#response-${index}`).parentElement.querySelector('.record-btn');
    if (btn) btn.classList.remove('recording');
}


// Handle Response Submission
// Handle Response Submission (Next or Final Submit)
async function handleResponseSubmit(e) {
    e.preventDefault();

    // Get current inputs
    const index = currentQuestionIndex;
    const answerTextarea = document.getElementById(`response-${index}`);
    const audioInput = document.getElementById(`audio-${index}`);
    const answer = answerTextarea.value.trim();
    const audioFilename = audioInput ? audioInput.value : null;

    // Validate
    if (!answer && !audioFilename) {
        showError('Please provide an answer or record a response');
        return;
    }

    // Stop recording if active
    const recordBtn = document.querySelector('.record-btn.recording');
    if (recordBtn) {
        await stopRecording(index);
    }

    // Store response
    userResponses[index] = {
        question: allQuestions[index],
        answer: answer,
        audio_file: audioFilename || null
    };

    // Check if there are more questions
    if (currentQuestionIndex < allQuestions.length - 1) {
        currentQuestionIndex++;
        renderCurrentQuestion();
    } else {
        // Last question, submit everything
        await submitAllResponses();
    }
}

async function submitAllResponses() {
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
                responses: userResponses
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            hideLoading();
            // Show summary/success page
            showSummaryPage();
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

function showSummaryPage() {
    // Remove the form submission handler effect on UI
    // Hide the form actions
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.style.display = 'none';
    }

    // Build the summary HTML
    let summaryContent = `
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
            <h2 class="success-title">Interview Completed!</h2>
            <p class="success-message">Here is a summary of your Q&A session.</p>
            
            <div class="summary-list">
    `;

    userResponses.forEach((resp, idx) => {
        summaryContent += `
            <div class="summary-item">
                <div class="summary-question">
                    <span class="q-num">${idx + 1}.</span> ${escapeHtml(resp.question)}
                </div>
                <div class="summary-answer">
                    <strong>Your Answer:</strong><br>
                    ${escapeHtml(resp.answer)}
                </div>
            </div>
        `;
    });

    summaryContent += `
            </div>
            
            <button id="new-practice-btn" class="btn btn-primary" style="margin-top: 2rem;">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Start New Practice Session
            </button>
        </div>
    `;

    questionsContainer.innerHTML = summaryContent;

    // Add event listener to new practice button
    const newBtn = document.getElementById('new-practice-btn');
    if (newBtn) {
        newBtn.addEventListener('click', resetUpload);
    }

    questionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetUpload() {
    // Reset file input
    resumeInput.value = '';

    // Reset UI
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.style.display = 'flex';
        // Reset button text
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 5L7.5 14L3.5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Next Question
        `;
    }

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

    .summary-list {
        text-align: left;
        margin-top: 2rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
    }
    .summary-item {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .summary-question {
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 0.5rem;
    }
    .summary-answer {
        color: #334155;
        font-size: 0.95rem;
        line-height: 1.6;
        white-space: pre-wrap;
    }
    .q-num {
        color: #2563eb;
        font-weight: 700;
        margin-right: 0.5rem;
    }
`;
document.head.appendChild(style);

// Initialize
console.log('AI Interview Prep App initialized');
