# Toki Pona Dictionary Project

## Overview
This is an unofficial Toki Pona dictionary web application created by Sonya. Users can add words directly on the website and save them to a PostgreSQL database. The dictionary includes both official and unofficial Toki Pona words with Korean and English meanings.

## Project Architecture

### Technology Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Replit Database)
- **Dependencies**: express, pg, cors, dotenv

### Project Structure
\`\`\`
.
├── public/
│   ├── index.html      # Main UI
│   ├── styles.css      # Styling
│   └── script.js       # Frontend logic
├── server.js           # Express server and API endpoints
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
└── replit.md          # This file
\`\`\`

## Features
- Add new Toki Pona words with Korean and English meanings
- Mark words as official or unofficial
- Search functionality for finding words
- Delete words from the dictionary
- Clean, responsive UI with Korean language support

## Database Setup
**IMPORTANT**: This application requires a PostgreSQL database to function.

To set up the database:
1. Click on the "Database" tool in Replit
2. Create a new PostgreSQL database
3. The `DATABASE_URL` environment variable will be automatically set
4. The application will automatically create the necessary `words` table on first run

### Database Schema
\`\`\`sql
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    meaning TEXT NOT NULL,
    english TEXT,
    is_official BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
\`\`\`

## API Endpoints
- `GET /api/words` - Get all words
- `POST /api/words` - Add a new word
- `DELETE /api/words/:id` - Delete a word by ID

## Recent Changes
- **2025-10-21**: Initial project setup with full-stack implementation
  - Created frontend interface with Korean/English support
  - Implemented Express backend with REST API
  - Set up PostgreSQL database schema
  - Added CRUD operations for dictionary words

## Running the Project
The project runs on port 5000 and serves both the frontend and API endpoints.

Command: `npm start`

## User Preferences
None specified yet.
