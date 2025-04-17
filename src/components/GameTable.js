import React from 'react';
import PlayerActions from './PlayerActions';

const GameTable = ({ 
  gameStage, 
  pot, 
  currentBet, 
  players, 
  activePlayerIndex, 
  dealerIndex,
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
          <h3>Pot: ${pot}</h3>
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
              {index === dealerIndex && " (Dealer)"}
              {player.bet > 0 && ` - Bet: $${player.bet}`}
              {player.folded && " (Folded)"}
              {index === activePlayerIndex && " - YOUR TURN"}
            </li>
          ))}
        </ul>
      </div>
      
      {players[activePlayerIndex] && !players[activePlayerIndex].folded && (
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