import { faArrowDown, faArrowUp, faCommentDots, faEllipsis, faFlag, faBookmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import './comments.scss';
import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';

const Comments = ({ item, post, setComments }) => {

    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [dropdown, setDropdown] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const toggleDropdown = async (e) => {
        e.stopPropagation();
        setDropdown((prev) => !prev);
    }

    const handleDelete = async () => {
        try {
            await updateDoc(doc(db, "userPosts", post.ownerUid), {
                [post.id + ".comments." + item.id]: deleteField()
            });
            setComments((prev) => prev.filter((comment) => comment.id !== item.id));
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    }

    useEffect(() => {
        const getName = async () => {
            if (!item?.senderUid) return;

            try {
                const userDoc = await getDoc(doc(db, "users", item.senderUid));
                setName(userDoc.data()?.displayName || "Unknown");
                setProfilePicture(userDoc.data()?.photoURL);
            } catch (error) {
                console.log("Something went wrong:", error);
            }
        }

        currentUser?.uid && getName();
    }, [currentUser?.uid, item?.senderUid]);

    return (
        <div className='commentBody'>
            <img src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
            <div className='commentHolder'>
                <div className='nameTimeIcon'>
                    <div className='nameAndTime'>
                        <div className='displayName'>{name ? name : <div className='nameSkeleton skeleton'></div>}</div>
                        <span>{item.time ? item.time : "N/A"}</span>
                    </div>
                    <div className="dropdown">
                        <FontAwesomeIcon icon={faEllipsis} onClick={toggleDropdown} className='threeDots' />
                        {dropdown && (
                            <div className="dropdownContent">
                                <p><FontAwesomeIcon icon={faFlag} />Report</p>
                                <p><FontAwesomeIcon icon={faBookmark} />Save</p>
                                {item.senderUid === currentUser?.uid && (
                                    <p onClick={handleDelete}><FontAwesomeIcon icon={faTrash} />Delete</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className='discussionText' dangerouslySetInnerHTML={{ __html: item.content }}></div>
                <div className='discussionStatistics'>
                    <div className='voteCounter'>
                        <FontAwesomeIcon icon={faArrowUp} />
                        <p>{item.likes.length}</p>
                        <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Comments