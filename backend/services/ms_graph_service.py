import msal
import requests
import os
import webbrowser
from bs4 import BeautifulSoup
import re
import threading
import json

class MSGraphService:
    def __init__(self, app_id, scopes):
        self.app_id = app_id
        self.scopes = scopes
        self.authority_url = 'https://login.microsoftonline.com/common/'
        self.base_url = 'https://graph.microsoft.com/v1.0/'
        self.token_cache_file = 'data/ms_token_cache.json'
        self.device_flow_file = 'data/device_flow.json'
        self._flow_status = None  # None | 'pending' | 'authenticated' | 'error'
        self._flow_message = None
        
        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)
    
    def _get_token_cache(self):
        """Load token cache from file"""
        cache = msal.SerializableTokenCache()
        if os.path.exists(self.token_cache_file):
            with open(self.token_cache_file, 'r') as f:
                cache.deserialize(f.read())
        return cache
    
    def _save_token_cache(self, cache):
        """Save token cache to file"""
        with open(self.token_cache_file, 'w') as f:
            f.write(cache.serialize())
    
    def check_authentication(self):
        """Check if user is authenticated"""
        cache = self._get_token_cache()
        client = msal.PublicClientApplication(
            self.app_id,
            authority=self.authority_url,
            token_cache=cache
        )
        accounts = client.get_accounts()
        return len(accounts) > 0
    
    def initiate_auth_flow(self):
        """Start device flow asynchronously, returning verification URI & user code immediately."""
        cache = self._get_token_cache()
        client = msal.PublicClientApplication(
            self.app_id,
            authority=self.authority_url,
            token_cache=cache
        )
        flow = client.initiate_device_flow(scopes=self.scopes)
        if 'user_code' not in flow:
            self._flow_status = 'error'
            self._flow_message = f"Device flow initiation failed: {flow}"
            raise Exception(self._flow_message)

        # Persist flow for debugging / potential future polling (optional)
        try:
            with open(self.device_flow_file, 'w') as f:
                json.dump(flow, f)
        except Exception:
            pass

        self._flow_status = 'pending'
        self._flow_message = flow.get('message')

        # Log the device code instructions for convenience in docker logs (dev only)
        try:
            print("[MSAL] Device code flow initiated.")
            print(f"[MSAL] Verification URL: {flow.get('verification_uri')}")
            print(f"[MSAL] User code: {flow.get('user_code')}")
            if flow.get('message'):
                print(f"[MSAL] Message: {flow.get('message')}")
        except Exception:
            pass

        # Launch background thread to wait for completion without blocking HTTP request
        threading.Thread(
            target=self._complete_device_flow,
            args=(client, cache, flow),
            daemon=True
        ).start()

        return {
            'verification_uri': flow.get('verification_uri'),
            'user_code': flow.get('user_code'),
            'expires_in': flow.get('expires_in'),
            'message': flow.get('message')
        }

    def _complete_device_flow(self, client, cache, flow):
        try:
            token_response = client.acquire_token_by_device_flow(flow)
            if 'access_token' in token_response:
                self._save_token_cache(cache)
                self._flow_status = 'authenticated'
            else:
                self._flow_status = 'error'
                self._flow_message = f"Auth failed: {token_response}"
        except Exception as e:
            self._flow_status = 'error'
            self._flow_message = str(e)
        finally:
            # Clean up device flow file
            if os.path.exists(self.device_flow_file):
                try:
                    os.remove(self.device_flow_file)
                except Exception:
                    pass

    def get_flow_status(self):
        return {
            'status': self._flow_status or 'inactive',
            'message': self._flow_message
        }
    
    def get_access_token(self):
        """Get valid access token"""
        cache = self._get_token_cache()
        client = msal.PublicClientApplication(
            self.app_id,
            authority=self.authority_url,
            token_cache=cache
        )
        
        accounts = client.get_accounts()
        if not accounts:
            raise Exception("Not authenticated. Please login first.")
        
        token_response = client.acquire_token_silent(
            self.scopes,
            account=accounts[0]
        )
        
        if not token_response or "access_token" not in token_response:
            # Token refresh failed, need to re-authenticate
            raise Exception("Token expired. Please re-authenticate.")
        
        return token_response['access_token']
    
    def clear_auth(self):
        """Clear authentication cache"""
        if os.path.exists(self.token_cache_file):
            os.remove(self.token_cache_file)
    
    def fetch_emails(self, count=20):
        """Fetch emails from Outlook"""
        access_token = self.get_access_token()
        endpoint = f"{self.base_url}me/messages?$top={count}"
        
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.get(endpoint, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch emails: {response.text}")
        
        data = response.json()
        emails = []
        
        for email_data in data.get('value', []):
            email = self._parse_email(email_data)
            emails.append(email)
        
        return emails
    
    def _parse_email(self, response):
        """Parse email object from MS Graph API"""
        email = {}
        try:
            email['id'] = response['id']
            email['subject'] = response.get('subject', 'No Subject')
            email['receivedDateTime'] = response.get('receivedDateTime', '')
            email['from'] = response.get('from', {}).get('emailAddress', {}).get('address', 'Unknown')
            
            # Handle to recipients
            to_recipients = response.get('toRecipients', [])
            if to_recipients:
                email['to'] = to_recipients[0].get('emailAddress', {}).get('address', 'Unknown')
            else:
                email['to'] = 'Unknown'
            
            # Get email body
            body_content = response.get('body', {}).get('content', '')
            email['body'] = self._extract_text_from_html(body_content)
            
            # Additional metadata
            email['isRead'] = response.get('isRead', False)
            email['importance'] = response.get('importance', 'normal')
            
        except (KeyError, IndexError) as e:
            print(f"Error parsing email: {e}")
        
        return email
    
    def _extract_text_from_html(self, html):
        """Extract text from HTML email body"""
        if not html:
            return ""
        
        soup = BeautifulSoup(html, "html.parser")
        
        # Remove script and style tags
        for tag in soup.find_all(["script", "style"]):
            tag.decompose()
        
        # Get text
        if soup.body:
            text = soup.body.get_text(separator="\n")
        else:
            text = soup.get_text(separator="\n")
        
        # Clean up text
        text = re.sub(r"[\r\n]+", "\n", text.strip())
        
        return text

    def send_mail(self, subject, body, to_address):
        """Send an email via MS Graph API."""
        access_token = self.get_access_token()
        endpoint = f"{self.base_url}me/sendMail"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        message = {
            "message": {
                "subject": subject,
                "body": {"contentType": "Text", "content": body},
                "toRecipients": [
                    {"emailAddress": {"address": to_address}}
                ]
            },
            "saveToSentItems": True
        }
        response = requests.post(endpoint, headers=headers, json=message)
        if response.status_code not in (202, 200):
            raise Exception(f"Failed to send mail: {response.status_code} {response.text}")
        return {"status": "sent"}