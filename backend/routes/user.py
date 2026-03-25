from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

user_bp = Blueprint('user', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({
        "id": user.id, 
        "username": user.username, 
        "email": user.email, 
        "is_anonymous": user.is_anonymous
    }), 200

@user_bp.route('/', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    data = request.get_json()
    if 'username' in data:
        user.username = data['username']
    if 'is_anonymous' in data:
        user.is_anonymous = data['is_anonymous']
        
    db.session.commit()
    return jsonify({
        "id": user.id, 
        "username": user.username, 
        "email": user.email, 
        "is_anonymous": user.is_anonymous
    }), 200
