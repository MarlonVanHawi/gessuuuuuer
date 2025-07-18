import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import styled from 'styled-components';
import StyledButton from './StyledButton';
import Card from './Card';
import StyledInput from './StyledInput';

const PageLayout = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  padding: 0 15vw;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1; /* Layer 1: Video */
`;

const GlassOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* For Safari */
  z-index: 2; /* Layer 2: Glass Effect */
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  z-index: 3; /* Layer 3: UI Panels */
`;

const RightPanel = styled.div`
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'translateX(0)' : 'translateX(50px)'};
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  position: relative;
  z-index: 3; /* Layer 3: UI Panels */
`;

const Title = styled.h1`
  font-size: 4rem;
  color: white;
  margin-bottom: 60px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 350px;
`;

const ModeButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-bottom: 15px;

  &:hover {
    background-color: #357abd;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoText = styled.p`
  color: #222;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 10px;
  text-transform: capitalize;

  span {
    font-weight: bold;
  }

  &:last-of-type {
      margin-bottom: 25px;
  }
`;

const CardText = styled.p`
  margin: 0;
  padding: 0;
  text-align: center;
  line-height: 1.5;
`;

const RoomCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 8px;
`;

const RoomCode = styled.strong`
  font-size: 1.5rem;
  color: #333;
  letter-spacing: 2px;
`;

const CopyButton = styled.button`
  background-color: #7f8c8d;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #95a5a6;
  }
`;

const PlayerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 15px 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  text-align: center;
`;

const PlayerListItem = styled.li`
  background-color: #ecf0f1;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 8px;
  font-weight: ${props => props.$isReady ? 'bold' : '500'};
  color: ${props => props.$isReady ? '#27ae60' : '#34495e'};
  transition: all 0.2s ease-in-out;
`;

const LobbyHeader = styled.h4`
    color: #333;
    margin-top: 20px;
    margin-bottom: 10px;
    text-align: center;
`;

const UserInfoContainer = styled.div`
    margin-top: 30px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    text-align: center;
    color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
`;

const LogoutButton = styled.button`
    background: none;
    border: 1px solid white;
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
    font-weight: bold;
    transition: background-color 0.3s, color 0.3s;

    &:hover {
        background-color: white;
        color: #333;
    }
`;

const MainMenu = ({ onCreateGame, onJoinGame, onStartGame, onToggleReady, lobby, isHost, clientId, user, onLogout }) => {
  const [activeCard, setActiveCard] = useState('main');
  const [gameSettings, setGameSettings] = useState({ type: null, mode: null });
  const [rounds, setRounds] = useState(5);
  const [joinRoomCode, setJoinRoomCode] = useState('');

  useEffect(() => {
    if (lobby) {
      setActiveCard('lobby');
    } else {
      // When leaving lobby, reset to main menu
      if (activeCard === 'lobby') {
        setActiveCard('main');
      }
    }
  }, [lobby]);



  const areAllPlayersReady = lobby && lobby.players && Object.values(lobby.players).every(p => p.ready);
  const canStartSolo = isHost && lobby && lobby.players && Object.keys(lobby.players).length === 1;

  const handleModeSelect = (type, mode) => {
    setGameSettings({ type, mode });
    setActiveCard('rounds');
  };

  const handleRoundsConfirm = () => {
    setActiveCard('confirm');
  }

  const handleCreate = () => {
    onCreateGame({ gameSettings: { ...gameSettings, rounds } });
  };

  const handleJoin = () => {
    onJoinGame(joinRoomCode);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobby.roomCode).then(() => {
      alert('Room code copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <PageLayout>
      <BackgroundVideo autoPlay muted loop src="/background.mp4" />
      <GlassOverlay />
      <LeftPanel>
        <Title>Gemini GeoGuesser</Title>
        <ButtonContainer>
          <StyledButton onClick={() => setActiveCard('singleplayer')}>Singleplayer</StyledButton>
          <StyledButton onClick={() => setActiveCard('multiplayer_create')}>Create Multiplayer</StyledButton>
          <StyledButton onClick={() => setActiveCard('join')}>Join Multiplayer</StyledButton>
          <StyledButton onClick={() => setActiveCard('info')}>How to Play</StyledButton>
          <StyledButton onClick={() => setActiveCard('leaderboard')}>Leaderboard</StyledButton>
        </ButtonContainer>
        {user && (
            <UserInfoContainer>
                <p>Welcome, <strong>{user.username}</strong></p>
                <LogoutButton onClick={onLogout}>Logout</LogoutButton>
            </UserInfoContainer>
        )}
      </LeftPanel>

      <RightPanel $show={activeCard !== 'main' || lobby !== null}>
        {activeCard === 'singleplayer' && (
          <Card title="Singleplayer">
            <ModeButton onClick={() => handleModeSelect('singleplayer', 'random')}>Random Location</ModeButton>
            <ModeButton onClick={() => handleModeSelect('singleplayer', 'hotspot')}>Gelsenkirchen Hotspots</ModeButton>
            <StyledButton onClick={() => setActiveCard('main')}>Back</StyledButton>
          </Card>
        )}

        {activeCard === 'multiplayer_create' && (
          <Card title="Create Multiplayer Game">
            <ModeButton onClick={() => handleModeSelect('multiplayer', 'random')}>Random Location</ModeButton>
            <ModeButton onClick={() => handleModeSelect('multiplayer', 'hotspot')}>Gelsenkirchen Hotspots</ModeButton>
            <StyledButton onClick={() => setActiveCard('main')}>Back</StyledButton>
          </Card>
        )}

        {activeCard === 'rounds' && (
          <Card title="Select Rounds">
            <StyledInput 
              type="number" 
              value={rounds} 
              onChange={(e) => setRounds(e.target.value)} 
              min="1" 
              max="20" 
            />
            <ModeButton onClick={handleRoundsConfirm}>Confirm</ModeButton>
          </Card>
        )}

        {activeCard === 'confirm' && (
          <Card title="Confirm Settings">
            <InfoText>Mode: <span>{gameSettings.mode}</span></InfoText>
            <InfoText>Rounds: <span>{rounds}</span></InfoText>
            <ModeButton onClick={handleCreate}>
              {gameSettings.type === 'multiplayer' ? 'Create Lobby' : 'Start Game'}
            </ModeButton>
          </Card>
        )}

        {activeCard === 'join' && (
          <Card title="Join Game">
            <StyledInput 
              type="text" 
              placeholder="Enter Room Code" 
              value={joinRoomCode} 
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())} 
              maxLength="4"
            />
            <ModeButton onClick={handleJoin}>Join</ModeButton>
            <StyledButton onClick={() => setActiveCard('main')}>Back</StyledButton>
          </Card>
        )}

        {activeCard === 'lobby' && lobby && (
          <Card title="Multiplayer Lobby">
            <InfoText>Share this code with your friends to join.</InfoText>
            <RoomCodeContainer>
                <RoomCode>{lobby.roomCode}</RoomCode>
                <CopyButton onClick={handleCopyCode}>Copy</CopyButton>
            </RoomCodeContainer>
            
            <LobbyHeader>Players ({Object.keys(lobby.players || {}).length}/8)</LobbyHeader>
            <PlayerList>
                {Object.values(lobby.players).map(player => (
                    <PlayerListItem key={player.id} $isReady={player.ready}>
                        {player.name} {player.id === lobby.host ? '(Host)' : ''}
                    </PlayerListItem>
                ))}
            </PlayerList>

            {isHost ? (
                <ModeButton onClick={onStartGame} disabled={!areAllPlayersReady && !canStartSolo}>
                    Start Game
                </ModeButton>
            ) : (
                <ModeButton onClick={onToggleReady}>
                    {lobby.players[clientId]?.ready ? 'Unready' : 'Ready'}
                </ModeButton>
            )}
          </Card>
        )}

        {activeCard === 'leaderboard' && (
          <Leaderboard onBack={() => setActiveCard('main')} />
        )}

        {activeCard === 'info' && (
          <Card title="How to Play">
            <CardText>
              Welcome to GeoGuesser! You'll be dropped in a random Street View location. Your mission is to guess where you are by placing a marker on the map. The closer you are, the more points you get. Good luck!
            </CardText>
            <StyledButton onClick={() => setActiveCard('main')}>Back</StyledButton>
          </Card>
        )}
      </RightPanel>
    </PageLayout>
  );
};

export default MainMenu;
