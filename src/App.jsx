import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, StreetViewPanorama } from '@react-google-maps/api';
import io from 'socket.io-client';
import GuessMap from './components/GuessMap';
import MainMenu from './components/MainMenu';
import Scoreboard from './components/Scoreboard';
import RoundCounter from './components/RoundCounter';
import LoginPage from './components/LoginPage';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const libraries = ['geometry'];

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'game', 'gameOver'
  const [socket, setSocket] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [isStreetViewInteractive, setIsStreetViewInteractive] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [finalScores, setFinalScores] = useState(null);
  
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [authError, setAuthError] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  useEffect(() => {
    if (!token) return;

    const serverUrl = apiUrl;
    const newSocket = io(serverUrl, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      handleLogout(); // If token is invalid, log out
    });

    newSocket.on('lobbyCreated', (data) => {
        console.log("[App] Lobby created/joined:", data);
        setLobby(data);
        setGameState('menu');
    });

    newSocket.on('playerJoined', ({ players }) => {
        console.log("[App] Player joined, new players:", players);
        setLobby(prev => ({...prev, players}));
    });

    newSocket.on('playerLeft', ({ players, newHost }) => {
        console.log("[App] Player left, new players:", players);
        setLobby(prev => ({...prev, players, host: newHost }));
    });

    newSocket.on('playerReady', ({ players }) => {
        setLobby(prev => ({...prev, players}));
    });

    newSocket.on('error', ({ message }) => {
      alert(`Error: ${message}`);
    });

    newSocket.on('gameStarted', (data) => {
      console.log("[App] Game started:", data);
      setGameData({
        currentLocation: data.location,
        currentRound: data.currentRound,
        totalRounds: data.totalRounds,
      });
      setLobby(prevLobby => ({ 
        ...prevLobby, 
        roomCode: data.roomCode, 
        players: data.players,
        host: data.host,
        gameSettings: data.gameSettings
      }));
      setIsLoading(false);
      setGameState('game');
    });

    newSocket.on('newLocation', (data) => {
      setIsLoading(true);
      setGameData(prev => ({ ...prev, currentLocation: data.location, currentRound: data.currentRound }));
      setTimeout(() => setIsLoading(false), 500);
    });

    newSocket.on('gameOver', (data) => {
      setFinalScores(data.finalScores);
      setGameState('gameOver');
    });

    return () => newSocket.close();
  }, [token]);

  const handleLogin = async (username, password) => {
    try {
        const response = await fetch(`${apiUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setAuthError(null);
    } catch (error) {
        setAuthError(error.message);
    }
  };

  const handleRegister = async (username, password) => {
    try {
        const response = await fetch(`${apiUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        setAuthError('Registration successful! Please log in.');
    } catch (error) {
        setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    if (socket) socket.disconnect();
  };

  const handleCreateGame = ({ gameSettings }) => {
    if (!user) return;
    if (gameSettings.type === 'singleplayer') {
      setIsLoading(true);
      setGameState('game');
    }
    socket.emit('createRoom', { gameSettings, playerName: user.username });
  };

  const handleJoinGame = (roomCode) => {
    if (!user) return;
    socket.emit('joinRoom', { roomCode, playerName: user.username });
  };

  const handleToggleReady = () => {
    if (lobby?.roomCode) socket.emit('toggleReady', { roomCode: lobby.roomCode });
  };

  const handleStartGame = () => {
    if (lobby?.roomCode) socket.emit('startGame', { roomCode: lobby.roomCode });
  };

  const handleRoundComplete = useCallback(() => {
    setIsLoading(true);
    if (socket && lobby?.roomCode) {
      socket.emit('requestNextRound', { roomCode: lobby.roomCode });
    }
  }, [socket, lobby]);

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} error={authError} />;
  }

  if (loadError) return <div>Error loading Google Maps script.</div>;

  if (gameState === 'gameOver') {
    return (
      <div className="game-over-screen">
        <h1>Game Over</h1>
        <h2>Final Scores</h2>
        <ul>
          {finalScores && Object.values(finalScores)
            .sort((a, b) => b.score - a.score)
            .map(player => (
              <li key={player.id}><span>{player.name}</span><span>{player.score}</span></li>
            ))}
        </ul>
        <button onClick={() => window.location.reload()}>Play Again</button>
      </div>
    );
  }

  if (gameState === 'menu') {
    return <MainMenu 
      onCreateGame={handleCreateGame} 
      onJoinGame={handleJoinGame} 
      onStartGame={handleStartGame}
      onToggleReady={handleToggleReady}
      lobby={lobby}
      isHost={socket?.id === lobby?.host}
      clientId={socket?.id}
      user={user}
      onLogout={handleLogout}
    />;
  }

  if (isLoading || !isLoaded || !gameData?.currentLocation) {
    return <div>Finding a good location...</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          zIndex: 0,
          pointerEvents: isStreetViewInteractive ? 'auto' : 'none'
      }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={gameData.currentLocation}
          zoom={10}
        >
          <StreetViewPanorama
            position={gameData.currentLocation}
            visible={true}
            options={{
              disableDefaultUI: true,
              enableCloseButton: false,
              showAddressControl: false,
              linksControl: true,
              panControl: true,
              zoomControl: true,
              scrollwheel: true,
            }}
          />
        </GoogleMap>
      </div>
      <GuessMap 
        actualLocation={gameData.currentLocation} 
        onRoundComplete={handleRoundComplete}
        socket={socket}
        roomCode={lobby?.roomCode}
        isHost={socket.id === lobby?.host}
        gameSettings={lobby?.gameSettings}
        userId={socket.id}
        onMouseEnter={() => setIsStreetViewInteractive(false)}
        onMouseLeave={() => setIsStreetViewInteractive(true)}
      />
      <Scoreboard players={lobby?.players || {}} />
      <RoundCounter current={gameData.currentRound} total={gameData.totalRounds} />
    </div>
  );
}

export default App;

