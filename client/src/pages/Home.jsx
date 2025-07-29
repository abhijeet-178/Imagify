import React from 'react'
import Header from '../component/Header'
import Steps from '../component/Steps'
import Description from '../component/Description'
import Testinomials from '../component/Testinomials'
import GenerateBtn from '../component/GenerateBtn'

const Home = () => {
  return (
    <div>
      <Header/>
      <Steps/>
      <Description/>
      <Testinomials/>
      <GenerateBtn/>
    </div>
  )
}

export default Home
