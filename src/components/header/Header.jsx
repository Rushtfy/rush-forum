import React, { useState } from 'react'
import './header.scss'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'

const Header = () => {

    const navigate = useNavigate();
    const [dropdown, setDropdown] = useState(false);

    const handleLogOut = async () => {
        await signOut(auth);
        navigate("/login");
    }

    const showDropdown = () => {
        if(dropdown) {
            document.getElementById("myDropdown").style.display = "none";
            setDropdown(false);
        } else {
            document.getElementById("myDropdown").style.display = "block";
            setDropdown(true);
        }
    }

    const goProfile = () => {
        navigate("/profile");
    }

    return (
        <div className='header'>
            <div className='headerContainer'>
                <a href="/" className='logo'>RUSH <span className='logoHalf'>FORUM</span></a>
                <div className='search'>
                    <input type="text" placeholder='Search Forum...' />
                    <button>Search</button>
                </div>
                <div className='ppAndSwitch'>
                    <label
                        htmlFor="themeToggle"
                        className="themeToggle st-sunMoonThemeToggleBtn"
                        type="checkbox"
                    >
                        <input type="checkbox" id="themeToggle" className="themeToggleInput" />
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="none"
                        >
                            <mask id="moon-mask">
                                <rect x="0" y="0" width="20" height="20" fill="white"></rect>
                                <circle cx="11" cy="3" r="8" fill="black"></circle>
                            </mask>
                            <circle
                                className="sunMoon"
                                cx="10"
                                cy="10"
                                r="8"
                                mask="url(#moon-mask)"
                            ></circle>
                            <g>
                                <circle className="sunRay sunRay1" cx="18" cy="10" r="1.5"></circle>
                                <circle className="sunRay sunRay2" cx="14" cy="16.928" r="1.5"></circle>
                                <circle className="sunRay sunRay3" cx="6" cy="16.928" r="1.5"></circle>
                                <circle className="sunRay sunRay4" cx="2" cy="10" r="1.5"></circle>
                                <circle className="sunRay sunRay5" cx="6" cy="3.1718" r="1.5"></circle>
                                <circle className="sunRay sunRay6" cx="14" cy="3.1718" r="1.5"></circle>
                            </g>
                        </svg>
                    </label>
                    <div className="dropdown">
                        <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="Profile Picture" onClick={showDropdown}/>
                        <div id="myDropdown" className="dropdownContent">
                            <p onClick={goProfile}><FontAwesomeIcon icon={faUser} />Profile</p>
                            <p className='settings'><FontAwesomeIcon icon={faGear} />Settings</p>
                            <p onClick={handleLogOut}><FontAwesomeIcon icon={faArrowRightFromBracket} />Log Out</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header