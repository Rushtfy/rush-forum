import React from 'react'
import Layout from '../../components/layout/Layout';
import Sidebar from './components/sidebar/Sidebar';
import './home.scss'
import Discussions from './components/discussions/Discussions';
import Header from '../../components/header/Header';

const Home = () => {

  return (
    <div className='homeBody'>
      <Header/>
      <div className='home'>
        <Sidebar />
        <Discussions />
      </div>
    </div>
  )
}

export default Home