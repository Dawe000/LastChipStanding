import React from 'react';

const Showdown = ({ 
  pot, 
  sidePots = [],
  players, 
  awardPot, 
  startNewHand, 
  goToMenu, 
  restartGame 
}) => {
  const awardSidePot = (potIndex, playerIndex) => {
    const sidePot = sidePots[potIndex];
    const player = players[playerIndex];
    
    if (!sidePot || !player) return;
    
    // Check if player is eligible for this side pot
    if (!sidePot.eligiblePlayers.includes(player.name)) {
      alert(`${player.name} is not eligible for this side pot!`);
      return;
    }
    
    awardPot(playerIndex, potIndex);
  };

  return (
    <div className="showdown-screen">
      <h2>LastChipStanding: Showdown</h2>
      
      <div className="pot-info">
        <h3>Total Pot: ${pot}</h3>
        
        {sidePots.length > 1 ? (
          <div className="side-pots">
            <h4>Side Pots:</h4>
            {sidePots.map((sidePot, potIndex) => (
              <div key={potIndex} className="side-pot">
                <h5>
                  Side Pot {potIndex + 1}: ${sidePot.amount}
                  {sidePot.minCommit && sidePot.maxCommit && 
                    ` (Commit range: $${sidePot.minCommit}-${sidePot.maxCommit})`
                  }
                </h5>
                <p>Eligible players: {sidePot.eligiblePlayers.join(', ')}</p>
                
                <div className="pot-award-buttons">
                  {players.map((player, playerIndex) => {
                    const isEligible = sidePot.eligiblePlayers.includes(player.name);
                    const isFolded = player.folded;
                    
                    if (isFolded || !isEligible) return null;
                    
                    return (
                      <button 
                        key={playerIndex}
                        onClick={() => awardSidePot(potIndex, playerIndex)}
                        className="award-side-pot-btn"
                      >
                        Award to {player.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single pot (traditional case)
          <div className="main-pot">
            <h4>Main Pot: ${pot}</h4>
          </div>
        )}
      </div>
      
      <div className="active-players">
        <h3>Players:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index} className={player.folded ? 'folded-player' : ''}>
              {player.name} - ${player.stack}
              {player.folded ? ' (Folded)' : ''}
              {!player.folded && (
                <button 
                  onClick={() => awardPot(index)} 
                  disabled={pot <= 0}
                  className="award-main-pot-btn"
                >
                  Award All Pots
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