import React from 'react'

import { seatPositions } from '../game/defaults';

export default function PlayedCard({ user, users, card, lead }) {

  const westSeats = [0, 1, 2, 6, 7, 8]

  const seatPos = seatPositions[users.length][users.findIndex(u => u.id === user)];

  const pos = seatPos >= 0 ? 'p' + seatPos : 'my-card'

  return (
    <div className={pos}>
      <div className={`card ${card} ${lead ? '' : 'small'} shadow ${westSeats.includes(seatPos) ? 'west' : ''}`} />
    </div>
  )
}
