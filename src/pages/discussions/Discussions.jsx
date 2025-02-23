import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import DiscussionModel from '../../components/discussionModel/DiscussionModel';
import Layout from '../../components/layout/Layout';
import { auth, db } from '../../firebase';
import './discussions.scss';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const Discussions = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [posts, setPosts] = useState(null);

    useEffect(() => {
        if (!currentUser?.uid) return;

        const verifyStatus = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                const userData = userDoc.data();
                
                if (userData?.status === "banned") {
                    alert("Your account is banned.");
                    await signOut(auth);
                    navigate("/login");
                    return;
                }

                const getPosts = async () => {
                    try {
                        const querySnapshot = await getDocs(collection(db, "userPosts"));
                        let postsArray = [];

                        querySnapshot.forEach((doc) => {
                            postsArray.push(...Object.values(doc.data()));
                        });

                        postsArray.sort((a, b) => b.likes.length - a.likes.length);
                        setPosts(postsArray);
                    } catch (error) {
                        console.log("Something went wrong:", error);
                    }
                };

                getPosts();
            } catch (error) {
                console.log("Error verifying user status:", error);
            }
        };

        verifyStatus();
    }, [currentUser?.uid, navigate]);

    const renderSkeletons = () => {
        const skeletonArray = new Array(6).fill(0);
        return skeletonArray.map((_, index) => (
            <div className='individualDiscussion' key={index}>
                <div className='dicussionContainer'>
                    <div className='imageAndDiscussion'>
                        <div className='profilePicSkeleton skeleton'></div>
                        <div className='discussionHolder'>
                            <div className='nameAndTimeSkeleton skeleton'></div>
                            <p className='discussionTextSkeleton skeleton'></p>
                            <div className='discussionStatistics'>
                                <div className='voteCounterSkeleton skeleton'></div>
                                <p className='commentCounterSkeleton skeleton'></p>
                            </div>
                        </div>
                    </div>
                    <div className='replySkeleton skeleton'></div>
                </div>
            </div>
        ));
    };

    return (
        <Layout>
            <div className='discussions'>
                <div className='titleMenu'>
                    <h1>All Discussions</h1>
                </div>
                {posts ? posts.map((item, index) =>
                    <DiscussionModel key={index} item={item} />
                ) : renderSkeletons()}
            </div>
        </Layout>
    );
};

export default Discussions;