import React, { useState } from 'react';
import '../styles/user-ui.css';
import PlayedCard from './PlayedCard';

export default function UserUI({ user, turnToBet, placeBet, lead, dealer, deal, playCard, sortCards }) {

  const [bet, setBet] = useState(0);

  const incBet = () => {
    let newBet = bet + 1;
    setBet(newBet > user.hand.length ? user.hand.length : newBet)
  }

  const decBet = () => {
    let newBet = bet - 1;
    setBet(newBet < 0 ? 0 : newBet)
  }

  const myTricks = [];
  for (let i = 0; i < user.tricks; i++) {
    myTricks.push(<li key={i}><div className={`card back small ${i % 2 === 1 ? 'west' : ''}`} style={{ zIndex: i }} />{i === user.tricks - 1 && <p>{user.tricks}</p>}</li>)
  }

  return (
    <div className="user-ui">
      <h2>{user.id}{lead ? <span> - Lead</span> : <></>}</h2>
      <ul className="user-hand">
        {user.hand.map((c, i) => user.bet === '?' ? <li key={c} style={{ zIndex: i }} onClick={() => sortCards(i)}><div className={`card large ${c}`} /></li> : <li key={c} onClick={() => playCard(i)}><div className={`card large ${c}`} /></li>)}
      </ul>
      <div className="user-options">
        {user.bet === '?' ? (turnToBet ? <div className="bet">
          <h3>{bet}</h3>
          <button onClick={incBet}>+</button>
          <button onClick={decBet}>-</button>
          <button onClick={() => placeBet(bet)}>Place Bet</button>
        </div> : <div className="user-options">
            <h3>Waiting to Place Bet..</h3>
          </div>) : <div className="points-etc">
            <ul className="my-tricks">
              {myTricks}
            </ul>
            <div className="tricks-won"></div>
            <div className="points"><span>{user.bet}</span>{user.points}</div>
          </div>}
        {dealer && <div className="user-dealer" onClick={deal}><div className="card back large" /><div className="card back large" /><p>Deal</p></div>}
      </div>
    </div >
  )
}
