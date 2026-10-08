# MemoryMate

### Your personal AI-powered memory companion

MemoryMate is an AI-powered personal memory assistant designed to help you **remember the people, moments, preferences, conversations, and important details that matter to you**.

Built around open-source AI, MemoryMate turns scattered memories into an organized, searchable and intelligent personal memory space.

> **Built for a friend. Built with open innovation. Built to remember what matters. **

---

##  Why MemoryMate?

We remember thousands of small details about the people we care about:

* Their favorite things
* Important dates
* Things they told us
* Places they want to visit
* Gifts they might like
* Conversations we don't want to forget
* Small moments that become meaningful later

But remembering all of this manually is difficult.

** MemoryMate helps solve this problem by combining personal memory storage with an AI assistant that can understand and retrieve those memories when you need them.**

---

#  Features

##  AI Memory Assistant

Ask natural-language questions about your stored memories.

Examples:

```text
What does Rahul like?

When is Priya's birthday?

What did Rahul tell me about his trip?

What gift should I buy for Rahul?

Show me my recent memories.
```

The assistant is designed to use relevant stored memories instead of relying only on generic chatbot responses.

---

##  Smart Memory Management

Create and organize memories with useful information such as:

* Title
* Description
* Person
* Date
* Category
* Tags
* Importance
* Images
* Notes

Memories can be viewed, edited, searched and organized.

---

##  People Profiles

Create a dedicated profile for the people who matter to you.

A profile can contain:

* Name
* Interests
* Preferences
* Important dates
* Memories
* Events
* Gift ideas
* AI-generated insights

This allows MemoryMate to build a richer context around each person.

---

##  GiftMate

Get personalized gift ideas based on stored memories.

Example:

```text
Person: Rahul

Known interests:
• Photography
• Travel
• Technology

AI suggestion:
Photography accessories

Reason:
Rahul previously mentioned his interest in photography
and wanting to upgrade his camera equipment.
```

The goal is to make recommendations based on **your memories**, rather than generic suggestions.

---

##  Events & Important Dates

Keep track of:

* Birthdays
* Anniversaries
* Meetings
* Plans
* Important occasions
* Personal reminders

Associate events with people and memories to keep important information connected.

---

##  Memory Timeline

View memories chronologically.

The timeline helps you see how your memories and experiences evolve over time.

Filter memories by:

* Person
* Category
* Date
* Tags

---

##  Smart Search

Search across your personal memory collection.

Search can cover:

* Memories
* People
* Events
* Tags
* Gift ideas

Instead of manually browsing through everything, you can search for what you remember.

---

##  Voice Input

Capture memories using your voice.

The voice workflow is designed to allow you to:

```text
Speak
 ↓
Speech recognition
 ↓
Review text
 ↓
Save as memory
```

This makes recording a memory faster when typing isn't convenient.

---

##  AI Text-to-Speech

AI responses can be read aloud using the browser's text-to-speech functionality.

Useful when you want to listen instead of reading.

---

##  Personal Insights

MemoryMate can analyze stored information to provide useful insights such as:

* Frequently remembered people
* Common interests
* Upcoming important dates
* Memory categories
* Potential gift opportunities

AI-generated insights are kept separate from confirmed stored facts.

---

#  Open-Source AI

Open-source AI is at the core of MemoryMate.

The project is designed around the idea that personal memories should not have to depend entirely on closed AI systems.

### Why open innovation matters

Using open/open-weight AI provides opportunities for:

* Greater control over the AI system
* Ability to experiment with different models
* More flexibility in deployment
* Potential local inference
* Greater transparency
* Easier customization
* Reduced dependency on a single closed provider

MemoryMate is designed so that the AI layer can evolve as better open models become available.

---

#  Architecture

The project follows a full-stack architecture:

```text
                    ┌─────────────────────┐
                    │      User           │
                    │  Desktop / Mobile   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │  MemoryMate UI      │
                    │  AI Chat            │
                    │  Memories           │
                    │  People             │
                    │  Events             │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │                     │
                    │ Authentication      │
                    │ Memory APIs         │
                    │ AI APIs             │
                    │ Event APIs          │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │    Database     │        │   Open-source   │
        │                 │        │       AI        │
        │ MongoDB Atlas   │        │     Gemma       │
        └─────────────────┘        └─────────────────┘
```

---

#  Tech Stack

## Frontend

* React
* Vite
* JavaScript
* Responsive CSS
* Framer Motion
* Modern component-based UI

## Backend

* Python
* FastAPI
* Uvicorn
* REST APIs

## Database

* MongoDB
* MongoDB Atlas

## Development

* Git
* GitHub
* DevRelay

## Deployment

* Render

---

#  Project Structure

```text
MemoryMate/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ai/
│   │   ├── core/
│   │   ├── database/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── ...
│
├── README.md
└── .gitignore
```

---

---

## 1. Clone the repository

```bash
git clone https://github.com/himanshugangwar5752-demo/MemoryMate.git
```

Move into the project:

```bash
cd MemoryMate
```

---

#  Frontend Setup

Move into the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

#  Backend Setup

Open another terminal.

Move into the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API documentation will be available at:

```text
http://localhost:8000/docs
```

---

#  Environment Variables

Create a `.env` file in the appropriate backend/frontend location according to the project configuration.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=memorymate

AI_MODEL=your_open_source_model

SECRET_KEY=your_secret_key
```

###  Security

Never commit:

```text
.env
.env.local
API keys
database passwords
authentication tokens
private credentials
```

Use `.env.example` to document required variables without exposing secrets.

---

#  Mobile Development

To test the application on a phone connected to the same Wi-Fi network:

Start Vite with:

```bash
npm run dev -- --host 0.0.0.0
```

Then use your computer's local network IP:

```text
http://YOUR_LOCAL_IP:5173
```

The backend must also be configured to accept connections from the local network.

---

#  Testing

Run frontend checks/build:

```bash
npm run build
```

Backend tests:

```bash
pytest
``` 
