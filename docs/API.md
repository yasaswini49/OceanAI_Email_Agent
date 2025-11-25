# OceanAI Email Agent - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Check Authentication Status

**GET** `/auth/status`

Check if user is authenticated with Microsoft Outlook.

**Response:**

```json
{
  "authenticated": true,
  "user_email": "user@example.com",
  "expiry": "2025-12-25T10:00:00Z"
}
```

**Error (401):**

```json
{
  "authenticated": false,
  "message": "Not authenticated"
}
```

---

### 2. Initiate Microsoft Login

**POST** `/auth/login`

Initiates Microsoft Outlook authentication flow.

**Response:**

```json
{
  "auth_url": "https://login.microsoftonline.com/...",
  "message": "Please complete authentication in the new window"
}
```

---

### 3. Logout (NEW FEATURE)

**POST** `/auth/logout`

Logs out the current user and clears authentication tokens.

**Response:**

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## Email Endpoints

### 4. Fetch Emails from Outlook

**POST** `/emails/fetch`

Retrieves emails from the authenticated user's Outlook mailbox.

**Request Body:**

```json
{
  "count": 20
}
```

**Response:**

```json
{
  "success": true,
  "emails": [
    {
      "id": "AAMkADM5ZDU...",
      "subject": "Project Update",
      "from": "colleague@company.com",
      "body": "Here's the latest project status...",
      "receivedDateTime": "2025-11-25T10:30:00Z",
      "category": "Work",
      "actionItems": [
        {
          "task": "Review proposal",
          "deadline": "2025-11-26",
          "priority": "High"
        }
      ]
    }
  ],
  "count": 20
}
```

**Error:**

```json
{
  "success": false,
  "error": "Failed to fetch emails",
  "details": "..."
}
```

---

### 5. Process Emails with AI

**POST** `/emails/process`

Analyzes emails using Cohere AI for classification and action items.

**Request Body:**

```json
{
  "emails": [
    {
      "id": "AAMkADM5ZDU...",
      "subject": "Meeting Request",
      "from": "manager@company.com",
      "body": "Can we meet tomorrow?"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "processed_emails": [
    {
      "id": "AAMkADM5ZDU...",
      "subject": "Meeting Request",
      "category": "Meetings",
      "actionItems": [
        {
          "task": "Schedule meeting with manager",
          "deadline": "2025-11-26",
          "priority": "High"
        }
      ],
      "summary": "Manager requesting a meeting for tomorrow"
    }
  ]
}
```

---

### 6. Generate Email Reply

**POST** `/emails/generate-reply`

Uses Cohere AI to draft a reply to an email.

**Request Body:**

```json
{
  "email": {
    "id": "AAMkADM5ZDU...",
    "subject": "Project Status",
    "from": "client@company.com",
    "body": "What's the current status of the project?"
  }
}
```

**Response:**

```json
{
  "success": true,
  "draft": {
    "id": "draft_123",
    "subject": "Re: Project Status",
    "content": "Thank you for your inquiry. The project is progressing well. We expect to have the first phase completed by...",
    "created_at": "2025-11-25T11:00:00Z"
  }
}
```

---

## Chat/Assistant Endpoints

### 7. Chat with AI Assistant

**POST** `/chat`

Chat with the OceanAI assistant about your emails.

**Request Body:**

```json
{
  "message": "Summarize my most important emails",
  "context": {
    "emails": [
      {
        "subject": "Urgent: Contract Review",
        "category": "Work",
        "from": "legal@company.com"
      }
    ],
    "selectedEmail": null,
    "stats": {
      "total": 45,
      "important": 8,
      "spam": 3,
      "todos": 5
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "response": "You have 45 total emails with 8 marked as important. The most urgent item is a contract review from legal@company.com that requires immediate attention. You also have 5 pending action items to complete."
}
```

---

## Prompts Endpoint

### 8. Get AI Prompts

**GET** `/prompts`

Retrieves the current AI prompt templates used for email processing.

**Response:**

```json
{
  "classification": "You are an expert email classifier...",
  "action_items": "Extract specific action items...",
  "reply_generation": "You are an email assistant...",
  "chat_assistant": "You are an intelligent email assistant..."
}
```

---

## Error Codes

| Code | Meaning      | Solution                                      |
| ---- | ------------ | --------------------------------------------- |
| 400  | Bad Request  | Check request body format                     |
| 401  | Unauthorized | User needs to authenticate with `/auth/login` |
| 403  | Forbidden    | User doesn't have required permissions        |
| 404  | Not Found    | Endpoint or resource doesn't exist            |
| 500  | Server Error | Backend error - check logs                    |

---

## Example Workflow

### 1. Authenticate User

```bash
curl -X POST http://localhost:5000/api/auth/login
```

### 2. Check Authentication

```bash
curl http://localhost:5000/api/auth/status
```

### 3. Fetch Emails

```bash
curl -X POST http://localhost:5000/api/emails/fetch \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'
```

### 4. Process Emails with AI

```bash
curl -X POST http://localhost:5000/api/emails/process \
  -H "Content-Type: application/json" \
  -d '{"emails": [...]}'
```

### 5. Chat with Assistant

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarize important emails", "context": {...}}'
```

### 6. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout
```

---

## Response Format

All responses follow this format:

**Success (2xx):**

```json
{
  "success": true,
  "data": {...}
}
```

**Error (4xx, 5xx):**

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error information"
}
```

---

## Rate Limiting

No rate limiting is currently implemented. For production deployment, consider adding:

- IP-based rate limiting
- User-based quota
- API key authentication

See `DEPLOYMENT.md` for production guidelines.

---

## CORS Headers

The API accepts requests from:

- `http://localhost:3000` (development)
- Add production URL in DEPLOYMENT.md

---

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/status
```

### Using Postman

1. Import the API endpoints listed above
2. Set base URL to `http://localhost:5000/api`
3. Test each endpoint with sample data

### Using Frontend

Open `http://localhost:3000` and interact with the UI.

---

For deployment instructions, see `DEPLOYMENT.md`
