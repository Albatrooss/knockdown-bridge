const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret';

function createJWT(user) {
  return jwt.sign(
    user,
    SECRET
  )
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function setTokenFromUser(user) {
  const t = createJWT(user);
  setToken(t);
}

function getToken() {
  let token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) {
      localStorage.removeItem('token');
      token = null;
    }
  }
  return token;
}

function getUserFromToken() {
  const token = getToken();
  return token ? JSON.parse(atob(token.split('.')[1])) : null;
}

function removeToken() {
  localStorage.removeItem('token');
}

export default {
  createJWT,
  setToken,
  setTokenFromUser,
  getToken,
  getUserFromToken,
  removeToken
}