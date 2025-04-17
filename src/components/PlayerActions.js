import React from 'react';

const PlayerActions = ({ player, currentBet, playerAction, betAmount, setBetAmount }) => {
  return (
    <div className="player-actions">
      <h3>Actions for {player.name}</h3>
      
      <div className="action-buttons">
        <button onClick={() => playerAction('fold')}>
          Fold
        </button>
        
        {player.bet < currentBet ? (
          <button onClick={() => playerAction('call')}>
            Call ${currentBet - player.bet}
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
            min={currentBet > 0 ? currentBet * 2 : 10}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Raise amount"
          />
          <button 
            onClick={() => {
              playerAction('raise', betAmount);
              setBetAmount('');
            }}
            disabled={!betAmount || parseInt(betAmount) <= currentBet}
          >
            Raise
          </button>
        </div>
        
        <button 
          onClick={() => playerAction('all-in')}
          className="all-in-btn"
        >
          All-In (${player.stack})
        </button>
      </div>
    </div>
  );
};

export default PlayerActions;