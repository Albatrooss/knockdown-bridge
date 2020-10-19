import React from 'react'

export default function EndScreen({ users, newGame, host }) {

  let sortedUser = users.sort((a, b) => b.points - a.points);

  return (
    <div className="end-screen">
      <h2>Game Over!</h2>
      <ul>
        {sortedUser.map((u, i) => {
          let place;
          switch (i) {
            case 0:
              place = 'First';
              break;
            case 1:
              place = 'Second';
              break;
            case 2:
              place = 'Third';
              break;
            case 3:
              place = 'Fourth';
              break;
            case 4:
              place = 'Fifth';
              break;
            case 5:
              place = 'Sixth';
              break;
            case 6:
              place = 'Seventh';
              break;
            case 7:
              place = 'Eight';
              break;
            case 8:
              place = 'Ninth';
              break;
            case 9:
              place = 'Thenth';
              break;
          }

          return (<li key={u.id}>
            <p>{place} Place:</p><span>{u.id}</span><p>{u.points} points!</p>
          </li>)
        })}
      </ul>
      {host && <button onClick={newGame}>New GAME</button>}
    </div>
  )
}
