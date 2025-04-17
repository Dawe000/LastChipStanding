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

    setPlayers(updatedPlayers);
    setPot(smallBlind + bigBlind);
  };

  const playerAction = (action, amount = 0) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[activePlayerIndex];

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

        const raiseDiff = raiseTotal - currentPlayer.bet;
        currentPlayer.stack -= raiseDiff;
        currentPlayer.bet = raiseTotal;
        setCurrentBet(raiseTotal);
        setPot(pot + raiseDiff);

        const newPlayersActed = {};
        newPlayersActed[activePlayerIndex] = true;
        setPlayersActedThisRound(newPlayersActed);
        break;

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
        // Calculate the player's total commitment (current bet + remaining stack)
        const allInAmount = currentPlayer.stack + currentPlayer.bet;

        // How much more they're adding to the pot
        const allInDiff = currentPlayer.stack;

        // Update current bet only if this all-in is higher
        if (allInAmount > currentBet) {
          setCurrentBet(allInAmount);

          // Reset players' acted status as this is essentially a raise
          const newPlayersActed = {};
          newPlayersActed[activePlayerIndex] = true;
          setPlayersActedThisRound(newPlayersActed);
        } else {
          // This is like a call that happens to be all remaining chips
          updatedPlayersActed[activePlayerIndex] = true;
        }

        // Update player's stack and bet
        currentPlayer.stack = 0;
        currentPlayer.bet = allInAmount;
        setPot(pot + allInDiff);
        break;

      default:
        break;
    }

    setPlayersActedThisRound(updatedPlayersActed);
    moveToNextPlayer(updatedPlayers);
    setPlayers(updatedPlayers);
  };

  const moveToNextPlayer = (currentPlayers) => {
    const activePlayers = currentPlayers.filter(p => !p.folded);

    if (activePlayers.length === 1) {
      setIsRoundComplete(true);
      return;
    }

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

    let nextIndex = (activePlayerIndex + 1) % currentPlayers.length;
    let loopCount = 0;

    while (loopCount < currentPlayers.length) {
      if (currentPlayers[nextIndex].folded) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        loopCount++;
        continue;
      }

      if (playersActedThisRound[nextIndex] &&
        currentPlayers[nextIndex].bet === currentBet) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        loopCount++;
        continue;
      }

      break;
    }

    if (loopCount >= currentPlayers.length) {
      setIsRoundComplete(true);
      return;
    }

    setActivePlayerIndex(nextIndex);
  };

  const advanceGameStage = useCallback(() => {
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
      setGameStage(GAME_STAGES.SHOWDOWN);
      return;
    }

    let nextActivePlayer = (dealerIndex + 1) % players.length;
    let loopCount = 0;

    while (updatedPlayers[nextActivePlayer].folded && loopCount < players.length) {
      nextActivePlayer = (nextActivePlayer + 1) % players.length;
      loopCount++;
    }

    if (loopCount >= players.length) {
      setGameStage(GAME_STAGES.SHOWDOWN);
      return;
    }

    setActivePlayerIndex(nextActivePlayer);

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