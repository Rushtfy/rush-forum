import React from 'react'
import Layout from '../../components/layout/Layout';
import Sidebar from '../../components/sidebar/Sidebar';
import './home.scss'
import Discussions from '../discussions/Discussions';
import Header from '../../components/header/Header';

const Home = () => {

  return (
    <Layout>
      <Discussions/>
    </Layout>
  )
}

export default Home