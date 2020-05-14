import React, { useState, useCallback } from 'react'
import Room from '../containers/Room'

const VideoChat = (props) => {
  const [token, setToken] = useState(props.token)

  const handleLogout = useCallback((event) => {
    setToken(null)
  }, [])

  return (
    <div>
      {' '}
      {token && (
        <Room roomName='test-room' token={token} handleLogout={handleLogout} />
      )}
    </div>
  )
}

export default VideoChat
