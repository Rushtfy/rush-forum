import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import DiscussionModel from '../../components/discussionModel/DiscussionModel';
import { db } from '../../firebase';
import './discussions.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply, faArrowUp, faArrowDown, faCommentDots } from '@fortawesome/free-solid-svg-icons'

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
        const getPosts = async () => {
            const unsub = await getDocs(collection(db, "userPosts"));
            let array1 = []
            setPosts(null)
            unsub.forEach((info) => {
                Object.entries(info.data()).map(item => array1.push(item[1]));
            });
            setPosts(array1.sort((a, b) => b.likes.length - a.likes.length));

            return () => {
                unsub();
            }
        }

        currentUser.uid && getPosts()
    }, [currentUser.uid]);

    return (
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

    )
}

export default Discussions