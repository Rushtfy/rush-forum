import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import DiscussionModel from '../../components/discussionModel/DiscussionModel';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './followPosts.scss';

const FollowPosts = () => {
    const { currentUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowedUsersPosts = async () => {
            if (!currentUser?.uid) return;

            setLoading(true);

            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                const followingList = userDoc.data()?.following || [];

                if (followingList.length === 0) {
                    setPosts([]);
                    setLoading(false);
                    return;
                }

                const postsSnapshot = await getDocs(collection(db, "userPosts"));
                let followedUsersPosts = [];

                postsSnapshot.forEach((doc) => {
                    const userPosts = doc.data();
                    Object.values(userPosts).forEach((post) => {
                        if (followingList.includes(post.ownerUid)) {
                            followedUsersPosts.push(post);
                        }
                    });
                });

                setPosts(followedUsersPosts);
            } catch (error) {
                console.error("Error fetching followed users' posts:", error);
            }

            setLoading(false);
        };

        fetchFollowedUsersPosts();
    }, [currentUser?.uid]);

    return (
        <Layout>
            <div className='followPostsContainer'>
                <h1>Posts from Followed Users</h1>

                {loading ? (
                    <div>
                        {Array(6).fill().map((_, index) => (
                            <div key={index} className='individualDiscussion'>
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
                        ))}
                    </div>
                ) : (
                    posts.length ? (
                        posts.map((post) => <DiscussionModel key={post.id} item={post} />)
                    ) : (
                        <p>No posts from followed users yet.</p>
                    )
                )}
            </div>
        </Layout>
    );
};

export default FollowPosts;