import { faArrowDown, faArrowUp, faCommentDots, faReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayRemove, arrayUnion, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './discussionModel.scss';

const DiscussionModel = ({ item }) => {

    const { currentUser } = useContext(AuthContext);
    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {

        const getNames = async () => {
            if (!item?.ownerUid) return;

            try {
                const userDoc = await getDoc(doc(db, "users", item.ownerUid));
                if (userDoc.exists()) {
                    setName(userDoc.data().displayName);
                    setProfilePicture(userDoc.data().photoURL);
                }
                setLiked(item.likes.includes(currentUser.uid));
                setDisliked(item.dislikes.includes(currentUser.uid));
            } catch (error) {
                console.log("Someting went wrong:", error);
            }
        }

        currentUser?.uid && getNames();
    }, [item, currentUser?.uid]);

    const goDetail = () => {
        navigate('/postDetail', { state: item });
    }

    const handleUpvote = async (event) => {
        event.stopPropagation();
        try {
            const postDocRef = doc(db, "userPosts", item.ownerUid);
            const postDoc = await getDoc(postDocRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();

                const postLikes = postData[item.id]?.likes;
                const postDislikes = postData[item.id]?.dislikes

                if (postDislikes && postDislikes.includes(currentUser.uid)) {
                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[2].classList.remove("liked");

                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".dislikes"]: arrayRemove(currentUser.uid)
                    });
                }
                if (postLikes && postLikes.includes(currentUser.uid)) {
                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML = Number(document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML) - 1;

                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[0].classList.remove("liked");

                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".likes"]: arrayRemove(currentUser.uid)
                    });
                } else {
                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML = Number(document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML) + 1;

                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[0].classList.add("liked");

                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".likes"]: arrayUnion(currentUser.uid)
                    });
                }
            } else {
                alert("Something went wrong!");
            }
        } catch (error) {
            alert("Something went wrong!");
            document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML = Number(item.likes.length);
            document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[0].classList.remove("liked");
        }
    }

    const handleDownvote = async (event) => {
        event.stopPropagation();
        try {
            const postDocRef = doc(db, "userPosts", item.ownerUid);
            const postDoc = await getDoc(postDocRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();

                const postLikes = postData[item.id]?.likes;
                const postDislikes = postData[item.id]?.dislikes

                if (postLikes && postLikes.includes(currentUser.uid)) {
                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML = Number(document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML) - 1;

                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[0].classList.remove("liked");

                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".likes"]: arrayRemove(currentUser.uid)
                    });
                }
                if (postDislikes && postDislikes.includes(currentUser.uid)) {
                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[2].classList.remove("liked");

                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".dislikes"]: arrayRemove(currentUser.uid)
                    });
                } else {
                    document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[2].classList.add("liked");

                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".dislikes"]: arrayUnion(currentUser.uid)
                    });
                }
            } else {
                alert("Something went wrong!");
            }
        } catch (error) {
            alert("Something went wrong!");
            document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[1].innerHTML = Number(item.likes.length);
            document.getElementById(item.id).children[0].children[0].children[1].children[2].children[0].children[2].classList.remove("liked");
        }
    }

    return (
        <div className='individualDiscussion' onClick={goDetail} id={item.id}>
            <div className='dicussionContainer'>
                <div className='imageAndDiscussion'>
                    <img src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                    <div className='discussionHolder'>
                        <div className='nameAndTime'>
                            <p className='displayName'>{name ? name : <div className='skeletonName'></div>}</p>
                            <span>{item.time ? item.time : "N/A"}</span>
                        </div>
                        <p className='discussionText'>{item.title}</p>
                        <div className='discussionStatistics'>
                            <div className='voteCounter'>
                                {liked ? <FontAwesomeIcon icon={faArrowUp} onClick={handleUpvote} className='liked' /> : <FontAwesomeIcon icon={faArrowUp} onClick={handleUpvote} />}
                                <p>{item.likes.length}</p>
                                {disliked ? <FontAwesomeIcon icon={faArrowDown} onClick={handleDownvote} className='liked' /> : <FontAwesomeIcon icon={faArrowDown} onClick={handleDownvote} />}
                            </div>
                            <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{Object.keys(item.comments).length}</p>
                        </div>
                    </div>
                </div>
                <button><FontAwesomeIcon icon={faReply} />Reply</button>
            </div>
        </div>
    )
}

export default DiscussionModel