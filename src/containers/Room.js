import React, { useState, useEffect } from 'react'
import Video from 'twilio-video'
import LoaderButton from '../components/LoaderButton'
import { useHistory } from 'react-router-dom'
import Participant from '../components/Participant'

const Room = ({ roomName, token, handleLogout }) => {
  const history = useHistory()
  const [room, setRoom] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) => [...prevParticipants, participant])
    }
    const participantDisconnected = (participant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      )
    }
    Video.connect(token, {
      name: roomName,
    }).then((room) => {
      setRoom(room)
      room.on('participantConnected', participantConnected)
      room.on('participantDisconnected', participantDisconnected)
      console.log(room)
      room.participants.forEach(participantConnected)
    })

    return () => {
      setIsLoading(true)
      setRoom((currentRoom) => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function (
            trackPublication
          ) {
            trackPublication.track.stop()
          })
          currentRoom.disconnect()
          return null
        } else {
          return currentRoom
        }
      })
      history.push('/')
    }
  }, [roomName, token, history])

  const remoteParticipants = participants.map((participant) => (
    <Participant key={participant.sid} participant={participant} />
  ))

  return (
    <div className='room'>
      <h2>Room: {roomName}</h2>
      <LoaderButton isLoading={isLoading} onClick={handleLogout}>
        Leave Call
      </LoaderButton>
      <div className='local-participant'>
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        ) : (
          ''
        )}
      </div>
      <h3>Remote Participants</h3>
      <div className='remote-participants'>{remoteParticipants}</div>
    </div>
  )
}

export default Room
