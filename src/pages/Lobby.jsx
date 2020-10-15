import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/lobby.css'

import tokenService from '../utils/tokenService'
import firebase from '../firebase';
import { shuffle } from '../utils/randomFunctions';

export default function Lobby({ history }) {

  const { id } = useParams();
  const dbRef = firebase.firestore().collection(id);

  const [errMsg, setErrMsg] = useState('')
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [logic, setLogic] = useState({ order: [] });
  const [host, setHost] = useState(false);

  let userToken = tokenService.getUserFromToken();

  const joinLobby = async e => {
    try {
      e.preventDefault();
      if (users.length > 3) {
        setErrMsg('Lobby Full..');
        return;
      }
      if (users.some(u => u.id === username)) {
        setErrMsg("Username allready taken..");
      } else {
        await dbRef.doc(username).set({
          hand: [],
          points: [],
          host: users.find(u => u.host) ? false : true
        });
        tokenService.setTokenFromUser({ username, lobby: id })
        setUsername('');
      }
    } catch (err) {
      console.log(err);
      setErrMsg(err.message);
    }
  }

  const leaveLobby = async index => {
    try {
      tokenService.removeToken();
      if (index === 0 && users.length > 1) {
        console.log(users[1].id);
        await dbRef.doc(users[1].id).update({ host: true })
      }
      await dbRef.doc(users[index].id).delete();
    } catch (err) {
      console.log(err);
      setErrMsg(err.message);
    }
  }

  const startGame = async () => {
    try {
      await Promise.all([
        dbRef.doc('logic').update({ order: shuffle(users.map(u => u.id)) }),
        dealFirstRound()
      ])
    } catch (err) {
      console.log(err);
      setErrMsg(err.message);
    }
  }

  const dealFirstRound = async () => {
    let deck = logic.deck;
    let userHands = users.map(u => u.hand);
    users.forEach((u, i) => {
      userHands[i].push(deck.pop())
    })
    await Promise.all([
      ...userHands.map((u, i) => dbRef.doc(users[i].id).update({ hand: u })),
      dbRef.doc('logic').update({ deck, order: users.map(u => u.id), gameOn: true }),
    ])
  }

  const goHome = () => {
    tokenService.removeToken();
    history.push('/');
  }

  const copyToClipboard = text => {
    let textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  const usersList = [];
  for (let i = 0; i < 4; i++) {
    usersList.push(
      users[i] ? <li >
        {i + 1}.<span>{users[i].id} {users[i].host ? '(host)' : ''}</span>
        {userToken && userToken.username === users[i].id && <button onClick={() => leaveLobby(i)}><div className='x' /><div className='x' /></button>}
      </li> : <li className="blank-li">{i + 1}. --empty slot--</li>
    )
  }

  /* ================================================================================================================
            USE EFFECT
  ================================================================================================================ */

  useEffect(() => {
    const myToken = userToken;
    const check = async () => {
      try {
        let c = await dbRef.get();
        if (c.docs.length < 1) {
          localStorage.setItem('message', 'Lobby not found..');
          history.push('/');
        }
        // setLoading(false);
        return true;
      } catch (err) {
        console.log(err);
        setErrMsg(err.message);
      }
    }
    const unsubscribe = dbRef.onSnapshot(snap => {
      try {
        const userList = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (userList.find(x => x.gameOn)) {
          if (myToken.lobby === id) {
            history.push(`/${id}/game`);
          } else {
            localStorage.setItem('message', 'Game allready started without you..');
            history.push('/');
          }
        } else {
          let usersList = [];
          userList.forEach(u => {
            if (u.id !== 'logic') {
              if (u.host) {
                usersList.unshift(u);
              } else {
                usersList.push(u);
              }
            } else {
              setLogic(u);
            }
          })
          setUsers(usersList);
        }
        console.log(myToken);
        if (myToken) {
          let host = userList.find(x => x.host);
          if (host && host.id === myToken.username) setHost(true);
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        setErrMsg(err.message);
      }
    })
    check();
    return () => { unsubscribe() }
  }, [id, history])

  /* ================================================================================================================
            RETURN
  ================================================================================================================ */

  return loading ? (
    <section className="lobby">
      LOADING...
    </section>
  ) : (
      <section className="lobby">
        <div className="writing">
          <h2>Welcome to the Lobby!</h2>
          <p>Copy and paste this link to your friends to invite them to play!</p>
          <span onClick={() => copyToClipboard(`http://localhost:3000/${id.replace(/\s/g, '%20')}/lobby`)} className="link">localhost:3000/{id.replace(/\s/g, '%20')}/lobby{copied && <p className="copied">Copied!</p>}</span>
        </div>
        {errMsg && <p className="err">{errMsg}</p>}
        <div className="user-list">
          <h4>Users:</h4>
          <ul>
            {usersList}
          </ul>
          {!userToken && <>
            <div className="form-wrapper">
              <form onSubmit={joinLobby} autoComplete="off">
                <div className="input-wrapper">
                  <input type="text" value={username} id="username" onChange={e => setUsername(e.target.value)} />
                  <label htmlFor="username" className={`label ${username ? 'filled' : ''}`}><span>Username</span></label>
                </div>
                <button type="submit">Join</button>
              </form>
            </div>
          </>}
        </div>
        {host ?
          <button className="start-game-btn" onClick={startGame}>Start Game</button> :
          <>{userToken ? <p>Waiting for the host to start the game..</p> : ''}</>
        }
        <button onClick={goHome}>Home</button><br />
        {logic.deck.filter((x, i) => i < 5).map(card => <div className={`card ${card}`} >{card}</div>)}
      </section>
    )
}
