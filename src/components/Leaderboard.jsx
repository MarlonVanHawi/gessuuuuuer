import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from './Card';
import StyledButton from './StyledButton';

const LeaderboardList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const LeaderboardItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 12px 8px;
  border-bottom: 1px solid #ecf0f1;
  font-size: 1.1rem;

  &:last-child {
    border-bottom: none;
  }
`;

const PlayerName = styled.span`
  font-weight: 500;
`;

const PlayerScore = styled.span`
  font-weight: bold;
  color: #4a90e2;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  text-align: center;
`;

const Leaderboard = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${apiUrl}/api/leaderboard`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data.');
        }
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Card title="Top 10 Players">
      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : (
        <LeaderboardList>
          {leaderboard.map((player, index) => (
            <LeaderboardItem key={index}>
              <PlayerName>{index + 1}. {player.username}</PlayerName>
              <PlayerScore>{player.total_score} pts</PlayerScore>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      )}
      <StyledButton onClick={onBack} style={{ marginTop: '20px' }}>Back</StyledButton>
    </Card>
  );
};

export default Leaderboard;
