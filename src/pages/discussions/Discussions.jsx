import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import DiscussionModel from '../../components/discussionModel/DiscussionModel';
import { db } from '../../firebase';
import './discussions.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply, faArrowUp, faArrowDown, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import Layout from '../../components/layout/Layout';

const Discussions = () => {

    const { currentUser } = useContext(AuthContext);

    const [posts, setPosts] = useState(null);


    function shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    }

    useEffect(() => {

        if (!currentUser?.uid) return;

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
        }

        currentUser.uid && getPosts();
    }, [currentUser.uid]);

    return (
        <Layout>
            <div className='discussions'>
                <div className='titleMenu'>
                    <h1>All Discussions</h1>
                </div>
                {posts ? posts.map((item, index) =>
                    <DiscussionModel key={index} item={item} />
                ) : <div>
                    <div className='individualDiscussion'>
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
                    <div className='individualDiscussion'>
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
                    <div className='individualDiscussion'>
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
                    <div className='individualDiscussion'>
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
                    <div className='individualDiscussion'>
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
                    <div className='individualDiscussion'>
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
                </div>}
            </div>
        </Layout>

    )
}

export default Discussions