import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './containers/Home'
import NotFound from './containers/NotFound'
import Login from './containers/Login'
import Signup from './containers/Signup'
import VideoContainer from './containers/VideoContainer'
import AuthenticatedRoute from './components/AuthenticatedRoute'
import UnauthenticatedRoute from './components/UnauthenticatedRoute'

export default function Routes() {
  return (
    <Switch>
      <AuthenticatedRoute exact path='/'>
        <Home />
      </AuthenticatedRoute>
      <UnauthenticatedRoute exact path='/login'>
        <Login />
      </UnauthenticatedRoute>
      <UnauthenticatedRoute exact path='/signup'>
        <Signup />
      </UnauthenticatedRoute>
      <AuthenticatedRoute exact path='/video-chat'>
        <VideoContainer />
      </AuthenticatedRoute>
      {/* Finally, catch all unmatched routes */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  )
}
