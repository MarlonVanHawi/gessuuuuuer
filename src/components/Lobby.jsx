import React from 'react';

const Lobby = ({ onStartGame, roomCode, players, isHost }) => {
    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode).then(() => {
            alert('Room code copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy room code: ', err);
        });
    };

    return (
        <div className="main-menu">
            <div className="card-container">
                <div className="card">
                    <h2>Multiplayer Lobby</h2>
                    <p className="info-text">Share this code with your friends to join.</p>
                    <div className="room-code-container">
                        <strong>{roomCode}</strong>
                        <button onClick={handleCopyCode} className="copy-button">Copy</button>
                    </div>
                    
                    <h4>Players ({Object.keys(players || {}).length}/8)</h4>
                    <ul className="player-list">
                        {players && Object.values(players).map(player => (
                            <li key={player.id}>{player.name}</li>
                        ))}
                    </ul>

                    {isHost ? (
                        <button className="mode-button" onClick={onStartGame}>
                            Start Game
                        </button>
                    ) : (
                        <p className="info-text">Waiting for the host to start the game...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lobby;
