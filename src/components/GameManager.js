import React, { useState, useEffect, useCallback } from 'react';
import PlayerSetup from './PlayerSetup';
import GameTable from './GameTable';
import Showdown from './Showdown';

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

  // State management
  const [players, setPlayers] = useState([]);
  const [gameStage, setGameStage] = useState(GAME_STAGES.SETUP);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [pot, setPot] = useState(0);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [playersActedThisRound, setPlayersActedThisRound] = useState({});
  const [smallBlindIndex, setSmallBlindIndex] = useState(-1);
  const [bigBlindIndex, setBigBlindIndex] = useState(-1);

  // All your existing functions: addPlayer, removePlayer, editPlayerMoney, startGame, etc.
  const addPlayer = (name) => {
    if (!name.trim()) return;

    setPlayers([
      ...players,
      {
        name: name,
        stack: 1000, // Default starting chips
        bet: 0,
        folded: false,
        hasTakenAction: false
      }
    ]);
  };

  const removePlayer = (indexToRemove) => {
    const updatedPlayers = players.filter((_, index) => index !== indexToRemove);
    setPlayers(updatedPlayers);

    if (indexToRemove === dealerIndex) {
      setDealerIndex(dealerIndex > 0 ? dealerIndex - 1 : 0);
    } else if (indexToRemove < dealerIndex) {
      setDealerIndex(dealerIndex - 1);
    }
  };

  const editPlayerMoney = (playerIndex, newAmount) => {
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid amount");
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].stack = newAmount;
    setPlayers(updatedPlayers);
  };

  const startGame = () => {
    if (players.length < 2) {
      alert("You need at least 2 players to start a game");
      return;
    }

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

    handleBlinds();
  };

  const handleBlinds = () => {
    const sbIndex = (dealerIndex + 1) % players.length;
    const bbIndex = (dealerIndex + 2) % players.length;

    const updatedPlayers = [...players];

    updatedPlayers[sbIndex].stack -= smallBlind;
    updatedPlayers[sbIndex].bet = smallBlind;

    updatedPlayers[bbIndex].stack -= bigBlind;
    updatedPlayers[bbIndex].bet = bigBlind;

    setActivePlayerIndex((bbIndex + 1) % players.length);
    setSmallBlindIndex(sbIndex); // Track small blind
    setBigBlindIndex(bbIndex);   // Track big blind

    setPlayers(updatedPlayers);
    setPot(smallBlind + bigBlind);
  };

  const playerAction = (action, amount = 0) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[activePlayerIndex];

    console.log(`Player ${currentPlayer.name} is taking action: ${action}`);
    console.log("Current bet:", currentBet);
    console.log("Players acted this round:", playersActedThisRound);

    const updatedPlayersActed = { ...playersActedThisRound };
    updatedPlayersActed[activePlayerIndex] = true;

    switch (action) {
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

        // Important: Update these BEFORE calling moveToNextPlayer
        const newPlayersActed = {};
        newPlayersActed[activePlayerIndex] = true;

        // Update pot and current bet
        setPot(pot + raiseDiff);
        setCurrentBet(raiseTotal);

        console.log("Raise detected - resetting player actions to:", newPlayersActed);
        console.log("Current bet updated to:", raiseTotal);

        // SPECIAL HANDLING FOR 2-PLAYER GAMES
        const activePlayersAfterRaise = updatedPlayers.filter(p => !p.folded);
        if (activePlayersAfterRaise.length === 2) {
          // In 2-player games, directly set the next player index
          const otherPlayerIndex = updatedPlayers.findIndex(
            (p, idx) => !p.folded && idx !== activePlayerIndex
          );
          
          console.log(`2-player game raise detected, forcing turn to player: ${updatedPlayers[otherPlayerIndex].name}`);
          
          // Update all relevant state in one go
          setPlayers(updatedPlayers);
          setPlayersActedThisRound(newPlayersActed);
          setActivePlayerIndex(otherPlayerIndex);
          return;
        }
        
        // For 3+ player games, use the normal flow
        setPlayersActedThisRound(newPlayersActed);
        setPlayers(updatedPlayers);
        moveToNextPlayer(updatedPlayers);
        return; // Skip the default flow at the end

      case 'check':
        if (currentPlayer.bet === currentBet) {
          const allPlayers = updatedPlayers.filter(p => !p.folded);
          let actedCount = 0;
          for (let i = 0; i < updatedPlayers.length; i++) {
            if (!updatedPlayers[i].folded &&
              (updatedPlayersActed[i] || i === activePlayerIndex)) {
              actedCount++;
            }
          }

          if (actedCount === allPlayers.length) {
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

      case 'all-in':
        // Calculate the player's total commitment
        const allInAmount = currentPlayer.stack + currentPlayer.bet;

        // How much more they're adding to the pot
        const allInDiff = currentPlayer.stack;

        // Update player's stack and bet
        currentPlayer.stack = 0;
        currentPlayer.bet = allInAmount;

        // Update the pot
        setPot(pot + allInDiff);

        // Check if this all-in is a raise
        if (allInAmount > currentBet) {
          // Reset players' acted status as this is essentially a raise
          const allInPlayersActed = {};
          allInPlayersActed[activePlayerIndex] = true;

          // Update current bet
          setCurrentBet(allInAmount);

          console.log("All-in raise detected - resetting player actions to:", allInPlayersActed);

          // SPECIAL HANDLING FOR 2-PLAYER GAMES
          const activePlayersAfterAllIn = updatedPlayers.filter(p => !p.folded);
          if (activePlayersAfterAllIn.length === 2) {
            // In 2-player games, directly set the next player
            const otherPlayerIndex = updatedPlayers.findIndex(
              (p, idx) => !p.folded && idx !== activePlayerIndex
            );

            console.log(`2-player game all-in detected, forcing turn to player: ${updatedPlayers[otherPlayerIndex].name}`);

            // Update all relevant state in one go
            setPlayers(updatedPlayers);
            setPlayersActedThisRound(allInPlayersActed);
            setActivePlayerIndex(otherPlayerIndex);
            return;
          }

          // For 3+ player games, use the normal flow
          setPlayersActedThisRound(allInPlayersActed);
          setPlayers(updatedPlayers);
          moveToNextPlayer(updatedPlayers);
          return;
        } else {
          // This is like a call that happens to be all remaining chips
          updatedPlayersActed[activePlayerIndex] = true;
          setPlayersActedThisRound(updatedPlayersActed);
          setPlayers(updatedPlayers);
          moveToNextPlayer(updatedPlayers);
          return;
        }
        break;

      default:
        break;
    }

    setPlayersActedThisRound(updatedPlayersActed);
    moveToNextPlayer(updatedPlayers);
    setPlayers(updatedPlayers);
  };

  const moveToNextPlayer = (currentPlayers) => {
    // First, check if only one player remains active
    const activePlayers = currentPlayers.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      setIsRoundComplete(true);
      return;
    }

    // Create a more accurate check for whether all players have acted correctly
    let allActivePlayersActedAndMatched = true;

    // For each active player, check if they've acted AND matched the current bet
    for (let i = 0; i < currentPlayers.length; i++) {
      const player = currentPlayers[i];
      // Skip folded players
      if (player.folded) continue;

      // A player needs to act if:
      // 1. They haven't acted this round OR
      // 2. They've acted but haven't matched the current bet
      if (!playersActedThisRound[i] || player.bet !== currentBet) {
        allActivePlayersActedAndMatched = false;
        break;
      }
    }

    // If everyone has acted and matched the bet, complete the round
    if (allActivePlayersActedAndMatched) {
      setIsRoundComplete(true);
      return;
    }

    // Otherwise, find the next player who needs to act
    // IMPORTANT: Always start from the next player after current one
    let nextIndex = (activePlayerIndex + 1) % currentPlayers.length;
    let loopCount = 0;

    while (loopCount < currentPlayers.length) {
      // Skip players who have folded
      if (currentPlayers[nextIndex].folded) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        loopCount++;
        continue;
      }

      // Skip players who have already acted AND matched the current bet
      if (playersActedThisRound[nextIndex] && currentPlayers[nextIndex].bet === currentBet) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        loopCount++;
        continue;
      }

      // Found a player who needs to act
      break;
    }

    // Safety check - if we've looped through all players and found none who need to act
    if (loopCount >= currentPlayers.length) {
      // Double-check: is it because everyone has acted and matched?
      let everyoneMatched = true;
      for (let i = 0; i < currentPlayers.length; i++) {
        if (currentPlayers[i].folded) continue;

        if (currentPlayers[i].bet !== currentBet) {
          everyoneMatched = false;
          break;
        }
      }

      if (everyoneMatched) {
        console.log("All players have matched the current bet, round complete");
        setIsRoundComplete(true);
        return;
      }

      // Special case: only one player hasn't folded
      const unfoldedCount = currentPlayers.filter(p => !p.folded).length;
      if (unfoldedCount <= 1) {
        console.log("Only one player remains, round complete");
        setIsRoundComplete(true);
        return;
      }

      // If we get here, something's wrong
      console.error("Logic error: no players need to act but round isn't complete");
      setIsRoundComplete(true);
      return;
    }

    // Set the next active player
    setActivePlayerIndex(nextIndex);

    console.log(`Next player: ${currentPlayers[nextIndex]?.name || 'Unknown'} (index: ${nextIndex})`);
    console.log("Players acted status:", playersActedThisRound);
    console.log("Current bet:", currentBet);
    console.log("Player bets:", currentPlayers.map(p => `${p.name}: ${p.bet}`));
  };

  const advanceGameStage = useCallback(() => {
    console.log("Advancing game stage from", gameStage);
    
    // Reset all bets for the next round
    const updatedPlayers = players.map(player => ({
      ...player,
      bet: 0,
      hasTakenAction: false
    }));

    setPlayers(updatedPlayers);
    setCurrentBet(0);
    setPlayersActedThisRound({});
    
    const activePlayers = updatedPlayers.filter(p => !p.folded);

    if (activePlayers.length <= 1) {
      console.log("Only one active player, advancing to showdown");
      setGameStage(GAME_STAGES.SHOWDOWN);
      return;
    }

    // Find first active player to the left of the dealer
    // Start with small blind position (dealer + 1)
    let nextActivePlayer = (dealerIndex + 1) % players.length;
    let loopCount = 0;

    while (updatedPlayers[nextActivePlayer].folded && loopCount < players.length) {
      nextActivePlayer = (nextActivePlayer + 1) % players.length;
      loopCount++;
    }

    if (loopCount >= players.length) {
      console.log("All players folded, advancing to showdown");
      setGameStage(GAME_STAGES.SHOWDOWN);
      return;
    }

    setActivePlayerIndex(nextActivePlayer);
    console.log(`First player in new round: ${updatedPlayers[nextActivePlayer].name} (starting from SB position)`);

    // Advance to next game stage
    switch (gameStage) {
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
  }, [
    players,
    dealerIndex,
    gameStage,
    GAME_STAGES.FLOP,
    GAME_STAGES.PREFLOP,
    GAME_STAGES.RIVER,
    GAME_STAGES.SHOWDOWN,
    GAME_STAGES.TURN
  ]);

  useEffect(() => {
    if (isRoundComplete) {
      const activePlayers = players.filter(p => !p.folded);

      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        const winnerIndex = players.findIndex(p => p.name === winner.name);

        const updatedPlayers = players.map((player, idx) =>
          idx === winnerIndex
            ? { ...player, stack: player.stack + pot }
            : player
        );

        alert(`${winner.name} wins ${pot} chips as all others folded!`);
        setPot(0);
        setPlayers(updatedPlayers);
        setGameStage(GAME_STAGES.SHOWDOWN);
      } else {
        advanceGameStage();
      }

      setIsRoundComplete(false);
    }
  }, [isRoundComplete, players, pot, GAME_STAGES.SHOWDOWN, advanceGameStage]);

  const awardPot = (winnerIndex) => {
    if (pot <= 0) {
      alert("There is no pot to award.");
      return;
    }

    const winnerName = players[winnerIndex].name;
    const potAmount = pot;
    const updatedPlayers = [...players];
    updatedPlayers[winnerIndex].stack += pot;

    setPlayers(updatedPlayers);
    setPot(0);

    alert(`${winnerName} was awarded ${potAmount} chips!`);
  };

  const startNewHand = () => {
    const newDealerIndex = (dealerIndex + 1) % players.length;
    setDealerIndex(newDealerIndex);

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
    setGameStage(GAME_STAGES.PREFLOP);

    setTimeout(() => {
      const sbIndex = (newDealerIndex + 1) % resetPlayers.length;
      const bbIndex = (newDealerIndex + 2) % resetPlayers.length;

      const updatedPlayers = [...resetPlayers];

      updatedPlayers[sbIndex].stack -= smallBlind;
      updatedPlayers[sbIndex].bet = smallBlind;

      updatedPlayers[bbIndex].stack -= bigBlind;
      updatedPlayers[bbIndex].bet = bigBlind;

      setActivePlayerIndex((bbIndex + 1) % updatedPlayers.length);
      setSmallBlindIndex(sbIndex); // Track small blind
      setBigBlindIndex(bbIndex);   // Track big blind
      
      setPlayers(updatedPlayers);
      setPot(smallBlind + bigBlind);
      setCurrentBet(bigBlind);
    }, 0);
  };

  const restartGame = () => {
    const resetPlayers = players.map(player => ({
      name: player.name,
      stack: 1000,
      bet: 0,
      folded: false,
      hasTakenAction: false
    }));

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

  const goToMenu = () => {
    const resetPlayers = players.map(player => ({
      name: player.name,
      stack: player.stack,
      bet: 0,
      folded: false,
      hasTakenAction: false
    }));

    setPlayers(resetPlayers);
    setGameStage(GAME_STAGES.SETUP);
    setActivePlayerIndex(0);
    setPot(0);
    setCurrentBet(0);
    setPlayersActedThisRound({});
    setIsRoundComplete(false);
    setBetAmount('');
  };

  let gameContent;

  if (gameStage === GAME_STAGES.SETUP) {
    gameContent = (
      <PlayerSetup
        players={players}
        addPlayer={addPlayer}
        removePlayer={removePlayer}
        editPlayerMoney={editPlayerMoney}
        dealerIndex={dealerIndex}
        smallBlind={smallBlind}
        bigBlind={bigBlind}
        setSmallBlind={setSmallBlind}
        setBigBlind={setBigBlind}
        startGame={startGame}
        restartGame={restartGame}
      />
    );
  } else if (gameStage === GAME_STAGES.SHOWDOWN) {
    gameContent = (
      <Showdown
        pot={pot}
        players={players}
        awardPot={awardPot}
        startNewHand={startNewHand}
        goToMenu={goToMenu}
        restartGame={restartGame}
      />
    );
  } else {
    gameContent = (
      <GameTable
        gameStage={gameStage}
        pot={pot}
        currentBet={currentBet}
        players={players}
        activePlayerIndex={activePlayerIndex}
        dealerIndex={dealerIndex}
        smallBlindIndex={smallBlindIndex} // Pass small blind index
        bigBlindIndex={bigBlindIndex}     // Pass big blind index
        playerAction={playerAction}
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        goToMenu={goToMenu}
      />
    );
  }

  return <div className="game-manager">{gameContent}</div>;
};

export default GameManager;