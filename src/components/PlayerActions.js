import React from 'react';

const PlayerActions = ({ player, currentBet, playerAction, betAmount, setBetAmount }) => {
  const callAmount = currentBet - player.bet;
  const canCall = callAmount <= player.stack;
  const maxRaise = player.stack + player.bet;
  const minRaise = currentBet > 0 ? currentBet + 1 : 1; // Minimum raise is current bet + 1
  
  return (
    <div className="player-actions">
      <h3>Actions for {player.name}</h3>
      <p>Stack: ${player.stack} | Current Bet: ${player.bet}</p>
      
      <div className="action-buttons">
        <button onClick={() => playerAction('fold')}>
          Fold
        </button>
        
        {player.bet < currentBet ? (
          <button 
            onClick={() => playerAction('call')}
            title={!canCall ? `Will go all-in with $${player.stack}` : `Call $${callAmount}`}
          >
            {canCall ? `Call $${callAmount}` : `Call All-In ($${player.stack})`}
          </button>
        ) : (
          <button onClick={() => playerAction('check')}>
            Check
          </button>
        )}
        
        <div className="raise-action">
          <input
            type="number"
            value={betAmount}
            min={minRaise}
            max={maxRaise}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder={`Raise (${minRaise}-${maxRaise})`}
          />
          <button 
            onClick={() => {
              const raiseAmount = parseInt(betAmount);
              if (raiseAmount >= minRaise && raiseAmount <= maxRaise) {
                playerAction('raise', betAmount);
                setBetAmount('');
              } else {
                alert(`Raise must be between $${minRaise} and $${maxRaise}`);
              }
            }}
            disabled={!betAmount || parseInt(betAmount) < minRaise || parseInt(betAmount) > maxRaise}
          >
            Raise
          </button>
        </div>
        
        <button 
          onClick={() => playerAction('all-in')}
          className="all-in-btn"
          disabled={player.stack <= 0}
        >
          All-In (${player.stack})
        </button>
      </div>
    </div>
  );
};

export default PlayerActions;