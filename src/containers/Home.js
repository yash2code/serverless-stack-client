import React, { useState } from 'react'
import './Home.css'
import LoaderButton from '../components/LoaderButton'
import { useHistory } from 'react-router-dom'
import { useAppContext } from '../libs/contextLib'

export default function Home() {
  console.log(useAppContext())
  const history = useHistory()

  const [isLoading, setIsLoading] = useState(false)
  const handleClick = () => {
    setIsLoading(true)

    history.push('/video-chat')
  }
  return (
    <div className='Home'>
      <div className='lander'>
        <h1>WeAdmit</h1>
        <p>BUILD THE PERFECT COLLEGE COUNSELING TEAM FOR YOUR CHILD</p>
      </div>
      <LoaderButton
        block
        type='submit'
        bsSize='large'
        onClick={handleClick}
        isLoading={isLoading}
      >
        Get Started
      </LoaderButton>
    </div>
  )
}
