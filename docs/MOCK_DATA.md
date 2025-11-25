# Mock Inbox and Prompt Templates

This file documents the mock inbox (JSON) used for local testing and the default prompt templates used by the Cohere integration.

## Mock Inbox (`backend/data/mock_inbox.json`)

Contains 15 representative emails covering meetings, newsletters, spam, task requests, financial notices, alerts, and internal requests. Use this file for local development when the real mailbox is not available.

Key fields per email:

- `id`: unique id
- `from`, `to`, `subject`, `receivedDateTime`
- `body`: plain text email body
- `isRead`: boolean
- `importance`: `low`/`normal`/`high`

You can load this in backend tests or seed a small SQLite file by importing the JSON.

## Default Prompt Templates (`backend/data/prompts.json`)

1. Categorization Prompt

"Categorize emails into: Important, Newsletter, Spam, To-Do.\nTo-Do emails must include a direct request requiring user action. Respond with ONLY the category name."

2. Action Item Extraction Prompt

"Extract tasks from the email. Respond in JSON: `[ { \"task\": \"...\", \"deadline\": \"...\" } ]`. If no tasks, return `[]`."

3. Auto-Reply Draft Prompt

"If an email is a meeting request, draft a polite reply asking for an agenda. If it's a task request, confirm receipt and provide a tentative timeline. Write only the email body."

---

These files are intended for development and testing. Keep `prompts.json` under version control; `mock_inbox.json` can be used to seed demo runs or unit tests.
