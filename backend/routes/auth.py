from flask import Blueprint, request, jsonify
from models import db, User
from extension_bcrypt import bcrypt
from flask_jwt_extended import create_access_token
import uuid
import requests
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_pw, is_anonymous=False)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=access_token, user={"id": user.id, "username": user.username, "is_anonymous": user.is_anonymous}), 200

@auth_bp.route('/guest', methods=['POST'])
def guest_login():
    guest_username = f"Guest_{uuid.uuid4().hex[:6]}"
    new_user = User(username=guest_username, email=None, password_hash="guest", is_anonymous=True)
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))
    return jsonify(access_token=access_token, user={"id": new_user.id, "username": new_user.username, "is_anonymous": new_user.is_anonymous}), 200

@auth_bp.route('/supabase-login', methods=['POST'])
def supabase_login():
    data = request.get_json()
    access_token = data.get('access_token')

    if not access_token:
        return jsonify({"msg": "Access token is required"}), 400

    supabase_url = os.getenv('SUPABASE_URL')
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'apikey': os.getenv('SUPABASE_ANON_KEY')
    }
    
    response = requests.get(f'{supabase_url}/auth/v1/user', headers=headers)
    
    if response.status_code != 200:
        return jsonify({"msg": "Invalid or expired token"}), 401
    
    user_data = response.json()
    email = user_data.get('email')
    
    if not email:
        return jsonify({"msg": "Email not found in token"}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user:
        username = user_data.get('user_metadata', {}).get('full_name', email.split('@')[0])
        user = User(username=username, email=email, password_hash="oauth", is_anonymous=False)
        db.session.add(user)
        db.session.commit()

    flask_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=flask_token, user={"id": user.id, "username": user.username, "is_anonymous": user.is_anonymous}), 200
