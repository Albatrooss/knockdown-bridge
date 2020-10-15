import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import '../styles/cardstarter.min.css';
import '../styles/game.css';

import firebase from '../firebase';
import tokenService from '../utils/tokenService';

import { shuffle, sortOrder } from '../utils/randomFunctions';

export default function Game({ history }) {

  const { id } = useParams();
  const dbRef = firebase.firestore().collection(id);

  const [user, setUser] = useState({ hand: [], points: 0, turn: false });
  const [users, setUsers] = useState([]);
  const [logic, setLogic] = useState({ deck: [] });

  const userToken = tokenService.getUserFromToken();

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
      <div className="table">
        <div className="other-ui">
          <ul>
            {users.map(u => <li>
              <h4>{u.id}</h4>
              <ul>
                {u.hand.map(c => <li className="card back small" />)}
              </ul>
            </li>)}
          </ul>
        </div>
        <div className="user-ui">
          <h2>{user.id}</h2>
          <ul>
            {user.hand.map(c => <li className={`card larg ${c}`} />)}
          </ul>
        </div>
      </div>
    </section>
  )
}
