from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, MoodLog
from datetime import datetime, timedelta

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/log', methods=['POST'])
@jwt_required()
def log_mood():
    user_id = get_jwt_identity()
    data = request.get_json()
    mood = data.get('mood')
    note = data.get('note', '')

    if not mood:
        return jsonify({"msg": "Mood is required"}), 400

    new_log = MoodLog(user_id=user_id, mood=mood, note=note)
    db.session.add(new_log)
    db.session.commit()

    return jsonify({"msg": "Mood logged successfully"}), 201

@mood_bp.route('/history', methods=['GET'])
@jwt_required()
def get_mood_history():
    user_id = get_jwt_identity()
    logs = MoodLog.query.filter_by(user_id=user_id).order_by(MoodLog.created_at.desc()).limit(30).all()
    history = [{"id": l.id, "mood": l.mood, "note": l.note, "date": l.created_at.isoformat()} for l in logs]
    return jsonify(history), 200

@mood_bp.route('/analytics/weekly', methods=['GET'])
@jwt_required()
def get_weekly_analytics():
    user_id = get_jwt_identity()
    
    today = datetime.utcnow().date()
    dates = [today - timedelta(days=i) for i in range(6, -1, -1)]
    
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    logs = MoodLog.query.filter(MoodLog.user_id == user_id, MoodLog.created_at >= one_week_ago).order_by(MoodLog.created_at.asc()).all()
    
    daily_logs = {}
    for log in logs:
        date_str = log.created_at.date().isoformat()
        # Keep the latest mood of the day
        daily_logs[date_str] = log.mood
        
    mood_scores = {"Happy": 100, "Neutral": 66, "Sad": 33, "Stressed": 0}
    
    chart_data = []
    for d in dates:
        date_str = d.isoformat()
        mood = daily_logs.get(date_str)
        chart_data.append({
            "day": d.strftime('%-d'),
            "date": date_str,
            "score": mood_scores.get(mood) if mood else None,
            "mood": mood
        })
        
    return jsonify(chart_data), 200
