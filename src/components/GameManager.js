import React, { useState, useEffect } from 'react';

const GameManager = () => {
  // Game stages
  const GAME_STAGES = {
    SETUP: 'setup',
    PREFLOP: 'preflop',
    FLOP: 'flop',
    TURN: 'turn',
    RIVER: 'river',
    SHOWDOWN: 'showdown'
  };

  // State
  const [players, setPlayers] = useState([]);
  const [gameStage, setGameStage] = useState(GAME_STAGES.SETUP);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [pot, setPot] = useState(0);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  
  // For tracking if all players have acted
  const [playersActedThisRound, setPlayersActedThisRound] = useState({});

  // Set up a new player
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    
    setPlayers([
      ...players, 
      { 
        name: newPlayerName, 
        stack: 1000, // Default starting chips
        bet: 0, 
        folded: false,
        hasTakenAction: false
      }
    ]);
    setNewPlayerName('');
  };

  // Function to remove a player
  const removePlayer = (indexToRemove) => {
    const updatedPlayers = players.filter((_, index) => index !== indexToRemove);
    setPlayers(updatedPlayers);
    
    // If we're removing the current dealer, adjust the dealer position
    if (indexToRemove === dealerIndex) {
      setDealerIndex(dealerIndex > 0 ? dealerIndex - 1 : 0);
    } else if (indexToRemove < dealerIndex) {
      // If we're removing a player before the dealer, adjust the dealer index
      setDealerIndex(dealerIndex - 1);
    }
  };

  // Function to handle editing a player's money
  const editPlayerMoney = (playerIndex, newAmount) => {
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].stack = newAmount;
    setPlayers(updatedPlayers);
  };

  // Start the game
  const startGame = () => {
    if (players.length < 2) {
      alert("You need at least 2 players to start a game");
      return;
    }
    
    // Reset all players
    const resetPlayers = players.map(player => ({
      ...player,
      bet: 0,
      folded: false,
      hasTakenAction: false
    }));
    
    setPlayers(resetPlayers);
    setGameStage(GAME_STAGES.PREFLOP);
    setPot(0);
    setCurrentBet(bigBlind);
    
    // Post blinds
    handleBlinds();
  };

  // Handle blind postings
  const handleBlinds = () => {
    // Small blind is posted by player after dealer
    const sbIndex = (dealerIndex + 1) % players.length;
    // Big blind is posted by player after small blind
    const bbIndex = (dealerIndex + 2) % players.length;
    
    const updatedPlayers = [...players];
    
    // Post small blind
    updatedPlayers[sbIndex].stack -= smallBlind;
    updatedPlayers[sbIndex].bet = smallBlind;
    
    // Post big blind
    updatedPlayers[bbIndex].stack -= bigBlind;
    updatedPlayers[bbIndex].bet = bigBlind;
    
    // First to act is player after big blind
    setActivePlayerIndex((bbIndex + 1) % players.length);
    
    setPlayers(updatedPlayers);
    setPot(smallBlind + bigBlind);
  };

  // Player actions
  const playerAction = (action, amount = 0) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[activePlayerIndex];
    
    // Mark that this player has acted
    const updatedPlayersActed = {...playersActedThisRound};
    updatedPlayersActed[activePlayerIndex] = true;
    
    switch(action) {
      case 'fold':
        currentPlayer.folded = true;
        break;
        
      case 'call':
        const callAmount = currentBet - currentPlayer.bet;
        if (callAmount > 0) {
          currentPlayer.stack -= callAmount;
          currentPlayer.bet = currentBet;
          setPot(pot + callAmount);
        }
        
        // Important: Check if everyone has now called or folded
        let allMatched = true;
        for (let i = 0; i < updatedPlayers.length; i++) {
          if (!updatedPlayers[i].folded && 
              (updatedPlayers[i].bet !== currentBet || 
               (!updatedPlayersActed[i] && i !== activePlayerIndex))) {
            allMatched = false;
            break;
          }
        }
        
        if (allMatched) {
          // Everyone has matched the bet, go to next round immediately
          setPlayers(updatedPlayers);
          setPlayersActedThisRound(updatedPlayersActed);
          setIsRoundComplete(true);
          return;
        }
        break;
        
      case 'raise':
        const raiseTotal = parseInt(amount);
        if (isNaN(raiseTotal)) {
          alert("Please enter a valid raise amount");
          return;
        }
        
        if (raiseTotal > currentPlayer.stack) {
          alert("You can't bet more than you have");
          return;
        }
        
        if (raiseTotal <= currentBet) {
          alert("Raise must be greater than current bet");
          return;
        }
        
        // Calculate how much to add to the pot
        const raiseDiff = raiseTotal - currentPlayer.bet;
        currentPlayer.stack -= raiseDiff;
        currentPlayer.bet = raiseTotal;
        setCurrentBet(raiseTotal);
        setPot(pot + raiseDiff);
        
        // When someone raises, everyone needs to act again EXCEPT the raiser
        const newPlayersActed = {};
        newPlayersActed[activePlayerIndex] = true;
        setPlayersActedThisRound(newPlayersActed);
        break;
        
      case 'check':
        // If checking is allowed (no bet to call)
        if (currentPlayer.bet === currentBet) {
          // After marking this player as having acted, check if this was the last player
          const allPlayers = updatedPlayers.filter(p => !p.folded);
          
          // Count how many players have acted
          let actedCount = 0;
          for (let i = 0; i < updatedPlayers.length; i++) {
            if (!updatedPlayers[i].folded && 
                (updatedPlayersActed[i] || i === activePlayerIndex)) {
              actedCount++;
            }
          }
          
          // If all non-folded players have now acted, complete the round immediately
          if (actedCount === allPlayers.length) {
            // Don't proceed to moveToNextPlayer, end round directly
            setPlayers(updatedPlayers);
            setPlayersActedThisRound(updatedPlayersActed);
            setIsRoundComplete(true);
            return;
          }
        } else {
          alert("You cannot check, you must call or fold");
          return;
        }
        break;
        
      default:
        break;
    }
    
    // Move to next active player
    setPlayersActedThisRound(updatedPlayersActed);
    moveToNextPlayer(updatedPlayers);
    setPlayers(updatedPlayers);
  };

  // Move to next active player
  const moveToNextPlayer = (currentPlayers) => {
    // Count active (non-folded) players
    const activePlayers = currentPlayers.filter(p => !p.folded);
    
    // If only one player remains active, end the round immediately
    if (activePlayers.length === 1) {
      setIsRoundComplete(true);
      return;
    }
    
    // Check if all remaining players have acted and matched the current bet
    let allPlayersActed = true;
    for (let i = 0; i < currentPlayers.length; i++) {
      const player = currentPlayers[i];
      if (!player.folded && 
          (!playersActedThisRound[i] || player.bet !== currentBet)) {
        allPlayersActed = false;
        break;
      }
    }
    
    if (allPlayersActed) {
      setIsRoundComplete(true);
      return;
    }
    
    // Find next active player who needs to act
    let nextIndex = (activePlayerIndex + 1) % currentPlayers.length;
    let loopCount = 0;
    
    while (loopCount < currentPlayers.length) {
      // Skip folded players
      if (currentPlayers[nextIndex].folded) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        loopCount++;
        continue;
      }
      
      // Skip players who have already acted and matched the current bet
      if (playersActedThisRound[nextIndex] && 
          currentPlayers[nextIndex].bet === currentBet) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        loopCount++;
        continue;
      }
      
      // Found a valid player to act
      break;
    }
    
    // If we've checked every player and couldn't find anyone who needs to act
    if (loopCount >= currentPlayers.length) {
      setIsRoundComplete(true);
      return;
    }
    
    setActivePlayerIndex(nextIndex);
  };

  // Check if round is complete
  useEffect(() => {
    if (isRoundComplete) {
      // Count active players (not folded)
      const activePlayers = players.filter(p => !p.folded);
      
      if (activePlayers.length === 1) {
        // If only one player remains, award pot immediately
        const winner = activePlayers[0];
        const winnerIndex = players.findIndex(p => p.name === winner.name);
        
        const updatedPlayers = players.map((player, idx) => 
          idx === winnerIndex
            ? {...player, stack: player.stack + pot} 
            : player
        );
        
        alert(`${winner.name} wins ${pot} chips as all others folded!`);
        setPot(0);
        setPlayers(updatedPlayers);
        setGameStage(GAME_STAGES.SHOWDOWN);
      } else {
        // More than one player, move to next stage
        advanceGameStage();
      }
      
      // Always make sure to reset this flag
      setIsRoundComplete(false);
    }
  }, [isRoundComplete, players, pot]);

  // Advance to next stage of the game
  const advanceGameStage = () => {
    // Reset bets but preserve folded status
    const updatedPlayers = players.map(player => ({
      ...player,
      bet: 0,
      hasTakenAction: false
    }));
    
    setPlayers(updatedPlayers);
    setCurrentBet(0);
    setPlayersActedThisRound({});
    
    // Find active players (not folded)
    const activePlayers = updatedPlayers.filter(p => !p.folded);
    
    // If only one player is active, we shouldn't be here (should have ended before)
    if (activePlayers.length <= 1) {
      setGameStage(GAME_STAGES.SHOWDOWN);
      return;
    }
    
    // Find first non-folded player after dealer
    let nextActivePlayer = (dealerIndex + 1) % players.length;
    let loopCount = 0;

    // Loop until we find a player who hasn't folded, with safety check
    while (updatedPlayers[nextActivePlayer].folded && loopCount < players.length) {
      nextActivePlayer = (nextActivePlayer + 1) % players.length;
      loopCount++;
    }

    // If we've checked all players and they're all folded (shouldn't happen)
    // this is just a safety check
    if (loopCount >= players.length) {
      setGameStage(GAME_STAGES.SHOWDOWN);
      return;
    }

    setActivePlayerIndex(nextActivePlayer);
    
    // Advance game stage
    switch(gameStage) {
      case GAME_STAGES.PREFLOP:
        setGameStage(GAME_STAGES.FLOP);
        break;
      case GAME_STAGES.FLOP:
        setGameStage(GAME_STAGES.TURN);
        break;
      case GAME_STAGES.TURN:
        setGameStage(GAME_STAGES.RIVER);
        break;
      case GAME_STAGES.RIVER:
        setGameStage(GAME_STAGES.SHOWDOWN);
        break;
      default:
        break;
    }
  };

  // Award pot to winner
  const awardPot = (winnerIndex) => {
    if (pot <= 0) {
      alert("There is no pot to award.");
      return;
    }
    
    const winnerName = players[winnerIndex].name;
    const potAmount = pot; // Store for the alert
    
    const updatedPlayers = [...players];
    updatedPlayers[winnerIndex].stack += pot;
    
    setPlayers(updatedPlayers);
    setPot(0);
    
    alert(`${winnerName} was awarded ${potAmount} chips!`);
  };

  // Start new hand
  const startNewHand = () => {
    // Move dealer button
    const newDealerIndex = (dealerIndex + 1) % players.length;
    setDealerIndex(newDealerIndex);
    
    // Reset all players' folded status and bets
    const resetPlayers = players.map(player => ({
      ...player,
      bet: 0,
      folded: false,
      hasTakenAction: false
    }));
    
    setPlayers(resetPlayers);
    setPot(0);
    setCurrentBet(0);
    setPlayersActedThisRound({});
    
    // Go directly to preflop instead of setup
    setGameStage(GAME_STAGES.PREFLOP);
    
    // Post blinds for the new hand (need to do this after a slight delay 
    // to ensure players state is updated first)
    setTimeout(() => {
      // Small blind is posted by player after dealer
      const sbIndex = (newDealerIndex + 1) % resetPlayers.length;
      // Big blind is posted by player after small blind
      const bbIndex = (newDealerIndex + 2) % resetPlayers.length;
      
      const updatedPlayers = [...resetPlayers];
      
      // Post small blind
      updatedPlayers[sbIndex].stack -= smallBlind;
      updatedPlayers[sbIndex].bet = smallBlind;
      
      // Post big blind
      updatedPlayers[bbIndex].stack -= bigBlind;
      updatedPlayers[bbIndex].bet = bigBlind;
      
      // First to act is player after big blind
      setActivePlayerIndex((bbIndex + 1) % updatedPlayers.length);
      
      setPlayers(updatedPlayers);
      setPot(smallBlind + bigBlind);
      setCurrentBet(bigBlind);
    }, 0);
  };

  // Modified restart game function that preserves player list
  const restartGame = () => {
    // Reset players' stats but keep their names and chip stacks
    const resetPlayers = players.map(player => ({
      name: player.name,
      stack: 1000, // Reset stack to default
      bet: 0,
      folded: false,
      hasTakenAction: false
    }));
    
    // Keep players but reset game state
    setPlayers(resetPlayers);
    setGameStage(GAME_STAGES.SETUP);
    setActivePlayerIndex(0);
    setPot(0);
    setCurrentBet(0);
    setDealerIndex(0);
    setPlayersActedThisRound({});
    setIsRoundComplete(false);
    setBetAmount('');
  };

  // Go to menu function that preserves player list and their current stacks
  const goToMenu = () => {
    // Reset players' bets and folded status but keep their names and current chip stacks
    const resetPlayers = players.map(player => ({
      name: player.name,
      stack: player.stack,  // Keep current stack
      bet: 0,
      folded: false,
      hasTakenAction: false
    }));
    
    // Keep players but reset game state
    setPlayers(resetPlayers);
    setGameStage(GAME_STAGES.SETUP);
    setActivePlayerIndex(0);
    setPot(0);
    setCurrentBet(0);
    setPlayersActedThisRound({});
    setIsRoundComplete(false);
    setBetAmount('');
  };

  // Render different views based on game stage
  let gameView;
  
  if (gameStage === GAME_STAGES.SETUP) {
    gameView = (
      <div className="setup-screen">
        <h2>Add Players</h2>
        <div className="add-player-form">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Player Name"
          />
          <button onClick={addPlayer}>Add Player</button>
        </div>
        
        <div className="player-list">
          <h3>Players:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index} className="player-item">
                <div className="player-info">
                  <span>{player.name} - ${player.stack}</span>
                  {index === dealerIndex && <span className="dealer-tag"> (Dealer)</span>}
                </div>
                <div className="player-actions">
                  <div className="edit-money">
                    <input 
                      type="number" 
                      placeholder="New amount"
                      min="0"
                      onChange={(e) => {
                        const element = e.target;
                        element.dataset.amount = e.target.value;
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        const newAmount = parseInt(input.dataset.amount);
                        editPlayerMoney(index, newAmount);
                        input.value = '';
                      }}
                    >
                      Update
                    </button>
                  </div>
                  <button 
                    onClick={() => removePlayer(index)} 
                    className="remove-player-btn"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="game-settings">
          <div>
            <label>Small Blind: </label>
            <input 
              type="number" 
              value={smallBlind} 
              onChange={(e) => setSmallBlind(parseInt(e.target.value))} 
            />
          </div>
          <div>
            <label>Big Blind: </label>
            <input 
              type="number" 
              value={bigBlind} 
              onChange={(e) => setBigBlind(parseInt(e.target.value))} 
            />
          </div>
        </div>
        
        <div className="game-controls">
          <button 
            onClick={startGame} 
            disabled={players.length < 2}
            className="start-game-btn"
          >
            Start Game
          </button>
          
          {/* Always show a restart button on the menu */}
          <button 
            onClick={restartGame} 
            className="restart-game-btn"
            disabled={players.length === 0}
          >
            Reset All Stacks
          </button>
        </div>
      </div>
    );
  } else if (gameStage === GAME_STAGES.SHOWDOWN) {
    gameView = (
      <div className="showdown-screen">
        <h2>Showdown</h2>
        
        <div className="pot">
          <h3>Pot: ${pot}</h3>
        </div>
        
        <div className="active-players">
          <h3>Players:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index} className={player.folded ? 'folded-player' : ''}>
                {player.name} - ${player.stack}
                {player.folded ? ' (Folded)' : (
                  <button 
                    onClick={() => awardPot(index)} 
                    disabled={pot <= 0}
                  >
                    Award Pot
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="game-controls">
          <button onClick={startNewHand} className="new-hand-btn">
            Start New Hand
          </button>
          <button onClick={goToMenu} className="menu-btn">
            Go to Menu
          </button>
          <button onClick={restartGame} className="restart-game-btn">
            Restart Game
          </button>
        </div>
      </div>
    );
  } else {
    // Regular game view (PREFLOP, FLOP, TURN, RIVER)
    gameView = (
      <div className="game-screen">
        <div className="game-info">
          <h2>Current Stage: {gameStage.toUpperCase()}</h2>
          <div className="pot">
            <h3>Pot: ${pot}</h3>
          </div>
          <div className="current-bet">
            <h3>Current Bet: ${currentBet}</h3>
          </div>
        </div>
        
        {gameStage !== GAME_STAGES.PREFLOP && (
          <div className="community-cards-prompt">
            <div className="card-instruction">
              {gameStage === GAME_STAGES.FLOP && "Dealer: Place 3 community cards (the flop)"}
              {gameStage === GAME_STAGES.TURN && "Dealer: Place 1 community card (the turn)"}
              {gameStage === GAME_STAGES.RIVER && "Dealer: Place 1 final community card (the river)"}
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
        
        {!players[activePlayerIndex]?.folded && players[activePlayerIndex] && (
          <div className="player-actions">
            <h3>Actions for {players[activePlayerIndex]?.name}</h3>
            
            <div className="action-buttons">
              <button onClick={() => playerAction('fold')}>
                Fold
              </button>
              
              {players[activePlayerIndex]?.bet < currentBet ? (
                <button onClick={() => playerAction('call')}>
                  Call ${currentBet - players[activePlayerIndex]?.bet}
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
                  min={currentBet > 0 ? currentBet * 2 : bigBlind}
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
            </div>
          </div>
        )}
        
        <div className="game-controls">
          <button onClick={goToMenu} className="menu-btn">
            Go to Menu
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="game-manager">
      {gameView}
    </div>
  );
};

export default GameManager;