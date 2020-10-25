import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/cardstarter.min.css';
import '../styles/game.css';

import firebase from '../firebase';
import tokenService from '../utils/tokenService';

import OtherUI from '../components/OtherUI';
import UserUI from '../components/UserUI';
import PlayedCard from '../components/PlayedCard';
import EndScreen from '../components/EndScreen';
import Scoreboard from '../components/Scoreboard';

import { trumpOrder, seatPositions, starterDeck } from '../game/defaults';
import { shuffle, sortOrder, dealOneCardEach, wonTrick, followSuit } from '../utils/randomFunctions';

export default function Game({ history }) {

  const { id } = useParams();
  const dbRef = firebase.firestore().collection(id);

  const [user, setUser] = useState({ hand: [], points: 0, turn: false });
  const [users, setUsers] = useState([]);
  const [logic, setLogic] = useState({ deck: [], played: [], trump: 0, order: [], seats: [] });
  const [gameHistory, setGameHistory] = useState({});
  const [showScoreboard, setShowScoreboard] = useState(false);

  const [push, setPush] = useState(false);

  const [errMsg, setErrMsg] = useState('');

  const userToken = tokenService.getUserFromToken();

  const myTurn = (
    logic.seats[(logic.leader + logic.played.length) % logic.seats.length] === user.id && [...users, user].filter(u => u.bet === '?').length < 1) ||
    logic.seats[(logic.leader + [...users, user].filter(u => u.bet !== '?').length) % logic.seats.length] === user.id && [...users, user].some(u => u.bet === '?');

  const dealNewRound = async num => {

    // Check all tricks have been claimed
    if (logic.played.length > 0) return;
    // Change number of cards and check direction
    let numOfCards = logic.numOfCards || 0;
    let goingUp = logic.goingUp;

    if (goingUp) {
      numOfCards++;
      if (numOfCards * (users.length + 1) > 52 || numOfCards > logic.upTo) {
        console.log('here')
        goingUp = false;
        numOfCards = numOfCards - 2;
      }
    } else {
      numOfCards--;
      if (numOfCards < 1) {
        return
      }
    }

    // Reset deck
    let deck = shuffle([...starterDeck]);

    // Change trump
    let trump = logic.trump + 1;
    trump = trump % 5;

    //Clear table
    let played = [];

    let dealer = (logic.dealer + 1) % logic.seats.length;
    let leader = (dealer + 1) % logic.seats.length;

    //Add to gameHistory
    let handHistory = [{ round: logic.numOfCards + trumpOrder[logic.trump][0].toUpperCase() }];

    let all = [...users, user];
    // Calculate points
    all = all.map(u => {
      let points = u.bet > 0 ? 10 + u.bet : 5;
      handHistory.push({ user: u.id, bet: u.bet, points: u.bet === u.tricks ? u.points + points : u.points });
      if (u.bet === u.tricks) {
        return { ...u, points: u.points + points }
      }
      return u
    })

    // Reset bets and tricks, and hand
    all = all.map(u => ({
      ...u,
      hand: [],
      bet: "?",
      tricks: 0
    }));
    // Deal cards

    for (let i = 0; i < numOfCards; i++) {
      let { newUsers = all, newDeck = deck } = dealOneCardEach(all, deck);
    }

    try {
      await Promise.all([
        ...all.map(u => {
          let id = u.id;
          delete u.id;
          return dbRef.doc(id).update(u)
        }),
        dbRef.doc('logic').update({ numOfCards, /*order, */trump, deck, goingUp, played, dealer, leader }),
      ])
      if (logic.numOfCards > 0) await dbRef.doc('_history').update({ ['round' + Object.keys(gameHistory).length]: handHistory })
    } catch (err) {
      catchErr(err);
    }
  }

  const playCard = async index => {
    let all = [...users, user];

    //Check you are following suit
    if (!followSuit(user.hand, logic.played[0], index)) return

    // Check if everyone made their bets || you have allready played this round || you turn
    if (all.some(u => u.bet === '?') || logic.played.some(c => c.user === user.id) || logic.seats[(logic.leader + logic.played.length) % logic.seats.length] !== user.id) return
    let hand = user.hand;
    let played = logic.played;
    played.push({ card: hand.splice(index, 1)[0], user: user.id });
    try {
      await Promise.all([
        dbRef.doc(user.id).update({ hand }),
        dbRef.doc('logic').update({ played })
      ])
    } catch (err) {
      catchErr(err);
    }
    tokenService.extendToken();
  }

  const claimTrick = async () => {
    // Check everyone has played || you won
    if (logic.played.length !== logic.seats.length) return
    if (wonTrick(logic.played, logic.trump) !== user.id) return
    let leader = logic.seats.findIndex(u => u === user.id);
    try {
      Promise.all([
        dbRef.doc(user.id).update({ tricks: user.tricks + 1 }),
        dbRef.doc('logic').update({ played: [], leader })
      ])
      if (!logic.goingUp && logic.numOfCards === 1 && user.hand.length < 1) endGame(user.id);
    } catch (err) {
      catchErr(err);
    }
  }

  // ===========================================================================================
  //      PRE ROUND
  // ===========================================================================================

  const sortCards = async index => {
    let hand = [...user.hand];
    let temp = hand.splice(index, 1)[0];
    hand.push(temp);
    try {
      dbRef.doc(user.id).update({ hand });
    } catch (err) {
      catchErr(err);
    }
  }

  const placeBet = async bet => {

    let all = [...users, user];

    // Check if its your turn to bet
    let numOfBetsMade = all.filter(u => u.bet !== '?').length;

    let myTurnToBet = logic.seats[(numOfBetsMade) % logic.seats.length] === user.id;


    // Check to screw the deal
    let totalBets = all.reduce((a, b) => {
      if (b.bet === '?') return a;
      return a + parseInt(b.bet)
      // if (a.bet === '?') {
      //   if (b.bet === '?') {
      //     return 0
      //   } else {
      //     return 0 + b.bet
      //   }
      // } else {
      //   if (b.bet === '?') {
      //     return a.bet
      //   } else {
      //     return a.bet + b.bet
      //   }
      // }
    }, 0)
    if (logic.seats[logic.dealer] === user.id && totalBets + bet === user.hand.length) return;
    try {
      await dbRef.doc(user.id).update({ bet });
    } catch (err) {
      catchErr(err);
    }
  }

  const leaveGame = async () => {
    try {
      let seats = logic.seats;
      let ind = seats.indexOf(user.id);
      seats.splice(ind, 1);
      Promise.all([
        dbRef.doc(user.id).delete(),
        dbRef.doc('logic').update({ seats })
      ])
      tokenService.removeToken();
      history.push('/');
    } catch (err) {
      catchErr(err);
    }
  }

  function catchErr(err) {
    console.log(err);
    setErrMsg(err.message);
  }

  // ===========================================================================================
  //      END ROUND
  // ===========================================================================================

  const endGame = async (userId) => {
    let handHistory = [{ round: logic.numOfCards + trumpOrder[logic.trump][0].toUpperCase() }];

    let all = [...users, user];
    all.find(u => u.id === userId).tricks += 1;
    // Calculate points
    all = all.map(u => {
      let points = u.bet > 0 ? 10 + u.bet : 5;
      handHistory.push({ user: u.id, bet: u.bet, points: u.bet === u.tricks ? u.points + points : u.points });
      if (u.bet === u.tricks) {
        return { ...u, points: u.points + points }
      }
      return u
    })
    await Promise.all([
      ...all.map(u => dbRef.doc(u.id).update({ points: u.points })),
      dbRef.doc('logic').update({ gameOver: true }),
      dbRef.doc('_history').update({ ['round' + Object.keys(gameHistory).length]: handHistory })
    ])
  }
  const newGame = async () => {
    try {
      Promise.all([
        ...[...users, user].map(u => dbRef.doc(u.id).set({ host: u.host, hand: [], points: 0, bet: '?', tricks: 0, wins: [...users, user].sort((a, b) => b.points - a.points)[0].id === u.id ? u.wins + 1 : u.wins })),
        dbRef.doc('logic').set({ upTo: logic.upTo, deck: starterDeck, goingUp: true, numOfCards: 0, dealer: 0, leader: 2 % logic.seats, played: [], gameOn: true, gameOver: false, seats: logic.seats, trump: 4 }),
        dbRef.doc('_history').set({ temp: 'temp' })
      ])
    } catch (err) {
      catchErr(err);
    }
  }

  // ===========================================================================================
  //      USEEFFECT
  // ===========================================================================================


  useEffect(() => {
    if (!userToken) history.push('/');
    const unsubscribe = dbRef.onSnapshot(snap => {
      const connectedData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      let logicData, usersData = [], userData = {}, gameHistoryData = {};
      connectedData.forEach(data => {
        if (data.id === 'logic') {
          logicData = data;
        } else if (data.id === '_history') {
          gameHistoryData = data;
          delete gameHistoryData.id;
        } else if (data.id === userToken.username) {
          userData = data;
          usersData.push(data);
        } else {
          usersData.push(data);
        }
        userData.hand && setUser(userData);
        logicData && setLogic(logicData);
        logicData && logicData.seats && setUsers(sortOrder(userData.id, usersData, logicData.seats));
        setGameHistory(gameHistoryData)
      })
    })
    return () => unsubscribe();
  }, [id, history])

  return (
    <section className="game">
      {errMsg && <p className="err">{errMsg}</p>}
      <div className="table" >
        {users.map((u, i) => <OtherUI key={u.id} turn={logic.seats[(logic.leader + logic.played.length) % logic.seats.length] === u.id} user={u} pos={seatPositions[users.length][i]} lead={logic.seats[logic.leader] === u.id} dealer={logic.seats[logic.dealer] === u.id} />)}
        <div className={`play-area ${logic.played.length === logic.seats.length ? 'pushed' : ''}`}>
          <div className="trump">
            <h3>Trump</h3>
            <img src={`/images/cards/${trumpOrder[logic.trump]}.png`} />
            <h3 style={{ color: `var(--${logic.trump === 1 || logic.trump === 2 ? 'red' : 'black'})` }}>{logic.numOfCards} {trumpOrder[logic.trump]}</h3>
          </div>
          {logic.played.map((c, i) => (
            <PlayedCard
              key={c.card}
              winning={wonTrick(logic.played, logic.trump) === c.user}
              card={c.card}
              user={c.user}
              users={users} lead={i === 0 ? true : false}
              claimTrick={claimTrick}
            />
          ))}
        </div>
        <UserUI
          user={user}
          totalBet={users.filter(u => u.bet !== '?').reduce((a, b) => a + b.bet, 0)}
          leadSuit={logic.played[0] ? logic.played[0].card[0] : undefined}
          lead={logic.seats[logic.leader] === user.id}
          dealer={logic.seats[logic.dealer] === user.id}
          turn={myTurn}
          nextDealer={logic.seats[(logic.dealer + 1) % logic.seats.length] === user.id}
          roundOver={[...users, user].every(u => u.hand.length < 1)}
          deal={dealNewRound}
          playCard={playCard}
          sortCards={sortCards}
          betting={[...users, user].filter(u => u.bet === '?').length > 0}
          placeBet={placeBet}
          numOfCards={logic.numOfCards}
        />
        <div className="buttons">
          <button className="scoreboard-btn" onClick={() => setShowScoreboard(prev => !prev)}>Scoreboard</button>
          <button className="home-btn" onClick={leaveGame}>Leave</button>
        </div>
      </div>
      {logic.gameOver && <EndScreen newGame={newGame} users={[...users, user]} host={user.host} />}
      {showScoreboard && <Scoreboard gameHistory={gameHistory} minimize={() => setShowScoreboard(false)} users={[...users, user]} />}
    </section>
  )
}
