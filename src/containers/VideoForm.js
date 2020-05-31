import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

const VideoForm = () => {
  const history = useHistory()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = () => {
    history.push('/video-chat')
  }

  return (
    <form>
      <div>
        <label>Name:</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          for='name'
          type='name'
        ></input>
      </div>
      <div>
        <label>Email:</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          for='email'
          type='email'
        ></input>
      </div>
      <button type='submit' onClick={handleSubmit}>
        Submit
      </button>
    </form>
  )
}

export default VideoForm
