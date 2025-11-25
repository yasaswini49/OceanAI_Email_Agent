# OceanAI Email Agent

**AI-Powered Email Management for Maritime Logistics**

An intelligent email management system that uses Microsoft Outlook integration and Cohere AI to classify, analyze, and draft professional email responses. Fully containerized with Docker for seamless deployment.

---

## 📚 Documentation

All documentation is organized in the `/docs` folder:

### 🚀 [Getting Started - SETUP.md](./docs/SETUP.md)

- Docker setup and configuration
- Environment variables configuration
- Microsoft Azure and Cohere API integration
- Troubleshooting guide

### 📖 [API Reference - API.md](./docs/API.md)

- Complete API endpoint documentation
- Authentication and authorization
- Email management endpoints
- Chat and assistant features
- Error codes and responses
- Example requests and workflows

### 🌍 [Deployment Guide - DEPLOYMENT.md](./docs/DEPLOYMENT.md)

- Docker Compose production deployment
- Security best practices
- Monitoring and logging
- Scaling and performance optimization

---

## 🎯 Quick Start (Docker)

1. **Create Environment File**

   ```bash
   # Copy and edit .env file in project root
   APPLICATION_ID=your_azure_app_id
   COHERE_API_KEY=your_cohere_key
   ```

2. **Build and Run**

   ```bash
   docker compose build
   docker compose up -d
   ```

3. **Access Application**
   - Application: `http://localhost` (via Nginx)
   - Backend API: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

For detailed setup instructions, see **[SETUP.md](./docs/SETUP.md)**

---

## 🏗️ Project Structure

```
OceanAI/
├── backend/
│   ├── Dockerfile                 # Backend container definition
│   ├── .dockerignore              # Docker build exclusions
│   ├── app.py                     # Flask application
│   ├── config.py                  # Configuration
│   ├── requirements.txt           # Python dependencies
│   ├── data/
│   │   ├── ms_token_cache.json    # Azure auth tokens
│   │   └── prompts.json           # AI prompts
│   └── services/
│       ├── ms_graph_service.py    # Microsoft Graph API
│       ├── cohere_service.py      # Cohere AI service (Chat API)
│       └── email_processor.py     # Email processing logic
│
├── frontend/
│   ├── Dockerfile                 # Frontend container definition
│   ├── .dockerignore              # Docker build exclusions
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API service layer
│   │   └── utils/                 # Helper functions
│   ├── package.json
│   └── tailwind.config.js
│
├── nginx/
│   └── default.conf               # Nginx reverse proxy config
│
├── docker-compose.yml             # Multi-container orchestration
│
├── docs/
│   ├── SETUP.md                   # Setup and installation guide
│   ├── API.md                     # API reference documentation
│   └── DEPLOYMENT.md              # Production deployment guide
│
└── README.md                      # This file
```

---

## ✨ Key Features

### 📧 Email Management

- Fetch emails directly from Microsoft Outlook via MS Graph API
- Automatic email classification using Cohere Chat API
- Extract action items from emails with AI
- Generate professional reply drafts
- Send replies directly through Outlook
- Organize emails by category

### 🤖 AI-Powered Assistance

- Intelligent email classification (Work, Meetings, Clients, Spam, etc.)
- Professional reply generation with context awareness
- Interactive chat interface with AI assistant
- Email summarization and insights
- Action item extraction with priority levels

### 🔐 Security

- Microsoft OAuth2 device code flow authentication
- Secure token storage and caching
- Async authentication with status polling
- Logout and session management

### 📱 User Interface

- Modern marine-themed dashboard with glassmorphism effects
- Real-time email processing with visual feedback
- Responsive design with Tailwind CSS
- Draft management and editing
- Professional gradient animations

---

## 🛠️ Technology Stack

### Backend

- **Flask** - Web framework
- **Gunicorn** - Production WSGI server
- **Python 3.12** - Programming language
- **MSAL** - Microsoft authentication (device code flow)
- **Cohere AI** - Natural language processing (Chat API)
- **MS Graph API** - Email management and sending
- **Docker** - Containerization

### Frontend

- **React 18** - UI framework
- **Tailwind CSS** - Modern styling with glassmorphism
- **Lucide React** - Icon system
- **Axios** - HTTP client
- **serve** - Static file hosting
- **Docker** - Containerization

### Infrastructure

- **Nginx** - Reverse proxy and load balancer
- **Docker Compose** - Multi-container orchestration

---

## 🚀 Deployment

### Docker Compose (Recommended)

```powershell
# Build all services
docker compose build

# Start services
docker compose up -d

# View logs
docker logs oceanai-backend-1 --tail 100
docker logs oceanai-frontend-1 --tail 100

# Stop services
docker compose down
```

### Individual Service Management

```powershell
# Rebuild specific service
docker compose build backend
docker compose up -d backend

# Restart service
docker compose restart frontend

# Check service health
docker ps
```

---

## 📝 API Endpoints

All endpoints are documented in **[API.md](./docs/API.md)**

### Authentication

- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/login` - Initiate Microsoft device code flow
- `GET /api/auth/login/status` - Poll device flow completion status
- `POST /api/auth/logout` - Logout and clear session

### Email Management

- `POST /api/emails/fetch` - Fetch emails from Outlook
- `POST /api/emails/process` - Process emails with Cohere AI
- `POST /api/emails/generate-reply` - Generate AI reply draft
- `POST /api/emails/send-reply` - Send draft via MS Graph

### Chat & Prompts

- `POST /api/chat` - Chat with Cohere AI assistant
- `GET /api/prompts` - Get AI prompt templates
- `POST /api/prompts` - Update prompt templates

### Health Check

- `GET /api/health` - Service health status

---

## 🔑 Environment Variables

Create `.env` file in project root:

```env
# Microsoft Azure Configuration
APPLICATION_ID=your_azure_application_id

# Cohere AI
COHERE_API_KEY=your_cohere_api_key

# Flask Configuration (optional, has defaults)
FLASK_ENV=production
```

**Required Scopes for MS Graph:**

- Mail.Read
- Mail.ReadWrite
- Mail.ReadBasic

For production setup, see **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

---

## 🐛 Troubleshooting

### Docker Issues

**Container build fails:**

```powershell
# Clean build cache and retry
docker compose build --no-cache
docker compose up -d
```

**Port conflicts:**

```powershell
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :80

# Kill process or change ports in docker-compose.yml
```

**View container logs:**

```powershell
docker logs oceanai-backend-1
docker logs oceanai-frontend-1
docker logs oceanai-nginx-1
```

### Backend Issues

**Cohere API errors (404):**

- Ensure `cohere_service.py` uses Chat API (`client.chat(message=...)`)
- Update Cohere SDK: `pip install --upgrade cohere`

**MS Graph authentication fails:**

- Verify `APPLICATION_ID` in `.env`
- Check device code appears in docker logs: `docker logs oceanai-backend-1 --tail 100`
- Ensure Azure app has Mail.Read, Mail.ReadWrite scopes

### Frontend Issues

**Cannot connect to backend:**

- Verify all containers running: `docker ps`
- Check Nginx proxy config in `nginx/default.conf`
- Ensure backend health: `curl http://localhost:5000/api/health`

**Build fails:**

```powershell
# Rebuild frontend from scratch
docker compose build --no-cache frontend
docker compose up -d frontend
```

See **[SETUP.md](./docs/SETUP.md)** for detailed troubleshooting.

---

## 📞 Support

### Documentation

- Setup issues: See **[SETUP.md](./docs/SETUP.md)**
- API questions: See **[API.md](./docs/API.md)**
- Deployment help: See **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

### Common Tasks

**View real-time logs:**

```powershell
docker logs -f oceanai-backend-1
```

**Update AI prompts:**

- Edit `backend/data/prompts.json`
- Restart backend: `docker compose restart backend`

**Rebuild after code changes:**

```powershell
docker compose build
docker compose up -d
```

**Check service health:**

```powershell
# PowerShell
Invoke-RestMethod http://localhost:5000/api/health
```

---

## 🎉 Getting Started

1. Read **[SETUP.md](./docs/SETUP.md)** for Docker setup
2. Configure API credentials (Azure APPLICATION_ID, Cohere API key)
3. Create `.env` file in project root
4. Run `docker compose up -d`
5. Open `http://localhost` (or `http://localhost:3000`)
6. Click "Connect Outlook" and follow device code flow

---

**For detailed information, see the documentation in the `/docs` folder.**
