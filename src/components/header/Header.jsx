import { faArrowRightFromBracket, faGear, faMessage, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defUser from '../../assets/default_user.jpg';
import { auth, db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './header.scss';

const Header = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [dropdown, setDropdown] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], posts: [], tags: [] });
    const [searchOpen, setSearchOpen] = useState(false);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    const debouncedQuery = useDebounce(searchQuery, 300);

    const handleLogOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    };

    const toggleDropdown = () => setDropdown((v) => !v);

    const closeDropdown = () => setDropdown(false);

    const goProfile = () => {
        closeDropdown();
        navigate(`/profile/${currentUser.uid}`);
    };

    const goSettings = () => {
        closeDropdown();
        navigate('/settings');
    };

    useEffect(() => {
        const getProfilePicture = async () => {
            if (!currentUser?.uid) return;
            try {
                const res = await getDoc(doc(db, 'users', currentUser.uid));
                if (res.exists()) setProfilePicture(res.data().photoURL || '');
            } catch (error) {
                console.log('Something went wrong:', error);
            }
        };
        if (currentUser?.uid) getProfilePicture();
    }, [currentUser?.uid]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdown(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setDropdown(false);
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    useEffect(() => {
        const runSearch = async () => {
            const q = debouncedQuery.trim();
            if (!q) {
                setSearchResults({ users: [], posts: [], tags: [] });
                return;
            }
            try {
                const userRef = collection(db, 'users');
                const postRef = collection(db, 'userPosts');

                const usersSnapshot = await getDocs(
                    query(userRef, where('displayName', '>=', q), where('displayName', '<=', q + '\uf8ff'))
                );
                const postsSnapshot = await getDocs(postRef);

                const users = [];
                const posts = [];
                const tags = [];

                usersSnapshot.forEach((d) => {
                    const u = d.data();
                    users.push({ uid: u.uid, displayName: u.displayName });
                });

                postsSnapshot.forEach((d) => {
                    const map = d.data() || {};
                    Object.values(map).forEach((post) => {
                        if (typeof post?.title === 'string' && post.title.toLowerCase().includes(q.toLowerCase())) {
                            posts.push({ id: post.id, ownerUid: post.ownerUid, title: post.title });
                        }
                        if (Array.isArray(post?.tags) && post.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))) {
                            post.tags.forEach((t) => {
                                const m = t.trim();
                                if (m.toLowerCase().includes(q.toLowerCase()) && !tags.includes(m)) tags.push(m);
                            });
                        }
                    });
                });

                setSearchResults({ users, posts, tags });
            } catch (error) {
                console.error('Error during search:', error);
            }
        };
        runSearch();
    }, [debouncedQuery]);

    const onSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setSearchOpen(true);
    };

    const resultsEmpty = useMemo(() => {
        return (
            searchResults.users.length === 0 &&
            searchResults.posts.length === 0 &&
            searchResults.tags.length === 0
        );
    }, [searchResults]);

    return (
        <div className="header">
            <div className="headerContainer">
                <button className="logo" onClick={() => navigate('/')} aria-label="Go to home">
                    RUSH <span className="logoHalf">FORUM</span>
                </button>

                <div className="search" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search forum…"
                        value={searchQuery}
                        onChange={onSearchChange}
                        onFocus={() => searchQuery && setSearchOpen(true)}
                        aria-label="Search"
                    />
                    {searchOpen && searchQuery && (
                        <div className="searchResults" role="listbox">
                            {resultsEmpty ? (
                                <div className="searchEmpty">No results</div>
                            ) : (
                                <>
                                    {searchResults.users.length > 0 && (
                                        <div className="searchResultsSection">
                                            <h3>Users</h3>
                                            <ul>
                                                {searchResults.users.map((user, index) => (
                                                    <li
                                                        key={`u-${index}`}
                                                        onClick={() => {
                                                            navigate(`/profile/${user.uid}`);
                                                            setSearchOpen(false);
                                                        }}
                                                    >
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
                                                    <li
                                                        key={`p-${index}`}
                                                        onClick={() => {
                                                            navigate(`/postDetail/${post.ownerUid}/${post.id}`);
                                                            setSearchOpen(false);
                                                        }}
                                                    >
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
                                                    <li
                                                        key={`t-${index}`}
                                                        onClick={() => {
                                                            navigate(`/category/${tag}`);
                                                            setSearchOpen(false);
                                                        }}
                                                    >
                                                        {tag}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className={`dropdownAndImage ${dropdown ? 'open' : ''}`} ref={dropdownRef}>
                    <button className="avatarBtn" onClick={toggleDropdown} aria-expanded={dropdown} aria-haspopup="menu">
                        <img src={profilePicture || defUser} alt="" />
                    </button>

                    <div className="dropdownContent" role="menu">
                        <button onClick={goProfile}>
                            <FontAwesomeIcon icon={faUser} /> Profile
                        </button>
                        <button className="settings" onClick={goSettings}>
                            <FontAwesomeIcon icon={faGear} /> Settings
                        </button>
                        <button onClick={() => { closeDropdown(); navigate('/chat'); }}>
                            <FontAwesomeIcon icon={faMessage} /> Chat
                        </button>
                        <button onClick={() => { closeDropdown(); navigate('/following'); }}>
                            <FontAwesomeIcon icon={faUsers} /> Following
                        </button>
                        <button onClick={handleLogOut}>
                            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function useDebounce(value, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setV(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return v;
}

export default Header;