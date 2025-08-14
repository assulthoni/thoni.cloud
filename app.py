from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from dotenv import load_dotenv
import cv2
import numpy as np
import base64
import random
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

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_smile.xml")
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

# Folder to store captured images
CAPTURE_DIR = os.path.join("static", "captured")
TWIBBON_PATH = "static/twibbon.png"
os.makedirs(CAPTURE_DIR, exist_ok=True)

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


def compute_confidence(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)

    if len(faces) == 0:
        return random.uniform(70, 75)

    # Largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_roi_gray = gray[y:y+h, x:x+w]

    score = 70

    # Face size factor
    face_area_ratio = (w * h) / (img.shape[0] * img.shape[1])
    size_boost = min(face_area_ratio * 50, 5)
    score += size_boost

    # Smile factor
    smiles = smile_cascade.detectMultiScale(face_roi_gray, 1.7, 20)
    if len(smiles) > 0:
        smile_factor = min(len(smiles) / 3, 1.0)
        score += smile_factor * 15

    # Eye factor
    eyes = eye_cascade.detectMultiScale(face_roi_gray)
    if len(eyes) >= 2:
        score += 7
    elif len(eyes) == 1:
        score += 3

    score += random.uniform(-1, 1)
    return max(70, min(score, 99))


@app.route("/confidence")
def confidence_page():
    return render_template("confidence.html")


@app.route("/live_confidence", methods=["POST"])
def live_confidence():
    try:
        data_url = request.json["image"]
        image_data = base64.b64decode(data_url.split(",")[1])
        np_img = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        score = compute_confidence(img)
        return jsonify({"confidence": round(score, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/capture_image", methods=["POST"])
def capture_image():
    try:
        data_url = request.json["image"]
        image_data = base64.b64decode(data_url.split(",")[1])
        filename = datetime.now().strftime("%Y%m%d_%H%M%S") + ".jpg"
        filepath = os.path.join(CAPTURE_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(image_data)

        return jsonify({"message": "Image saved", "filename": filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_confidence(img):
    """Return confidence score and coordinates of detected face"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)

    if len(faces) == 0:
        return round(random.uniform(70, 75), 2), None

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_roi_gray = gray[y:y+h, x:x+w]

    score = 70

    # Face size boost
    face_area_ratio = (w * h) / (img.shape[0] * img.shape[1])
    size_boost = min(face_area_ratio * 50, 5)
    score += size_boost

    # Smile boost
    smiles = smile_cascade.detectMultiScale(face_roi_gray, 1.7, 20)
    if len(smiles) > 0:
        smile_factor = min(len(smiles) / 3, 1.0)
        score += smile_factor * 15

    # Eyes boost
    eyes = eye_cascade.detectMultiScale(face_roi_gray)
    if len(eyes) >= 2:
        score += 7
    elif len(eyes) == 1:
        score += 3

    score += random.uniform(-1, 1)
    score = max(70, min(score, 99))

    return round(score, 2), (x, y, w, h)

@app.route("/capture_with_score", methods=["POST"])
def capture_with_score():
    data_url = request.json["image"]
    image_data = base64.b64decode(data_url.split(",")[1])
    np_img = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

          # --- Overlay Twibbon PNG ---
    twibbon = cv2.imread(TWIBBON_PATH, cv2.IMREAD_UNCHANGED)
    twibbon_resized = cv2.resize(twibbon, (img.shape[1], img.shape[0]))    # Split alpha channel if exists
    if twibbon_resized.shape[2] == 4:
        alpha = twibbon_resized[:,:,3]/255.0
        for c in range(3):
            img[:,:,c] = (alpha*twibbon_resized[:,:,c] + (1-alpha)*img[:,:,c]).astype(np.uint8)

    score, _ = calculate_confidence(img)

    # Draw score on frame (clean, light-blue background, bottom)
    label = f"Confidence: {score}%"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.8
    thickness = 2

    # Get text size
    text_size, _ = cv2.getTextSize(label, font, font_scale, thickness)
    text_width, text_height = text_size

    # Position: bottom-center below the #ConfidenceNivea text
    text_x = int((img.shape[1] - text_width) / 2)
    text_y = img.shape[0] - 20  # 20px from bottom

    # Light-blue background rectangle
    bg_color = (173, 216, 230)  # RGB for light blue
    cv2.rectangle(img, 
                  (text_x - 5, text_y - text_height - 5),
                  (text_x + text_width + 5, text_y + 5),
                  bg_color, 
                  -1)

    # Put text on top
    cv2.putText(img, label, (text_x, text_y), font, font_scale, (0, 0, 0), thickness)

    
    # Save file
    filename = f"capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{score}.png"
    file_path = os.path.join(CAPTURE_DIR, filename)
    cv2.imwrite(file_path, img)

    # Return JSON with filename
    return jsonify({"filename": filename})

@app.route("/result/<filename>")
def result_page(filename):
    return render_template("result.html", filename=filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)