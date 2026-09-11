# Cadence - Modern Digital Calendar

A modern, AI-powered calendar application with a simple and stunning visual interface. Cadence combines traditional calendar functionality with intelligent chat assistance to help you manage your events effortlessly.

<img width="1919" height="960" alt="Screenshot 2026-09-11 204417" src="https://github.com/user-attachments/assets/4744408f-3efd-4e0e-9908-cbb95b2c4b7e" />
<img width="1919" height="961" alt="Screenshot 2026-09-11 204135" src="https://github.com/user-attachments/assets/b7a8b839-8a54-4b08-ac87-35f150b4d026" />
<img width="1919" height="960" alt="Screenshot 2026-09-11 204336" src="https://github.com/user-attachments/assets/e09e4c5d-3d9e-4dfa-becf-5c1f9a4ab072" />
<img width="1919" height="958" alt="Screenshot 2026-09-11 204356" src="https://github.com/user-attachments/assets/fed119e3-bfa9-4d8c-8eae-72edc391b12f" />
<img width="1919" height="959" alt="Screenshot 2026-09-11 204211" src="https://github.com/user-attachments/assets/05b9f8a0-7725-43b0-9a10-2d28b4b16c72" />
<img width="1919" height="960" alt="Screenshot 2026-09-11 204238" src="https://github.com/user-attachments/assets/f0ce5290-db5a-44e0-977b-d78af0560273" />


## Project Goal & Journey

Glassmorphism looks great and reads terribly — most implementations sacrifice legibility for the aesthetic. Cadence was my attempt to solve that: hand-picked wallpapers paired with tunable blur and brightness, so the frosted-glass effect stays legible instead of just decorative.

The other goal was making the AI assistant more than a gimmick. The AI assistant is intent-based, not database-connected — Gemini interprets requests and returns structured commands that the backend validates before touching Supabase. So when the user says — “move my dentist appointment to Monday” — it is executed instantly.

## Features

- **Event Creation & Editing**: Create events with titles, dates, times, descriptions, and custom colors
- **Natural Language Commands**: Create, update, and delete events using conversational language
- **Recurring Events**: Set up daily, weekly, monthly, or yearly recurrence patterns
- **Event Series Management**: Edit or delete individual instances or entire event series
- **Visual Calendar View**: Navigate through months and see your events at a glance
- **Smart Event Parsing**: AI understands event details from your messages
- **Context-Aware**: The chat knows your existing events for summarisation

## **How the AI Assistant Works**

Gemini never touches the database directly — it only handles language in, structured intent out.

1. **User sends a message** (e.g. "move my dentist appointment to next Monday") through the chat interface.
2. **Gemini identifies intent** and returns a natural-language reply alongside a structured JSON command, using a format it's been prompted to follow — something like:

json

```json
{ "action": "update", "event_id": "evt_1234", "changes": { "date": "2025-06-09" } }
```

1. **The backend parses and validates** the command before anything touches the database — malformed or unrecognized commands are rejected rather than executed.
2. **Helper functions apply the change** to Supabase on the command's behalf.

## Tech Stack

### Frontend
![REACT](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![SUPABASE](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
- **React 19** - Modern React with hooks
- **React Calendar** - Calendar component
- **Supabase Client** - Backend-as-a-Service for auth and database
- **Google Generative AI** - Gemini AI for chat interface
- **CSS3** - Custom styling with CSS variables and animations

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **PostgreSQL** - Database (via Supabase)
- **Express Rate Limit** - API rate limiting
- **Serverless HTTP** - Netlify deployment support

## Project Structure

```
cadence-app/
├── client/                     # React frontend
│   ├── public/
│   │   ├── fonts/              # Custom fonts
│   │   └── wallpapers/         # Wallpaper images
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # React contexts (AuthContext)
│   │   ├── lib/                # Utilities (Supabase, Gemini, recurrence utils)
│   │   ├── pages/              # Page components
│   │   ├── styles/             # CSS styles
│   │   ├── App.js              # Main app component
│   │   ├── CalendarView.js     # Calendar component
│   │   ├── ChatInterface.js    # AI chat sidebar
│   │   ├── EventForm.js        # Event creation/editing form
│   │   ├── EventList.js        # Event list display
│   │   └── clock.js            # Clock component
│   └── package.json
├── server/                     # Express backend
│   ├── index.js                # Server entry point
│   ├── db.js                   # Database utilities
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for auth and database)

### Installation

1. **Clone the repository**
    
    ```bash
    cd cadence-app
    ```
    
2. **Install server dependencies**
    
    ```bash
    cd server
    npm install
    ```
    
3. **Install client dependencies**
    
    ```bash
    cd client
    npm install
    ```
    
4. **Configure environment variables**
    
    **Server (.env.example)**:
    
    ```bash
    cp server/.env.example server/.env
    # Edit server/.env with your Gemini API key and Frontend URL
    ```
    
    **Client (.env)**:
    
    ```bash
    cp client/.env.example client/.env
    # Edit client/.env with your Supabase credentials, Gemini API key and backend URL
    ```
    
5. **Start the development servers**
    
    Terminal 1 (server):
    
    ```bash
    cd server
    npm start
    ```
    
    Terminal 2 (client):
    
    ```bash
    cd client
    npm start
    ```
    
6. **Open your browser**
Navigate to http://localhost:3000

## Environment Variables

### Client (.env)

| Variable | Description |
| --- | --- |
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key |
| `REACT_APP_API_URL` | Backend localhost URL |

### Server (.env)

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FRONTEND_URL` | Frontend localhost URL |

## Database Schema

The app uses Supabase with the following tables:

- **profiles** - User profiles with preferences
- **events** - Calendar events
- **recurrence_patterns** - Recurring event rules
- **recurrence_exceptions** - Individual instance modifications

## Available Scripts

### Client

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

### Server

```bash
npm start        # Start production server
```

## AI Chat Commands

The chat assistant understands natural language commands:

```
"Create a meeting tomorrow at 3pm"
"Update my gym event to 5am"
"Delete the birthday party next Friday"
"What's on my calendar this week?"
"Move my dentist appointment to next Monday"
```

## Deployment

### Netlify (Frontend + Serverless)

The server includes `netlify.toml` for serverless function deployment:

```bash
# Build client
cd client
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## License

MIT
