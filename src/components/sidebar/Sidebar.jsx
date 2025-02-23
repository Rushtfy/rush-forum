import { faHouse, faMessage, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, getDocs } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './sidebar.scss';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState(new Set());

    const goCategoriesPostPage = (tag) => {
        navigate(`/category/${tag}`);
        window.location.reload();
    }

    useEffect(() => {
        if (!currentUser.uid) return;

        const getCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "userPosts"));
                let postsArray = [];
                let tagsSet = new Set();
                querySnapshot.forEach((doc) => {
                    const userPosts = Object.values(doc.data());
                    postsArray.push(...userPosts);

                    userPosts.forEach((post) => {
                        if (post.tags) {
                            post.tags.forEach((tag) => {
                                tagsSet.add(tag);
                            });
                        }
                    });
                });

                setPosts(postsArray);
                setTags(tagsSet);
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
                        [...tags].map((tag, index) => (
                            <li key={index} onClick={() => goCategoriesPostPage(tag)}>{tag}</li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;