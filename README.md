# ColdMail – Personal Cold Emailing Platform

A modern, fast, and reliable personal cold emailing web platform built for developers to contact recruiters, talent managers, and hiring leads for internships and job opportunities.

---

## Features

- **Intuitive Dashboard**: Real MongoDB statistics (emails sent, unique recruiters contacted, saved contacts), Gmail connection status indicator, and recent outreach activity.
- **AI-Powered Composer**: Generate tailored, human-written cold emails with **Google Gemini API** (`gemini-1.5-flash`), with automated fallback to an intelligent smart template engine.
- **Automated Signature & Links**: Dynamically pulls and formats verified clickable links for:
  - Resume URL
  - Portfolio URL
  - LinkedIn Profile URL
  - GitHub Profile URL
- **Full Email Control**: Edit subject, edit email body, toggle live HTML recipient inbox preview, regenerate with AI, and copy content with 1-click.
- **Gmail API with OAuth 2.0**: Securely send emails directly from your personal Gmail address via RFC 2822 compliant MIME messages (`multipart/alternative` with both plain text and rich HTML).
- **Recruiter Directory (Contacts)**: Add, edit, delete, and search recruiters by name, company, email, and designation. Quick 1-click "Compose to Recruiter" action. Duplicate email prevention.
- **Sent Email History**: Archive of sent emails with message IDs, timestamps, recruiter info, and a 1-click "Reuse in Composer" feature.
- **Settings & Security**: Configure Gemini API keys and Google OAuth credentials securely via UI or `.env`, set custom daily sending limits (anti-spam protection), and test Gemini connectivity.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js, Express.js, TypeScript, Mongoose
- **Database**: MongoDB
- **Integrations**: Google Gemini API (`@google/generative-ai`), Google Gmail API (`googleapis` OAuth 2.0)

---

## Project Structure

```
coldemail/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Sidebar, TopNavbar, Modal, Badge
│   │   ├── context/            # Toast / Notification Context
│   │   ├── pages/              # Dashboard, Compose, Contacts, History, Profile, Settings
│   │   ├── services/           # Type-safe API client
│   │   └── types/              # Shared TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # DB & Environment Configuration
│   │   ├── controllers/        # Auth, AI, Contacts, Email, Dashboard, Profile, Settings
│   │   ├── middleware/         # Centralized Error Handling & Validation
│   │   ├── models/             # Mongoose Schemas (Profile, Contact, SentEmail, AccountConfig)
│   │   ├── routes/             # RESTful API Endpoints
│   │   └── services/           # Gemini AI & Gmail OAuth Services
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running on `mongodb://127.0.0.1:27017`)

### 2. Installation
Install dependencies for both frontend and backend:

```bash
# In the root directory
npm run install:all
```

Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory (or configure keys directly from the web UI Settings page):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/coldmail
CLIENT_URL=http://localhost:3000

# Optional: can also be configured via Settings UI
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### 4. Running the Application

In two separate terminals:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
```
API runs on `http://localhost:5000`.

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:3000`.

---

## Gmail Integration Setup (Google Cloud Console)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `ColdMail`).
3. Under **APIs & Services** > **Library**, search for and enable:
   - **Gmail API**
   - **Google People API** (or userinfo)
4. Go to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External** (or Internal for Workspace)
   - Add your email as a **Test User**.
5. Go to **Credentials** > **Create Credentials** > **OAuth Client ID**:
   - Application Type: **Web application**
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Copy the **Client ID** and **Client Secret**.
7. In ColdMail, go to **Settings** and paste them into the Google OAuth Credentials section, then click **Connect Gmail with Google OAuth 2.0**.
