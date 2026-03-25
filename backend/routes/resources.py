from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, MoodLog, ChatMessage
import random

resources_bp = Blueprint('resources', __name__)


RESOURCE_LIBRARY = [
    # STRESS
    {"id": 1, "title": "5-Minute Deep Breathing", "type": "exercise", "category": "stress", "emoji": "🌬️", "description": "A quick box-breathing exercise to instantly lower your heart rate.", "content": "Welcome to Box Breathing.\n\n1. Inhale slowly for 4 seconds.\n2. Hold your breath for 4 seconds.\n3. Exhale slowly for 4 seconds.\n4. Hold your breath for 4 seconds.\n\nRepeat this cycle for 5 minutes to activate your parasympathetic nervous system and instantly reduce stress hormones."},
    {"id": 2, "title": "Progressive Muscle Relaxation", "type": "audio", "category": "stress", "emoji": "🎧", "description": "Listen to this 10-minute guide to release physical tension from head to toe.", "content": "Find a comfortable place to lie down. Close your eyes and focus on your breathing.\n\nStarting with your toes, tense the muscles as tightly as you can for 5 seconds... then release. Notice the feeling of relaxation. Move up to your calves, tense... and release.\n\nContinue this process all the way up to the muscles in your face and jaw. (Audio simulation)"},
    {"id": 3, "title": "Desk Stretches for Tension", "type": "video", "category": "stress", "emoji": "🧘", "description": "Relieve sitting-induced stress with these 5 easy stretches you can do at your desk.", "content": "1. **Neck Rolls:** Slowly roll your head in a circle. 5 times each direction.\n2. **Shoulder Shrugs:** Bring your shoulders up to your ears, hold for 3 seconds, drop.\n3. **Seated Spinal Twist:** Turn your torso to the right, grab your chair back, hold for 15s. Repeat on left.\n4. **Wrist Flex:** Extend your arm, gently pull your fingers back towards your body."},
    {"id": 4, "title": "The Science of Stress", "type": "article", "category": "stress", "emoji": "🔬", "description": "Understand cortisol and how your body physically processes and holds onto stress.", "content": "Stress is an evolutionary mechanism designed to keep us alive. When the amygdala perceives a threat, it signals the hypothalamus to release adrenaline and cortisol.\n\nWhile this 'fight or flight' response is great for outrunning a predator, it is highly damaging when triggered by daily emails or traffic. Chronic cortisol exposure leads to inflammation, sleep disruption, and anxiety. The key is completing the 'stress cycle' through physical movement or deep breathing."},
    {"id": 5, "title": "Vagus Nerve Stimulation", "type": "article", "category": "stress", "emoji": "🫁", "description": "Learn simple techniques to stimulate your vagus nerve and shift out of fight-or-flight mode.", "content": "The Vagus Nerve connects your brain to your gut and is the superhighway of the parasympathetic (rest and digest) nervous system.\n\nYou can manually stimulate it by:\n- Splashing cold water on your face.\n- Humming or singing loudly.\n- Deep slow belly breathing.\n- Probiotics for gut health."},
    
    # ANXIETY
    {"id": 6, "title": "Understanding Panic Attacks", "type": "article", "category": "anxiety", "emoji": "🧠", "description": "Learn the physiological roots of panic attacks and how to ground yourself during one.", "content": "A panic attack is a sudden episode of intense fear that triggers severe physical reactions when there is no real danger or apparent cause. Symptoms include racing heart, sweating, shaking, and shortness of breath.\n\nRemember: A panic attack cannot physically harm you. It will pass. Ground yourself by focusing on external sensory details rather than internal sensations."},
    {"id": 7, "title": "5-4-3-2-1 Grounding Technique", "type": "exercise", "category": "anxiety", "emoji": "✋", "description": "A powerful sensory exercise to pull your mind away from anxious spirals and back into reality.", "content": "When anxiety is overwhelming, look around you and identify:\n\n**5** things you can SEE.\n**4** things you can FEEL/TOUCH.\n**3** things you can HEAR.\n**2** things you can SMELL.\n**1** thing you can TASTE.\n\nSay them out loud to force your brain to process external stimuli."},
    {"id": 8, "title": "Guided Visualization: Safe Space", "type": "audio", "category": "anxiety", "emoji": "🏝️", "description": "An immersive audio journey to help you mentally retreat to a calm, safe environment.", "content": "Close your eyes. Imagine a place where you feel completely safe and relaxed. It could be a quiet beach, a cozy cabin in the woods, or a sunlit room.\n\nWhat does it look like? Is it warm? Can you hear the sound of subtle waves or wind in the trees? Stay in this mental space for as long as you need to feel your heart rate settle. (Audio simulation)"},
    {"id": 9, "title": "Reframing Anxious Thoughts", "type": "article", "category": "anxiety", "emoji": "💭", "description": "Cognitive Behavioral Therapy (CBT) techniques to challenge and restructure catastrophic thinking.", "content": "Anxiety often relies on cognitive distortions like 'Catastrophizing' or 'Mind Reading'.\n\nWhen a negative thought arises automatically, pause and ask yourself:\n1. Is this a fact, or a feeling?\n2. What is the actual evidence supporting this thought?\n3. What is the evidence against it?\n4. What would I tell a friend who had this exact thought?"},
    {"id": 10, "title": "Breathwork for Racing Thoughts", "type": "video", "category": "anxiety", "emoji": "🌬️", "description": "Follow along with this visual breathing pacer designed specifically for severe anxiety.", "content": "Slow breathing triggers the vagus nerve to secrete acetylcholine, which slows the heart rate down.\n\nFocus entirely on the visual circle on the screen. As it expands, inhale. As it shrinks, exhale. Match the slow, 6-second rhythm until your thoughts begin to quiet down. (Video pacing simulation)"},

    # SADNESS / DEPRESSION
    {"id": 11, "title": "Boost Your Mood Naturally", "type": "article", "category": "sadness", "emoji": "☀️", "description": "Simple, scientifically-backed daily habits to slowly improve your emotional well-being.", "content": "Depression creates a downward momentum. You have to build an upward spiral. Start small:\n- **Sunlight:** Get exposure to direct sunlight within 30 minutes of waking up. This triggers serotonin production.\n- **Movement:** Just 15 minutes of walking can break a depressive loop.\n- **Nutrition:** Ensure you are getting Omega-3s and Vitamin D."},
    {"id": 12, "title": "Gentle Morning Routine", "type": "video", "category": "sadness", "emoji": "🌅", "description": "A low-energy routine to help you get out of bed on days when everything feels heavy.", "content": "If getting out of bed feels impossible today, try this:\n1. Open the blinds to let light in, then get back in bed if needed.\n2. Drink 8oz of water.\n3. Do 3 deep breaths while lying down.\n4. Sit on the edge of the bed and plant your feet on the floor.\nYou don't have to conquer the world today. Just take the next small step."},
    {"id": 13, "title": "Journaling Prompts for Grief", "type": "exercise", "category": "sadness", "emoji": "📓", "description": "15 gentle writing prompts to help process feelings of loss, sadness, and emptiness.", "content": "Grab a pen and write freely for 5 minutes. Do not judge your answers.\n\n1. Right now, what I need most is...\n2. Today, my sadness feels like [a color, shape, or metaphor]...\n3. One small thing that brought me a tiny moment of relief recently was...\n4. If I could talk to the part of me that is hurting, I would say...\n5. I am allowed to feel this way because..."},
    {"id": 14, "title": "Self-Compassion Meditation", "type": "audio", "category": "sadness", "emoji": "🫂", "description": "A soothing 15-minute meditation focusing on forgiving yourself and practicing radical self-love.", "content": "Place one hand over your heart. Feel the warmth of your hand against your chest.\n\nRecognize that in this moment, you are experiencing suffering. Suffering is a part of the human experience; you are not alone in this. May you be kind to yourself. May you give yourself the compassion you need. (Audio simulation)"},
    {"id": 15, "title": "The Upward Spiral", "type": "article", "category": "sadness", "emoji": "📈", "description": "How small neuroscience-based changes can reverse the momentum of depression.", "content": "The brain is incredibly plastic. When you're depressed, a neural circuit is locked into a pattern of negativity.\n\nChanging one small thing—like expressing gratitude, taking a single walk, or making a small decision—alters the chemical balance in the prefrontal cortex and the striatum, initiating an upward spiral of positive reinforcement."},

    # SLEEP
    {"id": 16, "title": "Guided Sleep Meditation", "type": "audio", "category": "sleep", "emoji": "🌙", "description": "Drift off to sleep effortlessly with this calming body-scan meditation.", "content": "Lie comfortably in bed. Notice the feeling of the mattress supporting your body. \n\nWe will slowly scan down the body, inviting each muscle group to power down for the night. Feel a warm, heavy sensation starting at the crown of your head, soothing your forehead, softening your eyes... (Audio simulation)"},
    {"id": 17, "title": "Sleep Hygiene 101", "type": "article", "category": "sleep", "emoji": "🛏️", "description": "Transform your bedroom into a sanctuary and build habits that guarantee deep REM sleep.", "content": "Good sleep starts hours before bed. \n- **Temperature:** Keep your bedroom at 65°F (18°C). A drop in body temperature initiates sleep.\n- **Light:** No screens 1 hour before bed. Blue light destroys melatonin production.\n- **Routine:** Go to bed and wake up at the exact same time every day, even on weekends."},
    {"id": 18, "title": "Yoga Nidra for Insomnia", "type": "audio", "category": "sleep", "emoji": "🌌", "description": "Also known as 'yogic sleep', this practice guides you into a state of conscious deep relaxation.", "content": "Yoga Nidra induces full-body relaxation and a deep meditative state of consciousness.\n\nFollow the sound of my voice. Move your attention sequentially around the body. Right thumb, second finger, third finger, fourth finger, pinky finger. Palm of the hand, back of the hand. Do not attempt to sleep, just remain awake and aware. (Audio simulation)"},
    {"id": 19, "title": "Evening Wind-Down Stretches", "type": "video", "category": "sleep", "emoji": "🧘‍♀️", "description": "Release the day's physical tension with 5 minutes of gentle, bed-friendly stretching.", "content": "Perform these directly on your bed before getting under the covers:\n1. **Child's Pose:** Kneel, sit back on your heels, walk hands forward.\n2. **Supine Twist:** Lie on your back, pull right knee to chest, cross it over your left leg.\n3. **Legs Up The Wall:** Scoot your hips against the headboard, extend legs straight up the wall to reverse blood flow."},

    # GENERAL / MINDFULNESS / POSITIVITY
    {"id": 20, "title": "Introduction to Mindfulness", "type": "video", "category": "general", "emoji": "🧘", "description": "A beautiful animated introduction to the core concepts of staying present in the moment.", "content": "Mindfulness is simply the act of paying conscious attention to the present moment, without judgment.\n\nWe spend 47% of our waking hours thinking about something other than what we're currently doing. By focusing on the breath, the feeling of your feet on the floor, or the taste of your food, you train your brain to stop constantly analyzing the past or fearing the future."},
    {"id": 21, "title": "Gratitude Mapping", "type": "exercise", "category": "positivity", "emoji": "✨", "description": "A 5-minute daily exercise to physically map out the positive aspects of your life.", "content": "Draw a circle in the center of a page and write 'I am grateful'.\n\nDraw branches extending out from the circle. For each branch, write one specific thing you appreciate today. It doesn't have to be massive. It can be 'the smell of coffee', 'the fact my car started', or 'sunlight through the window'. The goal is focusing your attention on the good."},
    {"id": 22, "title": "Building Resilience", "type": "article", "category": "general", "emoji": "🎋", "description": "Learn how highly resilient people bounce back from failure and daily hardships.", "content": "Resilient people are not immune to stress or pain. Instead, they have developed mental flexibilty.\n\nKey traits of resilience:\n1. **Optimism:** Not toxic positivity, but realistic hopefulness.\n2. **Social Support:** Knowing when to ask for help.\n3. **Meaning-Making:** Finding a purpose or lesson within the struggle, rather than viewing oneself as a passive victim."},
    {"id": 23, "title": "Morning Affirmations", "type": "audio", "category": "positivity", "emoji": "🗣️", "description": "Start your day with these powerful, confidence-building spoken affirmations.", "content": "Repeat these phrases out loud or in your head:\n\n- I possess the qualities necessary to be extremely successful.\n- My potential to succeed is limitless.\n- I am brave, I am strong, and I am confident.\n- I forgive myself for past mistakes; they do not define my future.\n- Today is a fresh start. (Audio simulation)"},
    {"id": 24, "title": "The Art of Letting Go", "type": "article", "category": "general", "emoji": "🍂", "description": "Philosophical and practical steps to stop obsessing over things you cannot control.", "content": "The Stoic concept of the 'Dichotomy of Control' teaches that suffering arises from trying to control what is outside of our power.\n\nYou cannot control the weather, the economy, or the opinions of others. You can only control your own actions, thoughts, and reactions. When you truly internalize this, profound peace follows. Let go of the illusion of control."},
    {"id": 25, "title": "Digital Detox Challenge", "type": "exercise", "category": "general", "emoji": "📱", "description": "A structured 3-day plan to reduce screen time and reconnect with the physical world.", "content": "Your phone's algorithms are designed to hijack your dopamine system.\n\n**Day 1:** Turn off all non-essential push notifications (Instagram, News, Twitter).\n**Day 2:** Keep your phone out of the bedroom. Buy a physical alarm clock.\n**Day 3:** Designate a 4-hour window where your phone is entirely powered off. Use this time to read, walk, or talk to someone face-to-face."}
]

@resources_bp.route('/', methods=['GET'], strict_slashes=False)
@resources_bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_all_resources():
    return jsonify(RESOURCE_LIBRARY), 200

@resources_bp.route('/recommendations', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    
    recent_mood = MoodLog.query.filter_by(user_id=user_id).order_by(MoodLog.created_at.desc()).first()
    recent_chat = ChatMessage.query.filter_by(user_id=user_id, sender_type='bot').order_by(ChatMessage.created_at.desc()).first()
    
    target_category = "general"
    
    chat_emotion = recent_chat.sentiment.lower() if (recent_chat and recent_chat.sentiment) else None
    mood_emoji = recent_mood.mood.lower() if recent_mood else None
    
    if chat_emotion:
        if "stress" in chat_emotion: target_category = "stress"
        elif "anx" in chat_emotion: target_category = "anxiety"
        elif "sad" in chat_emotion: target_category = "sadness"
        elif "positiv" in chat_emotion or "happy" in chat_emotion: target_category = "positivity"
        elif "neutral" in chat_emotion: target_category = "general"
    elif mood_emoji:
        if "stress" in mood_emoji: target_category = "stress"
        elif "sad" in mood_emoji: target_category = "sadness"
        elif "anx" in mood_emoji: target_category = "anxiety"
        elif "happy" in mood_emoji: target_category = "positivity"
            
    recommended = [r for r in RESOURCE_LIBRARY if r['category'] in [target_category, "general"]]
    
    exact_matches = [r for r in recommended if r['category'] == target_category]
    general_matches = [r for r in recommended if r['category'] != target_category]
    
    random.shuffle(exact_matches)
    random.shuffle(general_matches)
    
    final_recs = (exact_matches + general_matches)[:3]
    return jsonify(final_recs), 200
