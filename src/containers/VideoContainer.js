import React, { useEffect, useState } from 'react'
import './VideoContainer.css'
import VideoChat from '../components/VideoChat'
import { onError } from '../libs/errorLib'
import { useAppContext } from '../libs/contextLib'

const VideoContainer = () => {
  const [token, setToken] = useState(null)
  const { userEmail } = useAppContext()
  
  useEffect(() => {
    try {
      fetch('/api/video/token', {
        method: 'POST',
        body: JSON.stringify({
          identity: userEmail,
          room: 'test-room',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => setToken(data.token))
    } catch (e) {
      onError(e)
    }

    return () => {
      setToken(null)
    }
  }, [])

  return (
    <div className='app'>
      <header>
        <h1>Video Chat</h1>
      </header>
      <main>{token && <VideoChat token={token} />}</main>
      <footer></footer>
    </div>
  )
}

export default VideoContainer
