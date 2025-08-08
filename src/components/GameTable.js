import React from 'react';
import PlayerActions from './PlayerActions';

const GameTable = ({ 
  gameStage, 
  pot, 
  sidePots = [],
  currentBet, 
  players, 
  activePlayerIndex, 
  dealerIndex,
  smallBlindIndex,
  bigBlindIndex,
  playerAction,
  betAmount,
  setBetAmount,
  goToMenu
}) => {
  return (
    <div className="game-screen">
      <div className="game-info">
        <h2>LastChipStanding: {gameStage.toUpperCase()}</h2>
        <div className="pot">
          <h3>Total Pot: ${pot}</h3>
          {sidePots.length > 1 && (
            <div className="side-pots-preview">
              <h4>Side Pots:</h4>
              {sidePots.map((sidePot, index) => (
                <div key={index} className="side-pot-preview">
                  <span>Pot {index + 1}: ${sidePot.amount}</span>
                  <small> (eligible: {sidePot.eligiblePlayers.join(', ')})</small>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="current-bet">
          <h3>Current Bet: ${currentBet}</h3>
        </div>
      </div>
      
      {gameStage !== 'preflop' && (
        <div className="community-cards-prompt">
          <div className="card-instruction">
            {gameStage === 'flop' && "Dealer: Place 3 community cards (the flop)"}
            {gameStage === 'turn' && "Dealer: Place 1 community card (the turn)"}
            {gameStage === 'river' && "Dealer: Place 1 final community card (the river)"}
          </div>
        </div>
      )}
      
      <div className="player-list">
        <h3>Players:</h3>
        <ul>
          {players.map((player, index) => (
            <li 
              key={index} 
              className={`
                ${index === activePlayerIndex ? 'active-player' : ''} 
                ${player.folded ? 'folded-player' : ''}
              `}
            >
              {player.name} - ${player.stack}
              {index === dealerIndex && <span className="position-indicator dealer-tag">D</span>}
              {index === smallBlindIndex && <span className="position-indicator sb-tag">SB</span>}
              {index === bigBlindIndex && <span className="position-indicator bb-tag">BB</span>}
              {player.bet > 0 && ` - Bet: $${player.bet}`}
              {player.folded && " (Folded)"}
              {!player.folded && player.stack === 0 && " (ALL-IN)"}
              {index === activePlayerIndex && !player.folded && player.stack > 0 && <span className="turn-indicator"> YOUR TURN</span>}
            </li>
          ))}
        </ul>
      </div>
      
      {players[activePlayerIndex] && !players[activePlayerIndex].folded && players[activePlayerIndex].stack > 0 && (
        <PlayerActions 
          player={players[activePlayerIndex]}
          currentBet={currentBet}
          playerAction={playerAction}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
        />
      )}
      
      <div className="game-controls">
        <button onClick={goToMenu} className="menu-btn">
          Go to Menu
        </button>
      </div>
    </div>
  );
};

export default GameTable;