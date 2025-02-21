import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './profile.scss';

const Profile = () => {
    const { currentUser } = useContext(AuthContext);
    const [base64, setBase64] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [activeTab, setActiveTab] = useState("posts");
    const [userData, setUserData] = useState({
        posts: [],
        comments: [],
        saved: [],
        upvoted: [],
        downvoted: []
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setBase64(reader.result);
            reader.onerror = (error) => console.error("Error converting to Base64:", error);
        }
    };

    useEffect(() => {
        const updateProfilePicture = async () => {
            if (!base64 || !currentUser?.uid) return;

            try {
                await updateDoc(doc(db, "users", currentUser.uid), { "photoURL": base64 });
                console.log("Profile Picture updated successfully");
            } catch (error) {
                console.log("Something went wrong:", error);
            }
        };

        updateProfilePicture();
    }, [base64]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.uid) return;

            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                const profilePic = userDoc.data()?.photoURL || "";
                setProfilePicture(profilePic);

                const postsSnapshot = await getDocs(collection(db, "userPosts"));
                let userPosts = [];
                let userComments = [];
                let savedPosts = [];
                let upvotedPosts = [];
                let downvotedPosts = [];

                postsSnapshot.forEach((doc) => {
                    const postData = Object.values(doc.data());

                    postData.forEach((post) => {
                        if (post.ownerUid === currentUser.uid) userPosts.push(post);
                        if (post.comments) {
                            Object.values(post.comments).forEach((comment) => {
                                if (comment.senderUid === currentUser.uid) userComments.push(comment);
                            });
                        }
                        if (post.likes?.includes(currentUser.uid)) upvotedPosts.push(post);
                        if (post.dislikes?.includes(currentUser.uid)) downvotedPosts.push(post);
                        if (post.savedBy?.includes(currentUser.uid)) savedPosts.push(post);
                    });
                });

                setUserData({
                    posts: userPosts,
                    comments: userComments,
                    saved: savedPosts,
                    upvoted: upvotedPosts,
                    downvoted: downvotedPosts
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, [currentUser?.uid]);

    return (
        <Layout>
            <div className='containerProfileNav'>
                <div className='profileHeader'>
                    <div className='userCredentials'>
                        <input type="file" accept="image/*" id='imageSelector' onChange={handleFileChange} />
                        <label htmlFor="imageSelector">
                            <img src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                        </label>
                        <h3>{currentUser.displayName}</h3>
                    </div>
                    <ul>
                        <li className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>Posts</li>
                        <li className={activeTab === "comments" ? "active" : ""} onClick={() => setActiveTab("comments")}>Comments</li>
                        <li className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>Saved</li>
                        <li className={activeTab === "upvoted" ? "active" : ""} onClick={() => setActiveTab("upvoted")}>Upvoted</li>
                        <li className={activeTab === "downvoted" ? "active" : ""} onClick={() => setActiveTab("downvoted")}>Downvoted</li>
                    </ul>
                </div>

                <div className='profileContent'>
                    {activeTab === "posts" && (
                        <div className='profileTabContent'>
                            <h2>Your Posts</h2>
                            <div className='scrollableContent'>
                                {userData.posts.length ? userData.posts.map(post => (
                                    <div key={post.id} className='postItem'>
                                        <h3>{post.title}</h3>
                                        <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                                    </div>
                                )) : <p>No posts available.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === "comments" && (
                        <div className='profileTabContent'>
                            <h2>Your Comments</h2>
                            <div className='scrollableContent'>
                                {userData.comments.length ? userData.comments.map(comment => (
                                    <div key={comment.id} className='commentItem'>
                                        <p dangerouslySetInnerHTML={{__html:comment.content}}></p>
                                    </div>
                                )) : <p>No comments available.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === "saved" && (
                        <div className='profileTabContent'>
                            <h2>Saved Posts</h2>
                            <div className='scrollableContent'>
                                {userData.saved.length ? userData.saved.map(post => (
                                    <div key={post.id} className='postItem'>
                                        <h3>{post.title}</h3>
                                        <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                                    </div>
                                )) : <p>No saved posts.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === "upvoted" && (
                        <div className='profileTabContent'>
                            <h2>Upvoted Posts</h2>
                            <div className='scrollableContent'>
                                {userData.upvoted.length ? userData.upvoted.map(post => (
                                    <div key={post.id} className='postItem'>
                                        <h3>{post.title}</h3>
                                        <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                                    </div>
                                )) : <p>No upvoted posts.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === "downvoted" && (
                        <div className='profileTabContent'>
                            <h2>Downvoted Posts</h2>
                            <div className='scrollableContent'>
                                {userData.downvoted.length ? userData.downvoted.map(post => (
                                    <div key={post.id} className='postItem'>
                                        <h3>{post.title}</h3>
                                        <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                                    </div>
                                )) : <p>No downvoted posts.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;