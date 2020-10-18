import React from 'react'
import '../styles/other-ui.css';

export default function OtherUI({ user, pos, turn, lead, dealer }) {
  return (
    <div className={`other o${pos} ${turn ? 'glowing' : ''}`}>
      <h4>{user.id}<span>{lead ? ' - Lead' : ''}</span></h4>
      <ul className="other-hand">
        {user.hand.map(c => <li key={c} className="other-card-wrapper"><div className="card back small" /></li>)}
      </ul>
      { dealer && <div className="dealer">D</div>}
      <div className="other-tricks trick-bg card back" /><div className="other-tricks tricks-o">{user.tricks}</div>
      <div className="other-points"><span>{user.bet}</span>{user.points}</div>
    </div >)
}
