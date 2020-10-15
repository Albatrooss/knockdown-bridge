import React, { useState, useEffect } from 'react'
import '../styles/home.css';

import firebase from '../firebase';
import tokenService from '../utils/tokenService';

import { starterDeck } from '../game/defaults';
import { shuffle } from '../utils/randomFunctions';

const db = firebase.firestore();

export default function Home({ history }) {

  const [lobbyName, setLobbyName] = useState('');
  const [username, setUsername] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [hidden, setHidden] = useState(true);

  const createLobby = async e => {
    e.preventDefault();
    let check, randomName, lName;
    if (lobbyName === '') {
      randomName = randomLobbyName();
      check = await db.collection(randomName).get();
      while (check.docs.length > 0) {
        randomName = randomLobbyName();
        check = await db.collection(randomName).get();
      }
    } else {
      check = await db.collection(lobbyName).get();
    }
    if (check.docs.length > 0) {
      setErrMsg('Lobby taken, please choose another name..');
    } else {
      lName = lobbyName === '' ? randomName : lobbyName;
      await db.collection(lName).doc(username).set({
        hand: [],
        points: 0,
        host: true
      });
      await db.collection(lName).doc('logic').set({
        deck: shuffle(starterDeck),
        trump: 0,
        order: ['clubs', 'diamonds', 'hearts', 'spades', 'no trump'],
        numOfCards: 1,
        goingUp: true,
        order: [username]
      });
      let list = await db.collection('lobbyList').get();
      console.log(list.docs[0].data())
      await db.collection('lobbyList').doc('list').update({ list: [...list.docs[0].data().list, lName] });
      tokenService.setTokenFromUser({ username: username, lobby: lName });
      history.push(`/${lName}/lobby`);
    }
  }

  useEffect(() => {
    let user = tokenService.getUserFromToken();
    if (user) {
      console.log(user);
      history.push(`/${user.lobby}/lobby`)
    } else {
      console.log('No user..')
    }

  })

  return (
    <section className="home">
      <h1>Knockdown Bridge</h1>
      <p>Welcome to Knockdown Bridge! Fill out the form below to create a lobby, then send the link created to you friends to invite them to play! Create a custom lobby name, or leave it blank for a randomly generated name.</p>
      {errMsg && <p className="err">{errMsg}</p>}
      <div className="form-wrapper">
        <form onSubmit={createLobby} autoComplete="off">
          <div className="input-wrapper">
            <input type="text" id="lobbyName" value={lobbyName} onChange={e => setLobbyName(e.target.value)} />
            <label htmlFor="lobbyName" className={`label ${lobbyName ? 'filled' : ''}`}><span>Lobby Name</span></label>
          </div>
          <div className="input-wrapper">
            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} />
            <label htmlFor="username" className={`label ${username ? 'filled' : ''}`}><span>Username</span></label>
          </div>
          <div className="select-btn">
            <button type="submit" >Create Lobby</button>
          </div>
        </form>
      </div>
      <button onClick={() => tokenService.setTokenFromUser({ user: 'Tim', lobby: 'jkgfj' })}>TEST</button>
    </section>
  )
}

function randomLobbyName() {
  let options = '1234567890!@#$^*()_+=qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,'
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += options[Math.floor(Math.random() * options.length)]
  }
  return res;
}