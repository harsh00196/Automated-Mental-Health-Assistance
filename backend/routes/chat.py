from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ChatMessage, User
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import google.generativeai as genai
import os
import json
from collections import Counter

chat_bp = Blueprint('chat', __name__)
analyzer = SentimentIntensityAnalyzer()

SYSTEM_PROMPT = """You are an **AI-powered Mental Health Assistant Chatbot** designed for a web application called **"Automated Mental Health Assistance System"**.

Your role is to provide **empathetic, personalized, and emotionally intelligent support** based on the user's input.

### 🎯 Core Responsibilities:
#### 1. Sentiment & Emotion Analysis
* Carefully analyze the user's message
* Detect emotional state such as: Stress, Anxiety, Sadness, Neutral, Positive
* Consider tone, keywords, and context
* Assign: Emotion label, Intensity level (Low / Medium / High)

#### 2. Personalized Response Generation
* Respond in a human-like, empathetic tone
* Use the user's emotional state to guide your response
* Avoid robotic or generic replies
* Adapt tone: Calm and reassuring for stress/anxiety, Encouraging for sadness, Supportive and positive for neutral/positive states

#### 3. Context Awareness
* Remember previous user messages within the conversation
* Avoid repeating responses
* Build a natural conversational flow

#### 4. Recommendation Engine
Based on detected emotion, provide 1-2 relevant suggestions:
* Stress / Anxiety: Breathing exercises, Short meditation, Relaxation techniques
* Sadness: Motivational thoughts, Journaling suggestions
* Neutral: General wellness tips
* Positive: Reinforce positivity and gratitude

#### 5. Safety & Ethical Guidelines
* Do NOT provide medical diagnosis
* If user shows severe distress, gently encourage reaching out to a professional

### 💬 Response Format:
Return output EXACTLY in the following JSON format:
{
"emotion": "<detected emotion>",
"intensity": "<low/medium/high>",
"response": "<empathetic message>",
"suggestions": ["<suggestion 1>", "<suggestion 2>"]
}"""

def generate_ai_response(user, user_message, history):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "emotion": "Neutral",
            "intensity": "Low",
            "response": "It seems my AI brain isn't connected yet! Please add a `GEMINI_API_KEY` to the backend `.env` file to activate me.",
            "suggestions": ["Add GEMINI_API_KEY to backend/.env"]
        }

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash", 
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"}
    )
    
    # Calculate user's overall mood from past history
    recent_emotions = [msg.sentiment for msg in history if msg.sender_type == 'bot' and msg.sentiment]
    emotion_summary = "None yet"
    if recent_emotions:
        most_common = Counter(recent_emotions).most_common(2)
        emotion_summary = ", ".join([f"{e[0]} ({e[1]} times)" for e in most_common])

    prompt = f"User Context:\\n- Username: {user.username}\\n- Historical Dominant Emotions: {emotion_summary}\\n\\nConversation History:\\n"
    for msg in history[-20:]: 
        prompt += f"{user.username if msg.sender_type=='user' else 'AI'}: {msg.message}\\n"
    prompt += f"User ({user.username}): {user_message}\\n\\nPlease generate the JSON response using the context provided."
    
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            "emotion": "Stress",
            "intensity": "Unknown",
            "response": "I'm having a little trouble connecting to my thought process right now. Please try again in a moment.",
            "suggestions": ["Take a deep breath", "Try again later"]
        }

@chat_bp.route('/', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = get_jwt_identity()
    messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()
    history = [{"id": m.id, "sender": m.sender_type, "message": m.message, "created_at": m.created_at} for m in messages]
    return jsonify(history), 200

@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    message_text = data.get('message')

    if not message_text:
        return jsonify({"msg": "Message cannot be empty"}), 400

    history = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()

    sentiment_dict = analyzer.polarity_scores(message_text)
    compound_score = sentiment_dict['compound']
    if compound_score >= 0.05: sentiment_label = "Positive"
    elif compound_score <= -0.05: sentiment_label = "Negative"
    else: sentiment_label = "Neutral"

    user_msg = ChatMessage(user_id=user_id, sender_type='user', message=message_text, sentiment=sentiment_label)
    db.session.add(user_msg)
    
    ai_data = generate_ai_response(user, message_text, history)
    ai_text = ai_data.get("response", "I understand.")
    
    bot_msg = ChatMessage(user_id=user_id, sender_type='bot', message=ai_text, sentiment=ai_data.get("emotion"))
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify({
        "user_message": {"id": user_msg.id, "sender": "user", "message": message_text, "sentiment": sentiment_label},
        "bot_response": {
            "id": bot_msg.id,
            "sender": "bot", 
            "message": ai_text,
            "emotion": ai_data.get("emotion"),
            "intensity": ai_data.get("intensity"),
            "suggestions": ai_data.get("suggestions", [])
        }
    }), 200

@chat_bp.route('/<int:msg_id>', methods=['DELETE'])
@jwt_required()
def delete_message(msg_id):
    user_id = get_jwt_identity()
    msg = ChatMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    
    if not msg:
        return jsonify({"msg": "Message not found"}), 404
        
    db.session.delete(msg)
    db.session.commit()
    return jsonify({"msg": "Message deleted"}), 200

@chat_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_history():
    user_id = get_jwt_identity()
    ChatMessage.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({"msg": "Chat history cleared"}), 200

@chat_bp.route('/<int:msg_id>', methods=['PUT'])
@jwt_required()
def edit_message(msg_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    new_text = data.get('message')
    
    if not new_text:
        return jsonify({"msg": "Message cannot be empty"}), 400
        
    msg = ChatMessage.query.filter_by(id=msg_id, user_id=user_id).first()
    
    if not msg:
        return jsonify({"msg": "Message not found"}), 404
        
    # Optional: We could limit editing to 'user' messages only.
    if msg.sender_type != 'user':
        return jsonify({"msg": "Cannot edit bot messages"}), 403
        
    msg.message = new_text
    db.session.commit()
    return jsonify({"msg": "Message updated", "message": msg.message}), 200
