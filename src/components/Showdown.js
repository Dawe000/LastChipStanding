import React from 'react';

const Showdown = ({ 
  pot, 
  players, 
  awardPot, 
  startNewHand, 
  goToMenu, 
  restartGame 
}) => {
  return (
    <div className="showdown-screen">
      <h2>LastChipStanding: Showdown</h2>
      
      <div className="pot">
        <h3>Pot: ${pot}</h3>
      </div>
      
      <div className="active-players">
        <h3>Players:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index} className={player.folded ? 'folded-player' : ''}>
              {player.name} - ${player.stack}
              {player.folded ? ' (Folded)' : (
                <button 
                  onClick={() => awardPot(index)} 
                  disabled={pot <= 0}
                >
                  Award Pot
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="game-controls">
        <button onClick={startNewHand} className="new-hand-btn">
          Start New Hand
        </button>
        <button onClick={goToMenu} className="menu-btn">
          Go to Menu
        </button>
        <button onClick={restartGame} className="restart-game-btn">
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default Showdown;