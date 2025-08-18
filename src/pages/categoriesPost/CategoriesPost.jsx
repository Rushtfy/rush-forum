import { collection, getDocs } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../components/context/AuthContext';
import DiscussionModel from '../../components/discussionModel/DiscussionModel';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './categoriesPost.scss';

const CategoriesPost = () => {
    const { currentUser } = useContext(AuthContext);
    const { tag } = useParams();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoriesPosts = async () => {
            if (!currentUser?.uid) return;

            setLoading(true);

            try {
                const postsSnapshot = await getDocs(collection(db, "userPosts"));
                let categoryPosts = [];

                postsSnapshot.forEach((doc) => {
                    const userPosts = doc.data();
                    Object.values(userPosts).forEach((post) => {
                        if (post.tags?.includes(tag)) {
                            categoryPosts.push(post);
                        }
                    });
                });

                setPosts(categoryPosts);
            } catch (error) {
                console.error(error);
            }

            setLoading(false);
        };

        fetchCategoriesPosts();
    }, [currentUser?.uid]);

    return (
        <Layout>
            <div className='CategoriesPostContainer'>
                <h1>Category</h1>

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
                        <p>No posts found.</p>
                    )
                )}
            </div>
        </Layout>
    );
};

export default CategoriesPost;