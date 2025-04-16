import React, { useState } from 'react';

const BetTracker = ({ onBetPlaced, playerName }) => {
  const [currentBet, setCurrentBet] = useState(0);
  const [betHistory, setBetHistory] = useState([]);

  const handleBetChange = (e) => {
    setCurrentBet(parseInt(e.target.value) || 0);
  };

  const placeBet = () => {
    if (currentBet <= 0) return;
    
    const bet = {
      amount: currentBet,
      timestamp: new Date().toISOString()
    };
    
    setBetHistory([bet, ...betHistory]);
    onBetPlaced(currentBet);
    setCurrentBet(0);
  };

  const commonBets = [5, 10, 25, 50, 100];

  return (
    <div className="bet-tracker">
      <h3>Bet Tracker for {playerName}</h3>
      
      <div className="bet-input">
        <input 
          type="number" 
          value={currentBet} 
          onChange={handleBetChange} 
          min="0" 
        />
        <button onClick={placeBet} disabled={currentBet <= 0}>
          Place Bet
        </button>
      </div>
      
      <div className="quick-bets">
        {commonBets.map(bet => (
          <button 
            key={bet} 
            onClick={() => setCurrentBet(bet)}
            className="quick-bet-btn"
          >
            ${bet}
          </button>
        ))}
      </div>
      
      <div className="bet-history">
        <h4>Recent Bets:</h4>
        <ul>
          {betHistory.map((bet, index) => (
            <li key={index}>
              ${bet.amount} - {new Date(bet.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BetTracker;