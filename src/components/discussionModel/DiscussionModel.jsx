import React from 'react'
import './discussionModel.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply, faArrowUp, faCommentDots } from '@fortawesome/free-solid-svg-icons'

const DiscussionModel = ({ item }) => {
    return (
        <div className='individualDiscussion'>
            <div className='dicussionContainer'>
                <div className='imageAndDiscussion'>
                    <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picuture" />
                    <div className='discussionHolder'>
                        <div className='nameAndTime'>
                            <p className='displayName'>{item.displayName}</p>
                            <span>Today, 4:45PM</span>
                        </div>
                        <p className='discussionText'>{item.postText}</p>
                        <div className='discussionStatistics'>
                            <p><FontAwesomeIcon icon={faArrowUp} />42 upvotes</p>
                            <p><FontAwesomeIcon icon={faCommentDots} />12 replies</p>
                        </div>
                    </div>
                </div>
                <button><FontAwesomeIcon icon={faReply} />Reply</button>
            </div>
        </div>
    )
}

export default DiscussionModel