import { faArrowDown, faArrowUp, faEllipsis, faFlag, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import defUser from '../../assets/default_user.jpg';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './comments.scss';

const Comments = ({ item, post, setComments }) => {

    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [dropdown, setDropdown] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const [userVote, setUserVote] = useState(null);

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

    const handleVote = async (type) => {
        if (!currentUser?.uid) return;
        let updatedLikes = [...item.likes];
        let updatedDislikes = [...item.dislikes];

        if (type === 'upvote') {
            if (userVote === 'up') {
                updatedLikes = updatedLikes.filter(uid => uid !== currentUser.uid);
                setUserVote(null);
            } else {
                if (userVote === 'down') {
                    updatedDislikes = updatedDislikes.filter(uid => uid !== currentUser.uid);
                }
                updatedLikes.push(currentUser.uid);
                setUserVote('up');
            }
        } else if (type === 'downvote') {
            if (userVote === 'down') {
                updatedDislikes = updatedDislikes.filter(uid => uid !== currentUser.uid);
                setUserVote(null);
            } else {
                if (userVote === 'up') {
                    updatedLikes = updatedLikes.filter(uid => uid !== currentUser.uid);
                }
                updatedDislikes.push(currentUser.uid);
            }
        }

        try {
            await updateDoc(doc(db, "userPosts", post.ownerUid), {
                [`${post.id}.comments.${item.id}.likes`]: updatedLikes,
                [`${post.id}.comments.${item.id}.dislikes`]: updatedDislikes
            });
            setComments((prev) => prev.map((comment) =>
                comment.id === item.id ? { ...comment, likes: updatedLikes, dislikes: updatedDislikes } : comment
            ));
        } catch (error) {
            console.log("Error updating vote:", error);
        }
    };

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

    useEffect(() => {
        if (item.likes.includes(currentUser?.uid)) {
            setUserVote('up');
        } else if (item.dislikes && item.dislikes.includes(currentUser?.uid)) {
            setUserVote('down');
        }
    }, [item.likes, item.dislikes, currentUser?.uid]);

    return (
        <div className='commentBody'>
            <img src={profilePicture || defUser} alt="profile picture" />
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
                        <FontAwesomeIcon
                            icon={faArrowUp}
                            className={userVote === 'up' ? 'active' : ''}
                            onClick={() => handleVote('upvote')}
                        />
                        <p>{item.likes.length}</p>
                        <FontAwesomeIcon
                            icon={faArrowDown}
                            className={userVote === 'down' ? 'active' : ''}
                            onClick={() => handleVote('downvote')}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Comments;