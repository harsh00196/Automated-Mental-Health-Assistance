import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from config import Config
from models import db, bcrypt, jwt

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "message": "Mental Health API is running!"}), 200

    # Register Blueprints here
    from routes.auth import auth_bp
    from routes.chat import chat_bp
    from routes.mood import mood_bp
    from routes.resources import resources_bp
    from routes.user import user_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(mood_bp, url_prefix='/api/mood')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
