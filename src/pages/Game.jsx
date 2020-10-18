import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/cardstarter.min.css';
import '../styles/game.css';

import firebase from '../firebase';
import tokenService from '../utils/tokenService';

import OtherUI from '../components/OtherUI';
import UserUI from '../components/UserUI';
import PlayedCard from '../components/PlayedCard';

import { trumpOrder, playTemplates, seatPositions, starterDeck } from '../game/defaults';
import { dealCards, shuffle, sortOrder, dealOneCardEach } from '../utils/randomFunctions';

export default function Game({ history }) {

  const { id } = useParams();
  const dbRef = firebase.firestore().collection(id);

  const [user, setUser] = useState({ hand: [], points: 0, turn: false });
  const [users, setUsers] = useState([]);
  const [logic, setLogic] = useState({ deck: [], played: [], trump: 0, order: [], seats: [] });

  const [errMsg, setErrMsg] = useState('');

  const userToken = tokenService.getUserFromToken();

  const dealNewRound = async num => {
    // Change number of cards and check direction
    let numOfCards = logic.numOfCards || 0;
    let goingUp = logic.goingUp;

    if (goingUp) {
      numOfCards++;
      if (numOfCards * (users.length + 1) > 52) {
        console.log('here')
        goingUp = false;
        numOfCards = numOfCards - 2;
      }
    } else {
      numOfCards--;
      if (numOfCards < 1) {
        alert('Game Over');
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

    //  Change order + dealer + leader
    let order = logic.order;
    let temp = order.shift()
    order.push(temp);

    let dealer = (logic.dealer + 1) % logic.seats.length;
    let leader = 0;

    // Reset bets and tricks, and hand
    let all = [...users, user];
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
        dbRef.doc('logic').update({ numOfCards, order, trump, deck, goingUp, played, dealer, leader })
      ])
    } catch (err) {
      catchErr(err);
    }
  }

  const playCard = async index => {
    let all = [...users, user];

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
  }

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
      if (a.bet === '?') {
        if (b.bet === '?') {
          return 0
        } else {
          return 0 + b.bet
        }
      } else {
        if (b.bet === '?') {
          return a.bet
        } else {
          return a.bet + b.bet
        }
      }
    })
    let dealer = logic.order[logic.order.length - 1] === user.id;
    if (dealer && totalBets + bet === user.hand.length) return;
    try {
      await dbRef.doc(user.id).update({ bet });
    } catch (err) {
      catchErr(err);
    }
  }

  const leaveGame = async () => {
    try {
      let order = logic.order;
      let ind = order.findIndex(o => 0 === user.id);
      order.splice(ind, 1);
      await Promise.all([
        dbRef.doc(user.id).delete(),
        dbRef.doc('logic').update({ order })
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

  useEffect(() => {
    if (!userToken) history.push('/');
    const unsubscribe = dbRef.onSnapshot(snap => {
      const connectedData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      let logicData, usersData = [], userData = {};
      connectedData.forEach(data => {
        if (data.id === 'logic') {
          logicData = data;
        } else if (data.id === userToken.username) {
          userData = data;
          usersData.push(data);
        } else {
          usersData.push(data);
        }
        userData.hand && setUser(userData);
        logicData && setLogic(logicData);
        logicData && logicData.order && setUsers(sortOrder(userData.id, usersData, logicData.order));
      })
    })
    return () => unsubscribe();
  }, [id, history])

  return (
    <section className="game">
      {errMsg && <p className="err">{errMsg}</p>}
      <div className="table" >
        {users.map((u, i) => <OtherUI key={u.id} turn={logic.seats[(logic.leader + logic.played.length) % logic.seats.length] === u.id} user={u} pos={seatPositions[users.length][i]} lead={logic.seats[logic.leader] === u.id} dealer={logic.seats[logic.dealer] === u.id} />)}
        <div className="play-area" >
          <div className="trump">
            <h3>Trump</h3>
            <img src={`/images/cards/${trumpOrder[logic.trump]}.png`} />
            <h3 style={{ color: `var(--${logic.trump === 1 || logic.trump === 2 ? 'red' : 'black'})` }}>{logic.numOfCards} {trumpOrder[logic.trump]}</h3>
          </div>
          {logic.played.map((c, i) => (
            <PlayedCard key={c.card} card={c.card} user={c.user} users={users} lead={i === 0 ? true : false} />
          ))}
        </div>
        <UserUI
          user={user}
          lead={logic.seats[logic.leader] === user.id}
          dealer={logic.seats[logic.dealer] === user.id}
          deal={dealNewRound}
          playCard={playCard}
          sortCards={sortCards}
          turnToBet={logic.seats[([...users, user].filter(u => u.bet !== '?').length) % logic.seats.length] === user.id}
          placeBet={placeBet}
        />
      </div>
      <button onClick={() => dealNewRound(2)}>Round 2</button>
      <button onClick={leaveGame}>Home</button>
    </section>
  )
}
