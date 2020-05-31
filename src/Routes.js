import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './containers/Home'
import NotFound from './containers/NotFound'
import Login from './containers/Login'
import Signup from './containers/Signup'
import VideoContainer from './containers/VideoContainer'
import AuthenticatedRoute from './components/AuthenticatedRoute'
import UnauthenticatedRoute from './components/UnauthenticatedRoute'
import VideoForm from './containers/VideoForm'
import NewNote from './containers/NewNote'

export default function Routes() {
  return (
    <Switch>
      <AuthenticatedRoute exact path='/'>
        <Home />
      </AuthenticatedRoute>
      {/* <AuthenticatedRoute exact path='/video-form'>
        <VideoForm />
      </AuthenticatedRoute> */}
      <UnauthenticatedRoute exact path='/login'>
        <Login />
      </UnauthenticatedRoute>
      <UnauthenticatedRoute exact path='/signup'>
        <Signup />
      </UnauthenticatedRoute>
      <AuthenticatedRoute exact path='/video-chat'>
        <VideoContainer />
      </AuthenticatedRoute>
      <AuthenticatedRoute exact path='/notes/new'>
        <NewNote />
      </AuthenticatedRoute>
      {/* Finally, catch all unmatched routes */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  )
}
