import { faHouse, faMessage, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { AuthContext } from '../context/AuthContext';
import './sidebar.scss';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get current route
    const { currentUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser.uid) return;

        const getCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "userPosts"));
                let postsArray = [];

                querySnapshot.forEach((doc) => {
                    postsArray.push(...Object.values(doc.data()));
                });

                setPosts(postsArray);
                setLoading(false);
            } catch (error) {
                console.log("Something went wrong:", error);
                setLoading(false);
            }
        }
        currentUser.uid && getCategories();
    }, [currentUser.uid]);

    return (
        <div className='sidebar'>
            <div className='containerSidebar'>
                <div className='discussionStarterBox'>
                    <button className="pushable" onClick={() => navigate('/create')}>
                        <span className="edge"></span>
                        <span className="front"> Start a new Discussion </span>
                    </button>
                    <ul>
                        <li 
                            className={location.pathname === "/" ? "active" : ""} 
                            onClick={() => navigate("/")}
                        >
                            <FontAwesomeIcon icon={faHouse} />Home
                        </li>
                        <li 
                            className={location.pathname === "/following" ? "active" : ""}
                            onClick={() => navigate("/following")}
                        >
                            <FontAwesomeIcon icon={faUsers} />Following
                        </li>
                        <li 
                            className={location.pathname === "/chat" ? "active" : ""}
                            onClick={() => navigate("/chat")}
                        >
                            <FontAwesomeIcon icon={faMessage} />Chat
                        </li>
                    </ul>
                </div>
                <h2>Categories</h2>
                <ul className='tags'>
                    {loading ? (
                        Array(8).fill().map((_, index) => (
                            <li key={index} className="skeletonTag"></li>
                        ))
                    ) : (
                        posts && posts.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.tags && item.tags.map((tag, tagIndex) => (
                                    <li key={tagIndex}>{tag}</li>
                                ))}
                            </React.Fragment>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;