from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from extension_bcrypt import bcrypt # We'll create a small wrapper for bcrypt
from datetime import datetime

db = SQLAlchemy()
jwt = JWTManager()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=True) # None if anonymous
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(128))
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mood = db.Column(db.String(50), nullable=False) # emoji or text: "Happy", "Sad", "Stressed", "Neutral"
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sender_type = db.Column(db.String(20), nullable=False) # 'user' or 'bot'
    message = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(50), nullable=True) # stored for user messages
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
