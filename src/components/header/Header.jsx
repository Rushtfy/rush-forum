import React from 'react'
import './header.scss'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'

const Header = () => {

    const navigate = useNavigate();

    const handleLogOut = async () => {
        await signOut(auth);
        navigate("/login");
    }

    return (
        <div className='header'>
            <div className='headerContainer'>
                <a href="/" className='logo'>RUSH <span className='logoHalf'>FORUM</span></a>
                <div className='search'>
                    <input type="text" placeholder='Search Forum...' />
                    <button>Search</button>
                </div>
                <div className="dropdown">
                    <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="image" />
                    <div id="myDropdown" className="dropdownContent">
                        <p><FontAwesomeIcon icon={faUser} />Profile</p>
                        <p><FontAwesomeIcon icon={faGear} />Settings</p>
                        <p onClick={handleLogOut}><FontAwesomeIcon icon={faArrowRightFromBracket} />Log Out</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header