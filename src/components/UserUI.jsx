import React, { useState } from 'react';
import '../styles/user-ui.css';
import PlayedCard from './PlayedCard';

export default function UserUI({ user, leadSuit, turnToBet, placeBet, lead, dealer, nextDealer, roundOver, deal, playCard, sortCards, turn }) {

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
      {turn && user.hand.length > 0 && <h3 className="your-turn">Your Turn!</h3>}
      <ul className="user-hand">
        {user.hand.map((c, i) => {
          let followSuitOp = true;
          if (leadSuit) {

          }
          return user.bet === '?' ?
            (i === user.hand.length - 1 ? <li key={c} style={{ zIndex: i }} onClick={() => sortCards(i)}>
              <div className={`card large ${c}`} />
            </li> :
              <li key={c} style={{ zIndex: i, maxWidth: `calc(calc(100% - 104px) / ${user.hand.length})` }} onClick={() => sortCards(i)}>
                <div className={`card large ${c}`} />
              </li>) :
            (i === user.hand.length - 1 ? <li key={c} style={{ zIndex: i, opacity: followSuitOp ? 1 : 0.8 }} onClick={() => playCard(i)}>
              <div className={`card large ${c}`} />
            </li> :
              <li key={c} style={{ zIndex: i, maxWidth: `calc(calc(100% - 104px) / ${user.hand.length})`, opacity: followSuitOp ? 1 : 0.8 }} onClick={() => playCard(i)}>
                <div className={`card large ${c}`} />
              </li>)
        })}
      </ul>
      <div className="user-options">
        {user.bet === '?' ? (turnToBet ? <div className="bet">
          <div className="bet-ctrl">
            <div>
              <h4 onClick={decBet}>-</h4>
              <h3>{bet}</h3>
              <h4 onClick={incBet}>+</h4>
            </div>
            <button onClick={() => {
              placeBet(bet);
              setBet(0);
            }}>Place Bet</button>
          </div>
          <div className="small-points">{user.points}</div>
        </div> : <div className="bet">
            <h3>Waiting to Place Bet..</h3>
            <div className="small-points">{user.points}</div>
          </div>) : <div className="points-etc">
            <ul className="my-tricks">
              {myTricks}
            </ul>
            <div className="tricks-won"></div>
            <div className="points"><span>{user.bet}</span>{user.points}</div>
          </div>}
        {nextDealer && roundOver && <div className="user-dealer" onClick={deal}><div className="card back large" /><div className="card back large" /><p>Deal</p></div>}
        {dealer && <div className="user-dealer-symbol">D</div>}
      </div>
    </div >
  )
}
