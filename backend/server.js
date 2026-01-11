const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure usage of CORS
app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in this demo
    methods: ["GET", "POST"]
  }
});

// In-memory store for sessions
// Structure: sessionId -> { code: string, language: string, participants: Set<socketId> }
const sessions = {};

// REST API
app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  sessions[sessionId] = {
    code: '// Start coding here\nconsole.log("Hello World!");',
    language: 'javascript',
    participants: new Set() // Note: Set doesn't serialize well if we were to dump it, but we won't.
  };
  res.status(201).json({ sessionId });
});

app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions[sessionId];

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId,
    code: session.code,
    language: session.language
  });
});

// WebSocket Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    if (sessions[sessionId]) {
      socket.join(sessionId);
      sessions[sessionId].participants.add(socket.id);

      // Send current state to the joining user
      socket.emit('init-session', {
        code: sessions[sessionId].code,
        language: sessions[sessionId].language
      });

      // Notify others
      io.to(sessionId).emit('user-joined', { userId: socket.id, count: sessions[sessionId].participants.size });
      console.log(`User ${socket.id} joined session ${sessionId}`);
    } else {
      socket.emit('error', 'Session not found');
    }
  });

  socket.on('code-change', ({ sessionId, code }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].code = code;
      // Broadcast to everyone else in the room
      socket.to(sessionId).emit('code-update', code);
    }
  });

  socket.on('language-change', ({ sessionId, language }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].language = language;
      io.to(sessionId).emit('language-update', language);
    }
  });

  socket.on('output-change', ({ sessionId, output }) => {
    // Broadcast output (console logs) to all users so they see real-time execution results
    // This is optional but cool for "Show real-time updates"
    socket.to(sessionId).emit('output-update', output);
  });

  socket.on('disconnecting', () => {
    // defined sets of rooms the socket is in
    const rooms = socket.rooms;
    rooms.forEach((roomId) => {
      if (sessions[roomId]) {
        sessions[roomId].participants.delete(socket.id);
        io.to(roomId).emit('user-left', { userId: socket.id, count: sessions[roomId].participants.size });

        // Cleanup empty sessions after some time if needed, but skipping for simplicity
      }
    });
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server };
