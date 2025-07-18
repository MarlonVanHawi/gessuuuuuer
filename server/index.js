require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { locations } = require('./locations');
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

// Load Gelsenkirchen GeoJSON and create polygon
const geJsonPath = path.join(__dirname, '..', 'src', 'data', 'gelsenkirchen.json');
const gelsenkirchenGeoJSON = JSON.parse(fs.readFileSync(geJsonPath, 'utf8'));
const gelsenkirchenPolygon = gelsenkirchenGeoJSON.features[0].geometry;

const GELSENKIRCHEN_BOUNDS = {
  minLat: 51.4808012,
  maxLat: 51.6315932,
  minLng: 6.9874995,
  maxLng: 7.152337,
};

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app',
        /\.vercel\.app$/,
        /\.railway\.app$/
      ]
    : "*",
  credentials: true,
  methods: ["GET", "POST"]
};

app.use(cors(corsOptions));
app.use(express.json());

// --- HEALTH CHECK ENDPOINT ---
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      res.status(201).json({ message: 'User registered successfully!', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

// Leaderboard route
app.get('/api/leaderboard', (req, res) => {
  db.all('SELECT username, total_score FROM users ORDER BY total_score DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Error retrieving leaderboard.' });
      return;
    }
    res.json(rows);
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function isWithinCityLimits(lat, lng) {
  return turf.booleanPointInPolygon(turf.point([lng, lat]), gelsenkirchenPolygon);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function findNewLocation(gameMode) {
  if (gameMode === 'hotspot') return shuffleArray([...locations])[0];
  for (let i = 0; i < 50; i++) {
    const lat = GELSENKIRCHEN_BOUNDS.minLat + Math.random() * (GELSENKIRCHEN_BOUNDS.maxLat - GELSENKIRCHEN_BOUNDS.minLat);
    const lng = GELSENKIRCHEN_BOUNDS.minLng + Math.random() * (GELSENKIRCHEN_BOUNDS.maxLng - GELSENKIRCHEN_BOUNDS.minLng);
    if (!isWithinCityLimits(lat, lng)) continue;
    try {
      const { data } = await axios.get(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY}`);
      if (data.status === 'OK') return { lat, lng };
    } catch (error) {}
  }
  return locations[0];
}

async function startGameLogic(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  room.currentRound = 1;
  const location = await findNewLocation(room.gameSettings.mode);
  if (location) {
    room.currentLocation = location;
    io.to(roomCode).emit('gameStarted', { roomCode, currentRound: 1, totalRounds: room.gameSettings.rounds, location, players: room.players, host: room.host, gameSettings: room.gameSettings });
  } else {
    io.to(roomCode).emit('error', { message: 'Failed to find a starting location.' });
  }
}

// Middleware to verify JWT token before any socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: No token provided.'));
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token.'));
    db.get('SELECT id, username FROM users WHERE id = ?', [decoded.id], (dbErr, user) => {
      if (dbErr || !user) return next(new Error('Authentication error: User not found.'));
      socket.user = user;
      next();
    });
  });
});

io.on('connection', (socket) => {
  console.log(`[Connection] User connected: ${socket.user.username} (${socket.id})`);

  socket.on('createRoom', async ({ gameSettings }) => {
    const roomCode = generateRoomCode();
    const hostId = socket.id;
    const playerName = socket.user.username;
    rooms[roomCode] = {
      host: hostId,
      players: { [hostId]: { id: hostId, name: playerName, score: 0, ready: true } },
      gameSettings,
      currentRound: 0,
      guesses: {}
    };
    socket.join(roomCode);
    console.log(`[Room] ${playerName} created room ${roomCode}`);
    // Send the full lobby object including the roomCode
    socket.emit('lobbyCreated', { ...rooms[roomCode], roomCode });
    if (gameSettings.type === 'singleplayer') {
      await startGameLogic(roomCode);
    }
  });

  socket.on('joinRoom', ({ roomCode }) => {
    const room = rooms[roomCode];
    const playerName = socket.user.username;
    if (!room) return socket.emit('error', { message: 'Room not found.' });
    if (Object.keys(room.players).length >= 8) return socket.emit('error', { message: 'Room is full.' });
    if (room.currentRound > 0) return socket.emit('error', { message: 'Game has already started.' });
    
    // Also send roomCode on re-sync
    if (Object.values(room.players).some(p => p.name === playerName)) {
      return socket.emit('lobbyCreated', { ...room, roomCode });
    }

    const playerId = socket.id;
    room.players[playerId] = { id: playerId, name: playerName, score: 0, ready: false };
    socket.join(roomCode);
    console.log(`[Room] ${playerName} joined room ${roomCode}`);
    
    // Send the full lobby object including the roomCode
    socket.emit('lobbyCreated', { ...room, roomCode });
    io.to(roomCode).emit('playerJoined', { players: room.players });
  });

  socket.on('toggleReady', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room && room.players[socket.id]) {
      room.players[socket.id].ready = !room.players[socket.id].ready;
      io.to(roomCode).emit('playerReady', { players: room.players });
    }
  });

  socket.on('startGame', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room && room.host === socket.id) {
      if (Object.values(room.players).every(p => p.ready)) {
        await startGameLogic(roomCode);
      } else {
        socket.emit('error', { message: 'Not all players are ready.' });
      }
    }
  });

  socket.on('makeGuess', ({ roomCode, guess }) => {
    const room = rooms[roomCode];
    if (!room || room.guesses[socket.id]) return;
    room.guesses[socket.id] = guess;
    const allGuessed = Object.keys(room.players).every(pId => room.guesses[pId]);
    if (allGuessed) {
      const results = {};
      Object.keys(room.players).forEach(pId => {
        const playerGuess = room.guesses[pId];
        const distance = getDistanceInMeters(playerGuess.lat, playerGuess.lng, room.currentLocation.lat, room.currentLocation.lng);
        const score = Math.max(0, 5000 - Math.floor(distance / 5));
        room.players[pId].score += score;
        results[pId] = { guess: playerGuess, score, distance: (distance / 1000).toFixed(2) };
      });
      io.to(roomCode).emit('roundResult', { results, players: room.players, actualLocation: room.currentLocation });
      room.guesses = {};
    }
  });

  socket.on('requestNextRound', async ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room && room.host === socket.id) {
      room.currentRound++;
      if (room.currentRound > room.gameSettings.rounds) {
        // Game is over, update scores in the database
        Object.values(room.players).forEach(player => {
          if (player.name && player.score > 0) { // Ensure player exists and has a score
            db.run('UPDATE users SET total_score = total_score + ? WHERE username = ?',
              [player.score, player.name],
              (err) => {
                if (err) {
                  console.error(`Failed to update score for ${player.name}:`, err.message);
                }
              }
            );
          }
        });
        io.to(roomCode).emit('gameOver', { finalScores: room.players });
      } else {
        const location = await findNewLocation(room.gameSettings.mode);
        if (location) {
          room.currentLocation = location;
          io.to(roomCode).emit('newLocation', { location, currentRound: room.currentRound });
        } else {
          io.to(roomCode).emit('error', { message: 'Could not find a new location.' });
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Disconnection] User disconnected: ${socket.user.username} (${socket.id})`);
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        if (Object.keys(room.players).length === 0) {
          delete rooms[roomCode];
          console.log(`[Room] Room ${roomCode} is empty and has been deleted.`);
        } else {
          let newHost = room.host;
          if (socket.id === room.host) {
            newHost = Object.keys(room.players)[0];
            room.host = newHost;
            console.log(`[Room] Host disconnected. New host is ${room.players[newHost].name}.`);
          }
          io.to(roomCode).emit('playerLeft', { players: room.players, newHost });
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  });
});
