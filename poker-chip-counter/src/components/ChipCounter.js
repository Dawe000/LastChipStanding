import React, { useState } from 'react';

const ChipCounter = ({ onChipChange, playerName }) => {
  const [chipCounts, setChipCounts] = useState({
    white: 0,  // $1 chips
    red: 0,    // $5 chips
    blue: 0,   // $10 chips
    green: 0,  // $25 chips
    black: 0   // $100 chips
  });

  const chipValues = {
    white: 1,
    red: 5,
    blue: 10, 
    green: 25,
    black: 100
  };

  const handleChipChange = (color, amount) => {
    const newCounts = {
      ...chipCounts,
      [color]: Math.max(0, chipCounts[color] + amount)
    };
    
    setChipCounts(newCounts);
    
    const totalValue = Object.keys(newCounts).reduce(
      (total, color) => total + (newCounts[color] * chipValues[color]), 0
    );
    
    onChipChange(totalValue);
  };

  return (
    <div className="chip-counter">
      <h3>Chips for {playerName}</h3>
      {Object.keys(chipCounts).map(color => (
        <div key={color} className="chip-row">
          <span className={`chip ${color}`}></span>
          <span className="chip-value">${chipValues[color]}</span>
          <button onClick={() => handleChipChange(color, -1)}>-</button>
          <span className="chip-count">{chipCounts[color]}</span>
          <button onClick={() => handleChipChange(color, 1)}>+</button>
        </div>
      ))}
      <div className="total-value">
        Total: ${Object.keys(chipCounts).reduce(
          (total, color) => total + (chipCounts[color] * chipValues[color]), 0
        )}
      </div>
    </div>
  );
};

export default ChipCounter;