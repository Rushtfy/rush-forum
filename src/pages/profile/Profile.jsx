import axios from 'axios';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { auth, db } from '../../firebase';
import './profile.scss';
import { updateProfile } from 'firebase/auth';
import { data, useParams } from 'react-router-dom';

const Profile = () => {
    const { currentUser } = useContext(AuthContext);
    const { uid } = useParams();

    const [profilePicture, setProfilePicture] = useState("");
    const [userName, setUserName] = useState("");
    const [activeTab, setActiveTab] = useState("posts");
    const [userData, setUserData] = useState({
        posts: [],
        comments: [],
        saved: [],
        upvoted: [],
        downvoted: []
    });

    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    const handleFileChange = (event) => {
        const fileImage = event.target.files[0];
        setFile(fileImage);
    };

    useEffect(() => {
        if (file) {
            uploadImage();
        }
    }, [file]);

    const uploadImage = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'profile_preset');
        formData.append('cloud_name', 'dk53jsnru');

        try {
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/dk53jsnru/image/upload',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            setImageUrl(response.data.secure_url);
            await updateDoc(doc(db, "users", currentUser.uid), { "photoURL": response.data.secure_url });
            await updateProfile(auth.currentUser, { photoURL: response.data.secure_url });
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleFollow = async () => {
        if (!currentUser?.uid || currentUser.uid === uid) return;

        try {
            await updateDoc(doc(db, "users", uid), {
                followers: arrayUnion(currentUser.uid),
            });

            await updateDoc(doc(db, "users", currentUser.uid), {
                following: arrayUnion(uid),
            });

            setIsFollowing(true);
            setFollowersCount(prev => prev + 1);
        } catch (error) {
            console.error("Error following user:", error);
        }
    };

    const handleUnfollow = async () => {
        if (!currentUser?.uid || currentUser.uid === uid) return;

        try {
            await updateDoc(doc(db, "users", uid), {
                followers: arrayRemove(currentUser.uid),
            });

            await updateDoc(doc(db, "users", currentUser.uid), {
                following: arrayRemove(uid),
            });

            setIsFollowing(false);
            setFollowersCount(prev => prev - 1);
        } catch (error) {
            console.error("Error unfollowing user:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.uid) return;

            try {
                const userDoc = await getDoc(doc(db, "users", uid));
                const profilePic = userDoc.data()?.photoURL || "";
                const userName = userDoc.data().displayName;
                setProfilePicture(profilePic);
                setUserName(userName);
                setFollowersCount(userDoc.data()?.followers?.length || 0);

                if(userDoc.data()?.followers?.includes(currentUser.uid)) {
                    setIsFollowing(true);
                }

                const postsSnapshot = await getDocs(collection(db, "userPosts"));
                const userData = await getDoc(doc(db, "users", currentUser.uid));
                let userPosts = [];
                let userComments = [];
                let savedPosts = [];
                let upvotedPosts = [];
                let downvotedPosts = [];

                postsSnapshot.forEach((doc) => {
                    const postData = Object.values(doc.data());

                    postData.forEach((post) => {
                        if (post.ownerUid === uid) userPosts.push(post);
                        if (post.comments) {
                            Object.values(post.comments).forEach((comment) => {
                                if (comment.senderUid === uid) userComments.push(comment);
                            });
                        }
                        if (post.likes?.includes(uid)) upvotedPosts.push(post);
                        if (post.dislikes?.includes(uid)) downvotedPosts.push(post);
                    });
                });
                
                if (userData.data()?.savedPosts?.length) {
                    const savedPostsPromises = userData.data().savedPosts.map(async (item) => {

                        const postDoc = await getDoc(doc(db, "userPosts", item.ownerUid));

                        return postDoc.data()[item.postId]
                    });
                
                    const resolvedSavedPosts = await Promise.all(savedPostsPromises);
                    savedPosts = resolvedSavedPosts.filter(post => post !== null);
                }

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
    }, [currentUser?.uid, imageUrl]);

    return (
        <Layout>
            <div className='containerProfileNav'>
                <div className='profileHeader'>
                    <div className='userCredentials'>
                        {currentUser.uid === uid && <input type="file" accept="image/*" id='imageSelector' onChange={handleFileChange} />}
                        <label htmlFor="imageSelector">
                            <img src={profilePicture  || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} />
                        </label>
                        <h3>{userName && userName}</h3>
                        <p className='followCounter'>{followersCount} Followers</p>

                        {currentUser.uid !== uid && (
                            isFollowing ? (
                                <button className="unfollowBtn" onClick={handleUnfollow}>Unfollow</button>
                            ) : (
                                <button className="followBtn" onClick={handleFollow}>Follow</button>
                            )
                        )}
                    </div>
                    <ul>
                        <li className={activeTab === "posts" ? "active" : ""} onClick={() => setActiveTab("posts")}>Posts</li>
                        <li className={activeTab === "comments" ? "active" : ""} onClick={() => setActiveTab("comments")}>Comments</li>
                        {currentUser.uid === uid && <li className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>Saved</li>}
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
                                        <p dangerouslySetInnerHTML={{ __html: comment.content }}></p>
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