from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

from services.ms_graph_service import MSGraphService
from services.cohere_service import CohereService
from services.email_processor import EmailProcessor
app = Flask(__name__)
CORS(app)

# Initialize services
ms_graph = MSGraphService(
    app_id=os.getenv("APPLICATION_ID"),
    scopes=['Mail.Read', 'Mail.ReadWrite', 'Mail.ReadBasic']
)
cohere_service = CohereService(api_key=os.getenv("COHERE_API_KEY"))
email_processor = EmailProcessor(ms_graph, cohere_service)

# ============= Authentication Endpoints =============

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """Check if user is authenticated with Microsoft"""
    is_authenticated = ms_graph.check_authentication()
    return jsonify({"authenticated": is_authenticated})

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """Initiate non-blocking device code auth flow."""
    try:
        flow = ms_graph.initiate_auth_flow()
        return jsonify({
            'success': True,
            'verification_uri': flow.get('verification_uri'),
            'user_code': flow.get('user_code'),
            'expires_in': flow.get('expires_in'),
            'message': flow.get('message'),
            'status': 'pending'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/login/status', methods=['GET'])
def auth_login_status():
    """Check current status of device code flow."""
    return jsonify(ms_graph.get_flow_status())

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Clear authentication"""
    ms_graph.clear_auth()
    return jsonify({"success": True})

# ============= Email Management Endpoints =============

@app.route('/api/emails/fetch', methods=['POST'])
def fetch_emails():
    """Fetch emails from Outlook via MS Graph API"""
    try:
        data = request.json
        count = data.get('count', 20)
        
        emails = ms_graph.fetch_emails(count)
        
        return jsonify({
            "success": True,
            "emails": emails,
            "count": len(emails)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/emails/process', methods=['POST'])
def process_emails():
    """Process emails with Cohere AI - classify and extract action items"""
    try:
        data = request.json
        emails = data.get('emails', [])
        
        processed_emails = []
        
        for email in emails:
            # Classify email
            category = cohere_service.classify_email(email['body'])
            email['category'] = category
            
            # Extract action items (skip for spam and newsletters)
            if category not in ['Spam', 'Newsletters', 'Promotions']:
                action_items = cohere_service.extract_action_items(email['body'])
                email['actionItems'] = action_items
            else:
                email['actionItems'] = []
            
            processed_emails.append(email)
        
        return jsonify({
            "success": True,
            "processed_emails": processed_emails
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/emails/generate-reply', methods=['POST'])
def generate_reply():
    """Generate reply draft using Cohere AI"""
    try:
        data = request.json
        email = data.get('email')
        
        # Skip reply generation for spam
        if email.get('category') == 'Spam':
            return jsonify({
                "success": False,
                "message": "Reply generation skipped for spam emails"
            })
        
        # Generate reply
        reply_body = cohere_service.generate_reply(email['body'], email['subject'])
        
        draft = {
            "id": f"draft_{email['id']}",
            "originalEmailId": email['id'],
            "subject": f"Re: {email['subject']}",
            "body": reply_body,
            "recipient": email['from'],
            "createdAt": email['receivedDateTime']
        }
        
        return jsonify({
            "success": True,
            "draft": draft
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/emails/send-reply', methods=['POST'])
def send_reply():
    """Send a generated reply draft via MS Graph."""
    try:
        data = request.json
        draft = data.get('draft') or {}
        subject = draft.get('subject') or data.get('subject')
        body = draft.get('body') or data.get('body')
        recipient = draft.get('recipient') or data.get('recipient')

        if not (subject and body and recipient):
            return jsonify({"success": False, "error": "Missing subject, body, or recipient"}), 400
        result = ms_graph.send_mail(subject, body, recipient)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= Chat Agent Endpoint =============

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat with Cohere AI assistant"""
    try:
        data = request.json
        message = data.get('message')
        context = data.get('context', {})
        
        response = cohere_service.chat_assistant(message, context)
        
        return jsonify({
            "success": True,
            "response": response
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============= Prompts Management =============

@app.route('/api/prompts', methods=['GET'])
def get_prompts():
    """Get all prompt templates"""
    prompts = cohere_service.get_prompts()
    return jsonify(prompts)

@app.route('/api/prompts', methods=['POST'])
def update_prompts():
    """Update prompt templates"""
    data = request.json
    cohere_service.update_prompts(data)
    return jsonify({"success": True, "message": "Prompts updated"})

# ============= Health Check =============

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "OceanAI Email Agent",
        "ms_graph": "connected" if ms_graph.check_authentication() else "disconnected",
        "cohere": "active"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)