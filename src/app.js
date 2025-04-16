import React from 'react';
import GameManager from './components/GameManager';
import './styles/main.css';

const App = () => {
  return (
    <div className="poker-app">
      <header>
        <h1>LastChipStanding</h1>
        <p className="tagline">Where friendships fold faster than bad hands</p>
      </header>
      
      <GameManager />
    </div>
  );
};

export default App;