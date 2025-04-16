import React from 'react';
import GameManager from './components/GameManager';
import './styles/main.css';

const App = () => {
  return (
    <div className="poker-app">
      <header>
        <h1>Poker Game Manager</h1>
      </header>
      <GameManager />
    </div>
  );
};

export default App;