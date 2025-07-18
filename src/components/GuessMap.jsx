import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import './GuessMap.css';
import geoJsonData from '../data/gelsenkirchen.json';
import StyledButton from './StyledButton';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const cityCenter = { lat: 51.5167, lng: 7.1 }; // Gelsenkirchen

const GuessMap = ({ actualLocation, onRoundComplete, socket, roomCode, isHost, gameSettings, userId, onMouseEnter, onMouseLeave }) => {
  const [myGuess, setMyGuess] = useState(null); // The current player's confirmed guess
  const [tempGuess, setTempGuess] = useState(null); // For placing a marker before confirming
  const [results, setResults] = useState(null); // { results, players, actualLocation }
  const [allGuesses, setAllGuesses] = useState({}); // To display all markers on the results screen
  const mapRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleRoundResult = (data) => {
      console.log('Round result:', data);
      const receivedGuesses = {};
      for (const playerId in data.results) {
        receivedGuesses[playerId] = data.results[playerId].guess;
      }
      setAllGuesses(receivedGuesses);
      setResults(data);
    };

    socket.on('roundResult', handleRoundResult);

    return () => {
      socket.off('roundResult', handleRoundResult);
    };
  }, [socket]);

  const handleNextRound = () => {
    setMyGuess(null);
    setTempGuess(null);
    setResults(null);
    setAllGuesses({});
    onRoundComplete();
  };

  const handleMapClick = useCallback((event) => {
    if (!myGuess && !results) {
      setTempGuess(event.latLng.toJSON());
    }
  }, [myGuess, results]);

  const handleConfirmGuess = () => {
    if (socket && tempGuess && !myGuess) {
      socket.emit('makeGuess', { roomCode, guess: tempGuess });
      setMyGuess(tempGuess);
      setTempGuess(null);
    }
  };

  const onLoad = useCallback(map => {
    mapRef.current = map;
    map.data.forEach(feature => map.data.remove(feature));
    map.data.addGeoJson(geoJsonData);
    map.data.setStyle({
      fillOpacity: 0,
      strokeColor: 'blue',
      strokeWeight: 2,
      clickable: false,
    });
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const hasPlayerGuessed = !!myGuess;

  return (
    <div 
      className={`guess-map-wrapper ${results ? 'results' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="guess-map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={cityCenter}
          zoom={11}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          }}
          onClick={handleMapClick}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Show the temporary marker before confirmation */}
          {tempGuess && <Marker position={tempGuess} options={{ icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' } }} />}

          {/* Show the player's own confirmed guess */}
          {myGuess && !results && <Marker position={myGuess} />}

          {/* Show all players' guesses and polylines on the results screen */}
          {results && Object.entries(allGuesses).map(([playerId, guess]) => (
            <Marker key={playerId} position={guess} />
          ))}

          {results && (
            <>
              <Marker position={results.actualLocation} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }} />
              {Object.values(results.results).map(res => (
                <Polyline
                  key={res.guess.lat}
                  path={[res.guess, results.actualLocation]}
                  options={{ strokeColor: '#FF0000', strokeWeight: 2 }}
                />
              ))}
            </>
          )}
        </GoogleMap>
      </div>
      
      <div className="guess-map-ui">
        {!results ? (
          <div className="guess-status">
            <h3>
              {hasPlayerGuessed
                ? 'Waiting for other players...'
                : tempGuess
                ? 'Confirm your guess'
                : 'Make your guess on the map'}
            </h3>
            {tempGuess && !hasPlayerGuessed && (
              <StyledButton gradient="linear-gradient(135deg, #28a745 0%, #218838 100%)" onClick={handleConfirmGuess}>Confirm Guess</StyledButton>
            )}
          </div>
        ) : (
          <div className="results-display">
            <h2>Round Results</h2>
            <ul>
              {Object.entries(results.results)
                .sort(([, a], [, b]) => b.score - a.score)
                .map(([pId, res]) => (
                  <li key={pId}>
                    <span>{results.players[pId]?.name || `Player ${pId.substring(0,4)}`}:</span>
                    <span>{res.score} pts ({res.distance} km)</span>
                  </li>
              ))}
            </ul>
            {(isHost || gameSettings?.type === 'singleplayer') && (
              <StyledButton gradient="linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" onClick={handleNextRound}>
                Next Round
              </StyledButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuessMap;
