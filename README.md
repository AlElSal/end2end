# CodeSync - Real-time Interview Platform

A full-stack online coding interview platform featuring real-time collaboration, safe code execution, and a premium seamless UI.

## Features

- **Real-time Collaboration**: Code and language changes are synchronized instantly using Socket.io.
- **Multiple Languages**: Syntax highlighting for JS, TS, Python, Java, C++, and HTML.
- **In-Browser Execution**: Safely execute JavaScript in an isolated Web Worker.
- **Premium UI**: Modern dark mode with glassmorphism and responsive layout.

## Tech Stack

- **Frontend**: React (Vite), Monaco Editor, Socket.io-client.
- **Backend**: Node.js (Express), Socket.io.
- **Testing**: Jest, Supertest.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

To start both the backend server and frontend client simultaneously:

```bash
npm run dev
```
*Backend runs on http://localhost:3001, Frontend on http://localhost:3000*

### Running Tests

To verify the integration between the client and the server, run the integration suite:

```bash
cd backend
npm test
```

## API Specification

The API follows the OpenAPI 3.0 standard. See `backend/openapi.yaml` for details.
