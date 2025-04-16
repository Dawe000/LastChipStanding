import React from 'react';

const GameHistory = ({ players }) => {
  return (
    <div className="game-history">
      <h3>Game History</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Total Bets</th>
            <th>Current Chips</th>
            <th>Net Position</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(players).map(([name, stats]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>${stats.totalBets}</td>
              <td>${stats.chips}</td>
              <td className={stats.chips - stats.totalBets > 0 ? 'positive' : 'negative'}>
                ${stats.chips - stats.totalBets}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameHistory;