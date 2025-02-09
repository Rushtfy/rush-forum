import React from 'react';
import './postDetail.scss';
import Layout from '../../components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faCommentDots, faEllipsis } from '@fortawesome/free-solid-svg-icons';

const PostDetail = () => {

    const location = useLocation();

    const item = location.state;

    return (
        <Layout>
            <div className='containerPostDetail'>
                <div className='imageAndDiscussion'>
                    <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picuture" />
                    <div className='discussionHolder'>
                        <div className='nameTimeIcon'>
                            <div className='nameAndTime'>
                                <p className='displayName'>Unknown</p>
                                <span>Today, 4:45PM</span>
                            </div>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </div>
                        <h2 className='discussionText'>{item.title}</h2>
                        <div className='discussionStatistics'>
                            <div className='voteCounter'>
                                <FontAwesomeIcon icon={faArrowUp} />
                                <p>{item.likes.length}</p>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </div>
                            <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{item.comments.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default PostDetail