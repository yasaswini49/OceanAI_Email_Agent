# OceanAI Email Agent - Setup Guide

## Overview

OceanAI Email Agent is an AI-powered email management system designed for maritime logistics companies. It uses Microsoft Outlook integration via MS Graph API and Cohere Chat API to classify, analyze, and draft email responses. The application is fully containerized using Docker for consistent deployment across environments.

## Prerequisites

### System Requirements

- **Docker Desktop** (Windows, Mac, or Linux)
- **Docker Compose** (included with Docker Desktop)
- **PowerShell** 5.1+ (Windows) or compatible shell

### Required API Accounts

- **Microsoft Azure** account (for MS Graph API and device code authentication)
- **Cohere AI** account (for natural language processing)

## Quick Start (Docker)

### 1. Clone or Navigate to Project

```powershell
cd C:\OceanAI
```

### 2. Configure Environment Variables

Create a `.env` file in the project root directory (`C:\OceanAI\.env`):

```env
# Microsoft Graph API Configuration
APPLICATION_ID=your_azure_application_id

# Cohere AI Configuration
COHERE_API_KEY=your_cohere_api_key

# Flask Configuration (optional - has defaults)
FLASK_ENV=production
```

### 3. Build and Start Services

```powershell
# Build all containers
docker compose build

# Start all services
docker compose up -d

# Verify services are running
docker ps
```

You should see three containers running:

- `oceanai-backend-1` (Flask API on port 5000)
- `oceanai-frontend-1` (React app on port 3000)
- `oceanai-nginx-1` (Reverse proxy on port 80)

### 4. Access the Application

- **Main Application:** http://localhost (via Nginx)
- **Direct Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

### 5. Verify Installation

```powershell
# Check backend health
Invoke-RestMethod http://localhost:5000/api/health

# View backend logs
docker logs oceanai-backend-1 --tail 50

# View frontend logs
docker logs oceanai-frontend-1 --tail 50
```

---

## API Configuration

### Get Microsoft Azure Credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App Registrations**
3. Click **New Registration**
   - Name: `OceanAI Email Agent`
   - Supported account types: `Single tenant` or `Multitenant`
   - Redirect URI: Leave blank (device code flow doesn't need it)
4. After creation, copy the **Application (client) ID** to your `.env` as `APPLICATION_ID`
5. Go to **API Permissions**
   - Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
   - Add these permissions:
     - `Mail.Read`
     - `Mail.ReadWrite`
     - `Mail.ReadBasic`
   - Click **Grant admin consent** (if you have admin rights)
6. No client secret needed (device code flow uses public client)

### Get Cohere API Key

1. Visit [Cohere Dashboard](https://dashboard.cohere.ai)
2. Sign up or log in
3. Navigate to **API Keys**
4. Generate a new API key or copy existing one
5. Add it to `.env` as `COHERE_API_KEY`

### Update and Restart

After updating `.env`:

```powershell
# Restart backend to pick up new environment variables
docker compose restart backend

# Or rebuild if you made code changes
docker compose build backend
docker compose up -d backend
```

---

## Microsoft Outlook Authentication (Device Code Flow)

### How It Works

1. User clicks "Connect Outlook" button in frontend
2. Frontend calls `/api/auth/login` endpoint
3. Backend initiates device code flow and returns:
   - `verification_uri` (Microsoft login page)
   - `user_code` (code to enter)
   - `expires_in` (time limit)
4. Frontend opens verification URL and displays user code
5. Frontend polls `/api/auth/login/status` every 5 seconds
6. User enters code at Microsoft login page and grants permissions
7. Backend completes authentication in background thread
8. Status endpoint returns "authenticated" when complete
9. User can now fetch and send emails

### Device Code Flow in Docker Logs

The backend logs the authentication details for convenience:

```powershell
docker logs oceanai-backend-1 --tail 50
```

You'll see:

```
[MSAL] Device code flow initiated.
[MSAL] Verification URL: https://microsoft.com/devicelogin
[MSAL] User code: ABCD1234
[MSAL] Message: To sign in, use a web browser...
```

### First-Time Setup

- Ensure `.env` has correct `APPLICATION_ID`
- First login will prompt for app permissions
- Grant "Allow" to Mail.Read, Mail.ReadWrite permissions
- Token is cached in `backend/data/ms_token_cache.json`
- Cached tokens are persisted via Docker volume

---

## Docker Architecture

```
┌──────────────────────────────────────────────┐
│            Client Browser                     │
│         http://localhost:80                   │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│          Nginx (Port 80)                      │
│   - Reverse proxy                             │
│   - Routes /api/* → backend                   │
│   - Routes /* → frontend                      │
└──────┬────────────────────────┬───────────────┘
       │                        │
       │                        │
┌──────▼─────────────┐  ┌───────▼──────────────┐
│  Backend           │  │   Frontend            │
│  Flask + Gunicorn  │  │   React + serve       │
│  Port 5000         │  │   Port 3000           │
│                    │  │                       │
│  Services:         │  │   Components:         │
│  - MS Graph API    │  │   - HomePage          │
│  - Cohere Chat API │  │   - InboxPage         │
│  - Email Processor │  │   - DraftsPage        │
│                    │  │   - AgentPage         │
└────────────────────┘  └──────────────────────┘
         │
         │ (Persistent volume)
         ▼
┌────────────────────┐
│  ./backend/data/   │
│  - Token cache     │
│  - Prompts JSON    │
└────────────────────┘
```

### Services

**backend** (`oceanai-backend-1`)

- Flask API with Gunicorn
- Python 3.12-slim base image
- Exposes port 5000
- Volume mounts `./backend/data` for persistence

**frontend** (`oceanai-frontend-1`)

- React application built and served with `serve`
- Node 18-alpine base image
- Exposes port 3000
- Stateless (no volumes needed)

**nginx** (`oceanai-nginx-1`)

- Nginx reverse proxy
- Routes traffic to backend and frontend
- Exposes port 80
- Configuration mounted from `./nginx/default.conf`

---

## Project Structure

```
C:\OceanAI\
├── backend/
│   ├── Dockerfile                 # Multi-stage Python build
│   ├── .dockerignore              # Exclude __pycache__, .env
│   ├── app.py                     # Flask application entry point
│   ├── config.py                  # Configuration management
│   ├── requirements.txt           # Python dependencies
│   ├── data/                      # Persistent data (Docker volume)
│   │   ├── ms_token_cache.json    # Azure OAuth tokens
│   │   ├── prompts.json           # Cohere AI prompts
│   │   └── device_flow.json       # Temp device flow state
│   └── services/
│       ├── __init__.py
│       ├── cohere_service.py      # Cohere Chat API integration
│       ├── email_processor.py     # Email business logic
│       └── ms_graph_service.py    # MS Graph API + auth
│
├── frontend/
│   ├── Dockerfile                 # Multi-stage Node build
│   ├── .dockerignore              # Exclude node_modules
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.tsx                # Main app component
│   │   ├── index.js               # React entry point
│   │   ├── index.css              # Tailwind CSS + custom styles
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── EmailList.jsx
│   │   │   ├── EmailDetail.jsx
│   │   │   └── Notification.jsx
│   │   ├── pages/                 # Page-level components
│   │   │   ├── HomePage.jsx       # Main dashboard
│   │   │   ├── InboxPage.jsx      # Email list view
│   │   │   ├── DraftsPage.jsx     # Draft management
│   │   │   └── AgentPage.jsx      # AI chat interface
│   │   ├── services/
│   │   │   └── api.js             # Backend API client
│   │   └── utils/
│   │       └── helpers.js         # Utility functions
│   ├── package.json
│   └── tailwind.config.js         # Tailwind configuration
│
├── nginx/
│   └── default.conf               # Nginx reverse proxy config
│
├── docker-compose.yml             # Multi-container orchestration
├── .env                           # Environment variables (create this)
│
└── docs/
    ├── SETUP.md                   # This file
    ├── API.md                     # API reference
    └── DEPLOYMENT.md              # Production deployment
```

---

## Troubleshooting

### Docker Issues

**Containers won't start:**

```powershell
# Check container status
docker ps -a

# View logs for specific service
docker logs oceanai-backend-1
docker logs oceanai-frontend-1
docker logs oceanai-nginx-1

# Restart all services
docker compose down
docker compose up -d
```

**Port conflicts:**

```powershell
# Check what's using ports 80, 3000, 5000
netstat -ano | findstr :80
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Stop conflicting process or change ports in docker-compose.yml
```

**Build failures:**

```powershell
# Clean build without cache
docker compose build --no-cache

# Remove all containers and rebuild
docker compose down
docker compose up -d --build
```

**Volume permission issues (Windows):**

Ensure Docker Desktop has access to C:\ drive:

- Open Docker Desktop → Settings → Resources → File Sharing
- Add C:\ if not present

### Backend Issues

**Cohere API 404 errors:**

```powershell
# Check logs for specific error
docker logs oceanai-backend-1 --tail 100 | Select-String "error"

# Verify Cohere SDK version (should use chat() not generate())
docker exec oceanai-backend-1 pip show cohere
```

**MS Graph authentication fails:**

```powershell
# Verify APPLICATION_ID is set
docker exec oceanai-backend-1 env | findstr APPLICATION

# Check device code flow logs
docker logs oceanai-backend-1 | Select-String "MSAL"

# Test auth endpoint
Invoke-RestMethod http://localhost:5000/api/auth/status
```

**Flask app not responding:**

```powershell
# Check if Gunicorn started
docker logs oceanai-backend-1 | Select-String "Listening"

# Test health endpoint
Invoke-RestMethod http://localhost:5000/api/health

# Restart backend
docker compose restart backend
```

### Frontend Issues

**Cannot connect to backend:**

```powershell
# Verify backend is healthy
Invoke-RestMethod http://localhost:5000/api/health

# Check Nginx configuration
docker exec oceanai-nginx-1 nginx -t

# View Nginx access logs
docker logs oceanai-nginx-1

# Restart Nginx
docker compose restart nginx
```

**React build fails:**

```powershell
# Check build logs
docker logs oceanai-frontend-1

# Rebuild frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

**Blank page or errors in browser:**

- Open browser DevTools (F12) → Console tab
- Look for network errors or API connection failures
- Verify frontend can reach backend: `http://localhost:5000/api/health`

### Environment Variable Issues

**Variables not loading:**

```powershell
# Verify .env file exists in project root
Get-Content .env

# Restart services to pick up changes
docker compose down
docker compose up -d

# Check if backend received variables
docker exec oceanai-backend-1 env | findstr -i "application cohere"
```

### Network Issues

**Services can't communicate:**

```powershell
# Inspect Docker network
docker network inspect oceanai_default

# Test backend from frontend container
docker exec oceanai-frontend-1 wget -O- http://backend:5000/api/health

# Test connectivity from host
curl http://localhost:5000/api/health
curl http://localhost:3000
```

---

## Development Workflow

### Making Code Changes

**Backend changes:**

```powershell
# Edit Python files in backend/
# Rebuild and restart
docker compose build backend
docker compose up -d backend

# View logs
docker logs -f oceanai-backend-1
```

**Frontend changes:**

```powershell
# Edit React files in frontend/src/
# Rebuild and restart
docker compose build frontend
docker compose up -d frontend

# View logs
docker logs -f oceanai-frontend-1
```

**Nginx configuration changes:**

```powershell
# Edit nginx/default.conf
# Restart Nginx (no rebuild needed)
docker compose restart nginx
```

### Updating Dependencies

**Backend (Python):**

```powershell
# Edit backend/requirements.txt
# Rebuild with no cache
docker compose build --no-cache backend
docker compose up -d backend
```

**Frontend (Node):**

```powershell
# Edit frontend/package.json
# Rebuild with no cache
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Resetting the Application

**Clear authentication tokens:**

```powershell
# Remove token cache
Remove-Item backend\data\ms_token_cache.json -ErrorAction SilentlyContinue

# Restart backend
docker compose restart backend
```

**Complete reset:**

```powershell
# Stop all services
docker compose down

# Remove all containers, networks, volumes
docker compose down -v

# Clean backend data
Remove-Item backend\data\* -Force -ErrorAction SilentlyContinue

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d
```

---

## Monitoring

### View Live Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker logs -f oceanai-backend-1
docker logs -f oceanai-frontend-1

# Last 100 lines
docker logs --tail 100 oceanai-backend-1
```

### Check Resource Usage

```powershell
# Container stats (CPU, memory)
docker stats

# Disk usage
docker system df
```

### Health Checks

```powershell
# Backend health
Invoke-RestMethod http://localhost:5000/api/health | ConvertTo-Json

# Check authentication status
Invoke-RestMethod http://localhost:5000/api/auth/status

# Test chat endpoint
$body = @{
    message = 'Hello'
    context = @{ emails = @(); stats = @{} }
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/chat `
    -Body $body -ContentType 'application/json'
```

---

## Next Steps

1. **Complete API Configuration** (see "API Configuration" section above)
2. **Test Authentication Flow:**
   - Open http://localhost
   - Click "Connect Outlook"
   - Follow device code flow
   - Verify token cached in `backend/data/ms_token_cache.json`
3. **Fetch and Process Emails**
4. **Generate and Send Replies**
5. **Chat with AI Assistant**

For detailed API documentation, see `API.md`  
For production deployment, see `DEPLOYMENT.md`
