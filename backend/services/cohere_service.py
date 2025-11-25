from cohere import Client
import json
import os

class CohereService:
    def __init__(self, api_key):
        self.client = Client(api_key=api_key)
        # Updated to use Cohere Chat API (Generate removed Sept 15 2025)
        self.model = "command-r-plus-08-2024"
        self.prompts_file = 'data/prompts.json'

        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)

        # Load or create prompts
        if not os.path.exists(self.prompts_file):
            self._create_default_prompts()
    
    def _create_default_prompts(self):
        """Create default prompt templates"""
        default_prompts = {
            "classification": """You are an expert email classifier for a maritime logistics company (OceanAI).

Classify the following email into ONE of these categories:
- Work: Business operations, projects, coordination
- Meetings: Meeting requests, scheduling, calendar invites
- Clients: Customer communications, inquiries, partnerships
- Newsletters: Industry updates, company newsletters, announcements
- HR: Human resources, recruitment, employee matters
- Financial: Invoices, payments, budget, accounting
- Alerts: Urgent notifications, security alerts, system messages
- Technical Support: IT issues, software problems, technical help
- Promotions: Marketing, sales offers, advertisements
- Personal: Personal messages, non-work related
- Legal: Contracts, compliance, legal matters
- Spam: Unsolicited, suspicious, or unwanted emails

Respond with ONLY the category name, nothing else.""",
            
            "action_items": """Extract specific action items from this email.

Identify concrete tasks that require action. Return a JSON array.

Each task should have:
{
  "task": "clear description",
  "deadline": "deadline if mentioned, or 'Not specified'",
  "priority": "High/Medium/Low"
}

If no action items, return: []

Email:""",
            
            "reply_generation": """You are an email assistant for OceanAI, a maritime logistics company.

Draft a professional reply to this email. Guidelines:
- Professional and concise tone
- Match formality level of original
- For meetings: acknowledge and ask for agenda
- For tasks: confirm and provide timeline
- For complaints: apologize and offer resolution
- For inquiries: provide helpful response

Write ONLY the email body, no subject line.""",
            
            "chat_assistant": """You are an intelligent email assistant for OceanAI, a maritime logistics company.

Help users:
- Summarize emails and inbox
- Extract key information
- Identify urgent matters
- Answer questions about emails
- Provide actionable insights

Be concise, professional, and helpful."""
        }
        
        with open(self.prompts_file, 'w') as f:
            json.dump(default_prompts, f, indent=2)
    
    def get_prompts(self):
        """Load prompts from file, regenerating defaults if file is missing or invalid"""
        try:
            with open(self.prompts_file, 'r') as f:
                content = f.read().strip()
                if not content:
                    # Empty file – recreate defaults
                    raise json.JSONDecodeError("empty", content, 0)
                return json.loads(content)
        except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
            # Recreate defaults on any parse error or missing file
            self._create_default_prompts()
            with open(self.prompts_file, 'r') as f:
                return json.load(f)
    
    def update_prompts(self, prompts):
        """Update prompts file"""
        with open(self.prompts_file, 'w') as f:
            json.dump(prompts, f, indent=2)
    
    def classify_email(self, email_body):
        """Classify email using Cohere Chat API (single message signature)."""
        prompts = self.get_prompts()
        classification_prompt = prompts['classification']
        prompt = f"{classification_prompt}\n\nEmail:\n{email_body[:1500]}\n\nReturn ONLY the category." 
        try:
            chat_response = self.client.chat(
                model=self.model,
                message=prompt,
                temperature=0.2,
            )
            category = chat_response.text.strip()
            valid_categories = [
                'Work', 'Meetings', 'Clients', 'Newsletters', 'HR',
                'Financial', 'Alerts', 'Technical Support', 'Promotions',
                'Personal', 'Legal', 'Spam'
            ]
            if category not in valid_categories:
                for cat in valid_categories:
                    if cat.lower() in category.lower():
                        return cat
                return 'Work'
            return category
        except Exception as e:
            print(f"Classification error (chat): {e}")
            return 'Work'
    
    def extract_action_items(self, email_body):
        """Extract action items using Cohere Chat API returning JSON array."""
        prompts = self.get_prompts()
        action_prompt = prompts['action_items']
        instruction = "Return ONLY a valid JSON array ([] if none)."
        prompt = f"{action_prompt}\n\n{email_body[:4000]}\n\n{instruction}"
        try:
            chat_response = self.client.chat(
                model=self.model,
                message=prompt,
                temperature=0.3,
            )
            result = chat_response.text.strip()
            if result.startswith('```'):
                result = result.strip('`')
            try:
                action_items = json.loads(result)
                if isinstance(action_items, list):
                    norm = []
                    for item in action_items:
                        if isinstance(item, dict):
                            norm.append({
                                'task': item.get('task') or item.get('action') or '',
                                'deadline': item.get('deadline', 'Not specified'),
                                'priority': item.get('priority', 'Medium')
                            })
                    return norm
                return []
            except Exception:
                return []
        except Exception as e:
            print(f"Action extraction error (chat): {e}")
            return []
    
    def generate_reply(self, email_body, subject):
        """Generate email reply using Cohere Chat API."""
        prompts = self.get_prompts()
        reply_prompt = prompts['reply_generation']
        prompt = f"{reply_prompt}\n\nSubject: {subject}\n\nEmail Body:\n{email_body[:4000]}"
        try:
            chat_response = self.client.chat(
                model=self.model,
                message=prompt,
                temperature=0.4,
            )
            return chat_response.text.strip()
        except Exception as e:
            print(f"Reply generation error (chat): {e}")
            return "Thank you for your email. I will review and respond shortly."
    
    def chat_assistant(self, message, context):
        """General chat assistant using Cohere Chat API."""
        prompts = self.get_prompts()
        assistant_prompt = prompts['chat_assistant']
        context_info_parts = []
        if context.get('emails'):
            emails = context['emails']
            stats = context.get('stats', {})
            context_info_parts.append(f"Total emails: {len(emails)}")
            context_info_parts.append(f"Important: {stats.get('important',0)}")
            context_info_parts.append(f"Spam: {stats.get('spam',0)}")
            context_info_parts.append(f"Action items: {stats.get('todos',0)}")
        if context.get('selectedEmail'):
            email = context['selectedEmail']
            context_info_parts.append(f"Selected Email Subject: {email.get('subject','')}")
            context_info_parts.append(f"From: {email.get('from','')}")
            context_info_parts.append(f"Category: {email.get('category','')}")
        context_blob = "\n".join(context_info_parts)
        prompt = f"{assistant_prompt}\n\nContext:\n{context_blob}\n\nUser Query:\n{message}"
        try:
            chat_response = self.client.chat(
                model=self.model,
                message=prompt,
                temperature=0.5,
            )
            return chat_response.text.strip()
        except Exception as e:
            print(f"Chat error (assistant): {e}")
            return "I apologize, but I'm having trouble processing your request. Please try again."

