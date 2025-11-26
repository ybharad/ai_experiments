from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Resume(db.Model):
    """Model for storing uploaded resumes and generated questions"""
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    questions = db.Column(db.JSON, nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Resume {self.id}: {self.filename}>'
    
    def to_dict(self):
        """Convert resume to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'filename': self.filename,
            'content': self.content,
            'upload_date': self.upload_date.isoformat(),
            'questions': self.questions
        }

class Response(db.Model):
    """Model for storing user responses to interview questions"""
    __bind_key__ = 'responses'
    __tablename__ = 'responses'
    
    id = db.Column(db.Integer, primary_key=True)
    resume_filename = db.Column(db.String(255), nullable=False)
    resume_upload_time = db.Column(db.DateTime, nullable=False)
    response_submit_time = db.Column(db.DateTime, default=datetime.utcnow)
    responses = db.Column(db.JSON, nullable=False)  # Array of {question, answer} objects
    
    def __repr__(self):
        return f'<Response {self.id}: {self.resume_filename}>'
    
    def to_dict(self):
        """Convert response to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'resume_filename': self.resume_filename,
            'resume_upload_time': self.resume_upload_time.isoformat(),
            'response_submit_time': self.response_submit_time.isoformat(),
            'responses': self.responses
        }
