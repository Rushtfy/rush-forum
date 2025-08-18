import { faArrowDown, faArrowUp, faCommentDots, faReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defUser from '../../assets/default_user.jpg';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './discussionModel.scss';

const DiscussionModel = ({ item }) => {
    const { currentUser } = useContext(AuthContext);
    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes.length);
    const navigate = useNavigate();

    useEffect(() => {
        if (!item?.ownerUid) return;

        const fetchUserDetails = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", item.ownerUid));
                if (userDoc.exists()) {
                    setName(userDoc.data().displayName);
                    setProfilePicture(userDoc.data().photoURL);
                }
                setLiked(item.likes.includes(currentUser.uid));
                setDisliked(item.dislikes.includes(currentUser.uid));
            } catch (error) {
                console.log("Something went wrong:", error);
            }
        };

        currentUser?.uid && fetchUserDetails();
    }, [item, currentUser?.uid]);

    const goDetail = () => {
        navigate(`/postDetail/${item.ownerUid}/${item.id}`);
    };

    const goProfile = (e) => {
        e.stopPropagation();
        navigate(`/profile/${item.ownerUid}`);
    };

    const handleVote = async (e, type) => {
        e.stopPropagation();
    
        if (!currentUser?.uid) return;
    
        const postDocRef = doc(db, "userPosts", item.ownerUid);
        const postDoc = await getDoc(postDocRef);
    
        if (!postDoc.exists()) return alert("Something went wrong!");
    
        try {
            const postData = postDoc.data();
            const postLikes = postData[item.id]?.likes || [];
            const postDislikes = postData[item.id]?.dislikes || [];
    
            let updates = {};
    
            if (type === "like") {
                if (disliked) {
                    updates[`${item.id}.dislikes`] = arrayRemove(currentUser.uid);
                    setDisliked(false);
                }
                if (liked) {
                    updates[`${item.id}.likes`] = arrayRemove(currentUser.uid);
                    setLiked(false);
                    setLikeCount(likeCount - 1);
                } else {
                    updates[`${item.id}.likes`] = arrayUnion(currentUser.uid);
                    setLiked(true);
                    setLikeCount(likeCount + 1);
                }
            } else if (type === "dislike") {
                if (liked) {
                    updates[`${item.id}.likes`] = arrayRemove(currentUser.uid);
                    setLiked(false);
                    setLikeCount(likeCount - 1);
                }
                if (disliked) {
                    updates[`${item.id}.dislikes`] = arrayRemove(currentUser.uid);
                    setDisliked(false);
                } else {
                    updates[`${item.id}.dislikes`] = arrayUnion(currentUser.uid);
                    setDisliked(true);
                }
            }
    
            await updateDoc(postDocRef, updates);
        } catch (error) {
            alert("Something went wrong!");
        }
    };    

    return (
        <div className="individualDiscussion" onClick={goDetail} id={item.id}>
            <div className="dicussionContainer">
                <div className="imageAndDiscussion">
                    <img
                        src={profilePicture || defUser}
                        alt="profile"
                        onClick={(e) => goProfile(e)}
                    />
                    <div className="discussionHolder">
                        <div className="nameAndTime">
                            <div className="displayName" onClick={(e) => goProfile(e)}>{name || <div className="skeletonName"></div>}</div>
                            <span>{item.time || "N/A"}</span>
                        </div>
                        <p className="discussionText">{item.title}</p>
                        <div className="discussionStatistics">
                            <div className="voteCounter">
                                <FontAwesomeIcon
                                    icon={faArrowUp}
                                    className={liked ? "liked" : ""}
                                    onClick={(e) => handleVote(e, "like")}
                                />
                                <p>{likeCount}</p>
                                <FontAwesomeIcon
                                    icon={faArrowDown}
                                    className={disliked ? "liked" : ""}
                                    onClick={(e) => handleVote(e, "dislike")}
                                />
                            </div>
                            <p className="commentCounter">
                                <FontAwesomeIcon icon={faCommentDots} />
                                {Object.keys(item.comments).length}
                            </p>
                        </div>
                    </div>
                </div>
                <button>
                    <FontAwesomeIcon icon={faReply} />
                    Reply
                </button>
            </div>
        </div>
    );
};

export default DiscussionModel;