import React, { useState } from 'react';

const PlayerSetup = ({ 
  players, 
  addPlayer, 
  removePlayer, 
  editPlayerMoney, 
  dealerIndex,
  smallBlind,
  bigBlind,
  setSmallBlind,
  setBigBlind,
  startGame,
  restartGame
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName);
      setNewPlayerName('');
    }
  };

  return (
    <div className="setup-screen">
      <h2>LastChipStanding: Player Setup</h2>
      
      <div className="add-player-form">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Player Name"
        />
        <button onClick={handleAddPlayer}>Add Player</button>
      </div>
      
      <div className="player-list">
        <h3>Players:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index} className="player-item">
              <div className="player-info">
                <span>{player.name} - ${player.stack}</span>
                {index === dealerIndex && <span className="dealer-tag"> (Dealer)</span>}
              </div>
              <div className="player-actions">
                <div className="edit-money">
                  <input 
                    type="number" 
                    placeholder="New amount"
                    min="0"
                    onChange={(e) => {
                      const element = e.target;
                      element.dataset.amount = e.target.value;
                    }}
                  />
                  <button 
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      const newAmount = parseInt(input.dataset.amount);
                      editPlayerMoney(index, newAmount);
                      input.value = '';
                    }}
                  >
                    Update
                  </button>
                </div>
                <button 
                  onClick={() => removePlayer(index)} 
                  className="remove-player-btn"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="game-settings">
        <div>
          <label>Small Blind: </label>
          <input 
            type="number" 
            value={smallBlind} 
            onChange={(e) => setSmallBlind(parseInt(e.target.value))} 
          />
        </div>
        <div>
          <label>Big Blind: </label>
          <input 
            type="number" 
            value={bigBlind} 
            onChange={(e) => setBigBlind(parseInt(e.target.value))} 
          />
        </div>
      </div>
      
      <div className="game-controls">
        <button 
          onClick={startGame} 
          disabled={players.length < 2}
          className="start-game-btn"
        >
          Start Game
        </button>
        
        <button 
          onClick={restartGame} 
          className="restart-game-btn"
          disabled={players.length === 0}
        >
          Reset All Stacks
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;