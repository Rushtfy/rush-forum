import { faArrowRightFromBracket, faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './header.scss';

const Header = () => {
    const navigate = useNavigate();
    const [dropdown, setDropdown] = useState(false);
    const [profilePicture, setProfilePicture] = useState("");
    const { currentUser } = useContext(AuthContext);
    const dropdownRef = useRef(null);

    const handleLogOut = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const toggleDropdown = () => {
        setDropdown(!dropdown);
    };

    const goProfile = () => {
        navigate(`/profile/${currentUser.uid}`);
    };

    const goSettings = () => {
        navigate("/settings");
    };

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
        };
        currentUser.uid && getProfilePicture();
    }, [currentUser.uid]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdown(false);
            }
        };

        if (dropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdown]);

    return (
        <div className="header">
            <div className="headerContainer">
                <a href="/" className="logo">
                    RUSH <span className="logoHalf">FORUM</span>
                </a>
                <div className="search">
                    <input type="text" placeholder="Search Forum..." />
                    <button>Search</button>
                </div>
                <div className={`dropdownAndImage ${dropdown ? "open" : ""}`} ref={dropdownRef}>
                    <img
                        src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"}
                        alt="profile"
                        onClick={toggleDropdown}
                    />
                    <div className="dropdownContent">
                        <p onClick={goProfile}>
                            <FontAwesomeIcon icon={faUser} /> Profile
                        </p>
                        <p onClick={goSettings} className="settings">
                            <FontAwesomeIcon icon={faGear} /> Settings
                        </p>
                        <p onClick={handleLogOut}>
                            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Log Out
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;