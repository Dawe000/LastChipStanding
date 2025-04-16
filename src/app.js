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
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} LastChipStanding</p>
        <a 
          href="https://github.com/Dawe000/LastChipStanding" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
};

export default App;