import { faArrowRightFromBracket, faGear, faMessage, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defUser from '../../assets/default_user.jpg';
import { auth, db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './header.scss';

const Header = () => {
    const navigate = useNavigate();
    const [dropdown, setDropdown] = useState(false);
    const [profilePicture, setProfilePicture] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({ users: [], posts: [], tags: [] });
    const { currentUser } = useContext(AuthContext);
    const dropdownRef = useRef(null);

    const handleLogOut = async () => {
        try {
            await signOut(auth);
            navigate("/login");
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    };

    const toggleDropdown = () => {
        setDropdown(!dropdown);
    };

    const goProfile = () => {
        navigate(`/profile/${currentUser.uid}`);
        window.location.reload();
    };

    const goSettings = () => {
        navigate("/settings");
    };

    const handleSearch = async (e) => {
        const queryValue = (e.target.value);
        setSearchQuery(queryValue);
        if (!queryValue) return;

        const userRef = collection(db, "users");
        const postRef = collection(db, "userPosts");

        try {
            const usersSnapshot = await getDocs(query(userRef, where("displayName", ">=", queryValue), where("displayName", "<=", queryValue + '\uf8ff')));
            const postsSnapshot = await getDocs(postRef);

            const users = [];
            const posts = [];
            const tags = [];

            usersSnapshot.forEach(doc => users.push(doc.data()));
            postsSnapshot.forEach(doc => {
                const postData = doc.data();
                Object.values(postData).forEach(post => {
                    if (post.title.includes(queryValue)) posts.push(post);

                    if (post.tags?.some(tag => tag.toLowerCase().includes(queryValue.toLowerCase()))) {
                        post.tags.forEach(tag => {
                            if (tag.toLowerCase().includes(queryValue.toLowerCase()) && !tags.includes(tag)) {
                                tags.push(tag);
                            }
                        });
                    }
                });
            });

            setSearchResults({ users, posts, tags });
        } catch (error) {
            console.error("Error during search:", error);
        }
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
                    <input
                        type="text"
                        placeholder="Search Forum..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e)}
                    />
                    {searchQuery && (
                        <div className="searchResults">
                            {searchResults.users.length > 0 && (
                                <div className="searchResultsSection">
                                    <h3>Users</h3>
                                    <ul>
                                        {searchResults.users.map((user, index) => (
                                            <li key={index} onClick={() => navigate(`/profile/${user.uid}`)}>
                                                {user.displayName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {searchResults.posts.length > 0 && (
                                <div className="searchResultsSection">
                                    <h3>Posts</h3>
                                    <ul>
                                        {searchResults.posts.map((post, index) => (
                                            <li key={index} onClick={() => navigate(`/postDetail/${post.ownerUid}/${post.id}`)}>
                                                {post.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {searchResults.tags.length > 0 && (
                                <div className="searchResultsSection">
                                    <h3>Tags</h3>
                                    <ul>
                                        {searchResults.tags.map((tag, index) => (
                                            <li key={index} onClick={() => navigate(`/category/${tag}`)}>
                                                {tag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>


                <div className={`dropdownAndImage ${dropdown ? "open" : ""}`} ref={dropdownRef}>
                    <img
                        src={profilePicture || defUser}
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
                        <p onClick={() => navigate("/chat")}>
                            <FontAwesomeIcon icon={faMessage} /> Chat
                        </p>
                        <p onClick={() => navigate("/following")}>
                            <FontAwesomeIcon icon={faUsers} /> Following
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