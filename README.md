# CodeSync - Real-time Interview Platform

A full-stack online coding interview platform featuring real-time collaboration, code execution, and a premium seamless UI.

## Features

- **Real-time Collaboration**: Code changes are synchronized instantly across all connected users using Socket.io.
- **Multiple Languages**: Syntax highlighting support for JavaScript, TypeScript, Python, Java, C++, and HTML.
- **In-Browser Execution**: Safely execute JavaScript code directly in the browser using Web Workers.
- **Session Management**: specific URLs for interview sessions that can be shared.
- **Modern UI**: Dark mode, glassmorphism, and responsive design built with React, Vite, and Vanilla CSS variables.

## Tech Stack

- **Frontend**: React, Vite, Monaco Editor, Socket.io-client
- **Backend**: Express.js, Socket.io
- **API Spec**: OpenAPI 3.0

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

1.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    # Server runs on http://localhost:3001
    ```

2.  **Start the Frontend Client**
    ```bash
    cd frontend
    npm run dev
    # Client runs on http://localhost:3000
    ```

3.  Open `http://localhost:3000` in your browser.
4.  Click "Start New Interview" to create a session.
5.  Share the URL with a candidate to start collaborating!

## API Specification

The backend API is documented using OpenAPI. See `backend/openapi.yaml` for details.
