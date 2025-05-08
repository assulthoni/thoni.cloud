from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from dotenv import load_dotenv
import os
import requests

load_dotenv()
app = Flask(__name__, static_url_path='/static')
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Gemini API configuration
app.config['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')  # In production, use environment variables
app.config['GEMINI_MODEL'] = 'gemini-1.5-flash-8b'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    notes = db.relationship('Note', backref='author', lazy=True)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/notes')
def notes():
    notes = Note.query.order_by(Note.created_at.desc()).all()
    return render_template('notes.html', notes=notes)

@app.route('/notes/new', methods=['GET', 'POST'])
@login_required
def new_note():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        if not title or not content:
            flash('Title and content are required!', 'error')
            return redirect(url_for('new_note'))
        note = Note(title=title, content=content, author=current_user)
        db.session.add(note)
        db.session.commit()
        flash('Note created successfully!', 'success')
        return redirect(url_for('notes'))
    return render_template('new_note.html')

@app.route('/notes/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_note(id):
    note = Note.query.get_or_404(id)
    if note.author != current_user:
        flash('You do not have permission to edit this note!', 'error')
        return redirect(url_for('notes'))
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        if not title or not content:
            flash('Title and content are required!', 'error')
            return redirect(url_for('edit_note', id=id))
        note.title = title
        note.content = content
        note.updated_at = datetime.utcnow()
        db.session.commit()
        flash('Note updated successfully!', 'success')
        return redirect(url_for('notes'))
    return render_template('edit_note.html', note=note)

@app.route('/notes/<int:id>/delete')
@login_required
def delete_note(id):
    note = Note.query.get_or_404(id)
    if note.author != current_user:
        flash('You do not have permission to delete this note!', 'error')
        return redirect(url_for('notes'))
    db.session.delete(note)
    db.session.commit()
    flash('Note deleted successfully!', 'success')
    return redirect(url_for('notes'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('notes'))
        flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/ask')
def ask():
    return render_template('ask.html')

@app.route('/bubblemumble', methods=['GET'])
def bubblemummble():
    return render_template('bubblemumble.html')

@app.route('/flappy', methods=['GET'])
def flappy():
    return render_template('flappy.html')

@app.route('/maze', methods=['GET'])
def maze():
    return render_template('maze.html')

@app.route('/api/ask-cv', methods=['POST'])
def ask_cv():
    data = request.json
    question = data.get('question')
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    
    try:
        # Fetch CV content
        cv_response = requests.get('https://raw.githubusercontent.com/assulthoni/assulthoni/refs/heads/main/cv.md')
        cv_response.raise_for_status()
        cv_content = cv_response.text
        
        # Call Gemini API
        api_key = app.config['GEMINI_API_KEY']
        model = app.config['GEMINI_MODEL']
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        request_data = {
            'contents': [
                {
                    'role': 'user',
                    'parts': [{'text': 'Here is Thoni CV content:'}]
                },
                {
                    'role': 'model',
                    'parts': [{'text': 'Okay. What would you like me to do?'}]
                },
                {
                    'role': 'user',
                    'parts': [{'text': f"{cv_content}\nQuestion: {question}"}]
                }
            ],
            'generationConfig': {
                'temperature': 0.2,
                'topK': 40,
                'topP': 0.95,
                'maxOutputTokens': 8192,
                'responseMimeType': 'text/plain'
            }
        }
        
        response = requests.post(url, json=request_data)
        response.raise_for_status()
        result = response.json()
        answer = result['candidates'][0]['content']['parts'][0]['text']
        
        # Render markdown
        markdown_response = requests.post(
            'https://api.github.com/markdown',
            json={'text': answer, 'mode': 'gfm'}
        )
        
        if markdown_response.ok:
            rendered_answer = markdown_response.text
        else:
            rendered_answer = answer
        
        return jsonify({
            'question': question,
            'answer': rendered_answer
        })
        
    except requests.RequestException as e:
        return jsonify({'error': f'API request failed: {str(e)}'}), 500
    except (KeyError, IndexError) as e:
        return jsonify({'error': f'Failed to parse API response: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@app.route('/cha-birthday')
def birthday():
    return render_template('birthday.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)