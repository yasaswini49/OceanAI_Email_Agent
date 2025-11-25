import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # Microsoft Graph
    MS_APP_ID = os.getenv('APPLICATION_ID')
    MS_AUTHORITY = 'https://login.microsoftonline.com/common/'
    MS_SCOPES = ['Mail.Read', 'Mail.ReadWrite', 'Mail.ReadBasic']
    
    # Cohere
    COHERE_API_KEY = os.getenv('COHERE_API_KEY')
    COHERE_MODEL = 'command-r-plus-08-2024'
    
    # Storage
    DATA_DIR = 'data'
    TOKEN_CACHE_FILE = os.path.join(DATA_DIR, 'ms_token_cache.json')
    PROMPTS_FILE = os.path.join(DATA_DIR, 'prompts.json')
    
    # API Settings
    MAX_EMAILS_FETCH = 100
    DEFAULT_EMAIL_COUNT = 20
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        required = ['MS_APP_ID', 'COHERE_API_KEY']
        missing = [key for key in required if not getattr(Config, key)]
        
        if missing:
            raise ValueError(f"Missing required config: {', '.join(missing)}")