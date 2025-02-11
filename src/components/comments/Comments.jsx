import { faArrowDown, faArrowUp, faCommentDots, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import './comments.scss';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';

const Comments = ({ item }) => {

    const [name, setName] = useState(null);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const getName = async () => {
            const unsub = await getDoc(doc(db, "users", item.senderUid));
            setName(unsub.data().displayName);


            return () => {
                unsub();
            }
        }

        currentUser.uid && getName();
    }, [currentUser.uid]);

    return (
        <div className='commentBody'>
            <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picuture" />
            <div className='commentHolder'>
                <div className='nameTimeIcon'>
                    <div className='nameAndTime'>
                        <p className='displayName'>{name ? name : <div className='nameSkeleton skeleton'></div>}</p>
                        <span>Today, 4:45PM</span>
                    </div>
                    <FontAwesomeIcon icon={faEllipsis} />
                </div>
                <div className='discussionText' dangerouslySetInnerHTML={{ __html: item.content }}></div>
                <div className='discussionStatistics'>
                    <div className='voteCounter'>
                        <FontAwesomeIcon icon={faArrowUp} />
                        <p>{item.likes.length}</p>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                    <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{item.replies.length}</p>
                </div>
            </div>
        </div>
    )
}

export default Comments