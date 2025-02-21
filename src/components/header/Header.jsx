import { faArrowRightFromBracket, faGear, faUser, faMessage, faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './header.scss';

const Header = () => {

    const navigate = useNavigate();

    const [dropdown, setDropdown] = useState(false);
    const [profilePicture, setProfilePicture] = useState("");

    const { currentUser } = useContext(AuthContext);

    const handleLogOut = async () => {
        await signOut(auth);
        navigate("/login");
    }

    const showDropdown = () => {
        if (dropdown) {
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

    const goSettings = () => {
        navigate("/settings");
    }
    
    useEffect(() => {
        const getProfilePicture = async () => {
            if (!currentUser?.uid) return;
    
            try {
                const res = await getDoc(doc(db, "users", currentUser.uid));
                if (res.exists()) {
                    setProfilePicture(res.data().photoURL);
                } else {
                    console.log("User document not found.");
                }
            } catch (error) {
                console.log("Something went wrong:", error);
            }
        }

        currentUser.uid && getProfilePicture();
    }, [currentUser.uid]);

    return (
        <div className='header'>
            <div className='headerContainer'>
                <a href="/" className='logo'>RUSH <span className='logoHalf'>FORUM</span></a>
                <div className='search'>
                    <input type="text" placeholder='Search Forum...' />
                    <button>Search</button>
                </div>
                    <div className="dropdown">
                        <img src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" onClick={showDropdown} />
                        <div id="myDropdown" className="dropdownContent">
                            <p onClick={goProfile}><FontAwesomeIcon icon={faUser} />Profile</p>
                            <p onClick={goSettings} className='settings'><FontAwesomeIcon icon={faGear} />Settings</p>
                            <p onClick={handleLogOut}><FontAwesomeIcon icon={faArrowRightFromBracket} />Log Out</p>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Header