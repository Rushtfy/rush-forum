import { faArrowDown, faArrowUp, faCommentDots, faEllipsis, faFlag, faBookmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import './comments.scss';
import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';

const Comments = ({ item, post }) => {

    const [name, setName] = useState(null);
    const [dropdown, setDropdown] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const showDropdown = async (e) => {
        e.stopPropagation();
        if(dropdown) {
            document.getElementById(item.id).style.display = "none";
            setDropdown(false);
        } else {

            if(item.senderUid != currentUser.uid) {
                document.getElementById(item.id).children[2].style.display = "none";
            }

            document.getElementById(item.id).style.display = "block";
            setDropdown(true);
        }
    }

    const handleDelete = async () => {
        await updateDoc(doc(db, "userPosts", post.ownerUid), {
            [post.id + ".comments." + item.id]: deleteField()
        });
        window.location.reload();
    }

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
                        <span>{item.time ? item.time : "N/A"}</span>
                    </div>
                    <div className="dropdown">
                        <FontAwesomeIcon icon={faEllipsis} onClick={showDropdown} className='threeDots'/>
                        <div id={item.id} className="dropdownContent">
                            <p><FontAwesomeIcon icon={faFlag} />Report</p>
                            <p><FontAwesomeIcon icon={faBookmark} />Save</p>
                            <p onClick={handleDelete}><FontAwesomeIcon icon={faTrash} />Delete</p>
                        </div>
                    </div>
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