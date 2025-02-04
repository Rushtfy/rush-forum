import React from 'react'
import './header.scss'

const Header = () => {
    return (
        <div className='header'>
            <div className='headerContainer'>
                <a href="/" className='logo'>RUSH <span className='logoHalf'>FORUM</span></a>
                <div className='search'>
                    <input type="text" placeholder='Search Forum...' />
                    <button>Search</button>
                </div>
                <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="image" />
            </div>
        </div>
    )
}

export default Header