import React from 'react'
import Header from '../header/Header'
import Sidebar from '../sidebar/Sidebar'
import '../../pages/home/home.scss'

const Layout = ({ children }) => {
  return (
    <div className='homeBody'>
      <Header />
      <div className='home'>
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  )
}

export default Layout