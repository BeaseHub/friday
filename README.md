# 📚 Friday App Documentation

## 🧩 Overview

**Friday** is a full-stack AI-powered assistant platform built using:
- **Frontend**: React.js (TypeScript) with Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **External Services**: ElevenLabs (for voice/audio features)

This document will guide you through setup, environment variables, migrations, and external service integration.

---

## 🚀 Frontend Setup

### 🔹 Tech Stack
- **Language**: TypeScript
- **Framework**: React
- **Build Tool**: Vite

### 🔹 Installation Steps

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🔧 Backend Setup

### 🔹 Tech Stack
- **Language**: Python
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic

### 🔹 Environment Setup

- The PostgreSQL **database URL** is defined in:
  - The `.env` file in the `backend` folder
  - Also referenced in `alembic.ini`
  - And in `backend/app/db/database.py`

### 🔹 Installation Steps

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run Alembic migrations to ensure the database schema is up to date:
   ```bash
   alembic upgrade head
   ```

---

## 🔐 Environment Variables

Ensure the following environment variables are set in your `.env` file:

```env
DATABASE_URL=your_postgres_connection_url
ELEVENLABS_WEBHOOK_SECRET=your_secret_key_from_eleven_labs
```

---

## 🗣️ ElevenLabs Integration (Voice Features)

- The app uses **ElevenLabs** for audio/voice features.
- You must set `ELEVENLABS_WEBHOOK_SECRET` in the backend `.env` file.
- This secret is generated from the ElevenLabs app.
- Make sure it's **kept in sync** with ElevenLabs, or voice functionality will not work.
- To generate or update the secret:
  - Login to ElevenLabs
  - Set your webhook endpoint to your FastAPI server URL
  - Retrieve and copy the new secret key
  - Update the `.env` file

---

## 📅 Last Updated

This documentation was generated on **2025-07-20**.

---

## 🔌 WebSocket & CORS Configuration

### 🧵 FastAPI WebSocket
The backend supports **real-time communication** using FastAPI’s built-in WebSocket support. This enables:
- Real-time chat or interaction
- Audio streaming
- Live updates


### 🌐 CORS Setup
CORS (Cross-Origin Resource Sharing) is configured in `main.py` using FastAPI’s middleware:



