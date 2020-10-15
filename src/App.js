import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import './styles/App.css';
import './styles/components/forms.css';

import tokenService from './utils/tokenService';

import Home from './pages/Home';
import Game from './pages/Game';
import Lobby from './pages/Lobby';

function App() {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/:id/lobby' render={({ history }) => <Lobby history={history} />} />
        <Route path='/:id/game' render={({ history }) => <Game history={history} />} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
