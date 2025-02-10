import React, { useContext, useEffect, useState } from 'react'
import './discussionModel.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply, faArrowUp, faArrowDown, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import { arrayRemove, arrayUnion, collection, collectionGroup, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DiscussionModel = ({ item }) => {

    const { currentUser } = useContext(AuthContext);
    const [name, setName] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        const getNames = async () => {
            const unsub = setName((await getDoc(doc(db, "users", item.ownerUid))).data().displayName);

            return () => {
                unsub();
            }
        }

        currentUser.uid && getNames();
    }, [collection(db, "userPosts")]);

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
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id+".dislikes"]: arrayRemove(currentUser.uid)
                    });
                }
                if(postLikes && postLikes.includes(currentUser.uid)){
                    document.getElementById(item.id).innerHTML = Number(document.getElementById(item.id).innerHTML) - 1;
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id+".likes"]: arrayRemove(currentUser.uid)
                    });
                } else {
                    document.getElementById(item.id).innerHTML = Number(document.getElementById(item.id).innerHTML) + 1;
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id+".likes"]: arrayUnion(currentUser.uid)
                    });
                }
            } else {
                alert("Something went wrong!");
            }
        } catch (error) {
            alert("Something went wrong!");
            document.getElementById(item.id).innerHTML = Number(item.likes.length);
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
                    document.getElementById(item.id).innerHTML = Number(document.getElementById(item.id).innerHTML) - 1;
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id+".likes"]: arrayRemove(currentUser.uid)
                    });
                }
                if(postDislikes && postDislikes.includes(currentUser.uid)){
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id+".dislikes"]: arrayRemove(currentUser.uid)
                    });
                } else {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id+".dislikes"]: arrayUnion(currentUser.uid)
                    });
                }
            } else {
                alert("Something went wrong!");
            }
        } catch (error) {
            alert("Something went wrong!");
            document.getElementById(item.id).innerHTML = Number(item.likes.length);
        }
    }

    return (
        <div className='individualDiscussion' onClick={goDetail}>
            <div className='dicussionContainer'>
                <div className='imageAndDiscussion'>
                    <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picuture" />
                    <div className='discussionHolder'>
                        <div className='nameAndTime'>
                            <p className='displayName'>{name ? name : <div className='skeletonName'></div>}</p>
                            <span>Today, 4:45PM</span>
                        </div>
                        <p className='discussionText'>{item.title}</p>
                        <div className='discussionStatistics'>
                            <div className='voteCounter'>
                                <FontAwesomeIcon icon={faArrowUp} onClick={handleUpvote} />
                                <p id={item.id}>{item.likes.length}</p>
                                <FontAwesomeIcon icon={faArrowDown} onClick={handleDownvote} />
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