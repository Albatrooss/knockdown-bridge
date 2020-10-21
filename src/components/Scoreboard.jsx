import React from 'react'

export default function Scoreboard({ gameHistory, minimize, users }) {

  let historyArray = [];
  delete gameHistory.temp;
  for (let i = 1; i < Object.keys(gameHistory).length + 1; i++) {
    historyArray.push(gameHistory[`round${i}`]);
  }
  console.log(historyArray)
  return (
    <div className="scoreboard">
      <button className="x-btn" onClick={minimize}>X</button>
      <h2>SCOREBOARD</h2>
      <table>
        <tr>
          <th>Round</th>
          {users.map(u => <th>{u.id} - {u.wins}</th>)}
        </tr>
        {historyArray.map((h, i) => <tr>
          <td>{h[0].round}</td>
          {sortArray(h, users.map(u => u.id)).map(round => <td>
            <span style={{ marginLeft: `-${15 * digitsCount(round.points)}px` }}>{round.bet}</span>{round.points}
          </td>)}
        </tr>)}
      </table>
    </div>
  )
}

function sortArray(arr, sorted) {
  let newArr = [];
  for (let i = 0; i < sorted.length; i++) {
    newArr.push(arr.find(x => x.user === sorted[i]));
  }
  return newArr;
}

function digitsCount(n) {
  let count = 0;
  if (n >= 1) ++count;
  while (n / 10 >= 1) {
    n /= 10;
    ++count;
  }
  return count === 0 ? 1 : count;
}