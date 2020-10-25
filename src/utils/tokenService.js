const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret';

function createJWT(user) {
  return jwt.sign(
    user,
    SECRET,
    { expiresIn: '1h' }
  )
}

function setToken(token) {
  localStorage.setItem('knockdown-token', token);
}

function setTokenFromUser(user) {
  const t = createJWT(user);
  setToken(t);
}

function getToken() {
  let token = localStorage.getItem('knockdown-token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) {
      localStorage.removeItem('knockdown-token');
      token = null;
    }
  }
  return token;
}

function getUserFromToken() {
  const token = getToken();
  return token ? JSON.parse(atob(token.split('.')[1])) : null;
}

function extendToken() {
  const uToken = getUserFromToken();
  let u = { username: uToken.username, lobby: uToken.lobby };
  let newToken = createJWT(u)
  console.log(atob(newToken.split('.')[1]));
  setToken(newToken);
}

function removeToken() {
  localStorage.removeItem('knockdown-token');
}

export default {
  createJWT,
  setToken,
  setTokenFromUser,
  getToken,
  getUserFromToken,
  extendToken,
  removeToken
}