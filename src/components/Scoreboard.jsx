import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ players }) => {
  // Sort players by score in descending order
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h3>Scoreboard</h3>
      <ul>
        {sortedPlayers.map(player => (
          <li key={player.id}>
            <span>{player.id}</span>
            <span>{player.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
