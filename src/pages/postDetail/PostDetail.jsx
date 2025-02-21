import { faArrowDown, faArrowUp, faCommentDots, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import Comments from '../../components/comments/Comments';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './postDetail.scss';

const PostDetail = () => {

    const location = useLocation();
    const itemOld = location.state;
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [item, setItem] = useState(itemOld);
    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [content, setContent] = useState("");
    const [comments, setComments] = useState(null);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    const modules = {
        toolbar: [
            [{ 'bold': true }, { 'italic': true }, { 'underline': true }, { 'strike': true }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'color': [] }, { 'background': [] }],
            ['blockquote', 'code-block'],
            ['clean']
        ]
    };

    useEffect(() => {
        const getData = async () => {
            if (!itemOld?.ownerUid) return;

            try {
                const userPostDoc = await getDoc(doc(db, "userPosts", itemOld.ownerUid));
                const userDoc = await getDoc(doc(db, "users", itemOld.ownerUid));
                const allPostsSnapshot = await getDocs(collection(db, "userPosts"));

                let allComments = [];
                setComments(null);
                allPostsSnapshot.forEach((doc) => {
                    const postComments = doc.data()?.[itemOld.id]?.comments;
                    if (postComments) {
                        allComments.push(...Object.values(postComments));
                    }
                });

                const postData = userPostDoc.data()?.[itemOld.id] || {};

                setLiked(postData.likes?.includes(currentUser.uid));
                setDisliked(postData.dislikes?.includes(currentUser.uid));

                setComments(allComments);
                setItem(postData);
                setName(userDoc.data()?.displayName || "Unknown");
                setProfilePicture(userDoc.data()?.photoURL);
            } catch (error) {
                console.log("Something went wrong:", error);
                navigate("/");
            }
        };
        
        currentUser?.uid && getData();

    }, [currentUser?.uid, itemOld]);

    const handleUpvote = async () => {
        try {
            const postDocRef = doc(db, "userPosts", itemOld.ownerUid);
            const postDoc = await getDoc(postDocRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();

                const postLikes = postData[itemOld.id]?.likes;
                const postDislikes = postData[itemOld.id]?.dislikes;

                if (postDislikes && postDislikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                        [itemOld.id + ".dislikes"]: arrayRemove(currentUser.uid)
                    });
                    setDisliked(false);
                }

                if (postLikes && postLikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                        [itemOld.id + ".likes"]: arrayRemove(currentUser.uid)
                    });
                    setLiked(false);
                } else {
                    await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                        [itemOld.id + ".likes"]: arrayUnion(currentUser.uid)
                    });
                    setLiked(true);
                }

                const updatedPostDoc = await getDoc(postDocRef);
                const updatedPostData = updatedPostDoc.data();
                setItem(updatedPostData[itemOld.id]);
            }
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    };

    const handleDownvote = async () => {
        try {
            const postDocRef = doc(db, "userPosts", itemOld.ownerUid);
            const postDoc = await getDoc(postDocRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();

                const postLikes = postData[itemOld.id]?.likes;
                const postDislikes = postData[itemOld.id]?.dislikes;

                if (postLikes && postLikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                        [itemOld.id + ".likes"]: arrayRemove(currentUser.uid)
                    });
                    setLiked(false);
                }

                
                if (postDislikes && postDislikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                        [itemOld.id + ".dislikes"]: arrayRemove(currentUser.uid)
                    });
                    setDisliked(false);
                } else {
                    await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                        [itemOld.id + ".dislikes"]: arrayUnion(currentUser.uid)
                    });
                    setDisliked(true);
                }

                const updatedPostDoc = await getDoc(postDocRef);
                const updatedPostData = updatedPostDoc.data();
                setItem(updatedPostData[itemOld.id]);
            }
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    };

    const handleComment = async () => {
        try {
            const uniqueID = uuid();
            const now = new Date();

            const currDate = now.toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "2-digit",
            });

            const currTime = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });

            const newComment = {
                "id": uniqueID,
                "senderUid": currentUser.uid,
                "content": content,
                "likes": [],
                "dislikes": [],
                "replies": [],
                "time": currDate + " " + currTime
            };

            await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                [itemOld.id + ".comments." + uniqueID]: newComment
            });

            setComments((prev) => [...prev, newComment]);
            setContent("");
        } catch (error) {
            alert(error);
        }
    }

    return (
        <Layout>
            <div className='containerPostDetail'>
                <div className='imageAndDiscussion'>
                    <img src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                    <div className='discussionHolder'>
                        <div className='nameTimeIcon'>
                            <div className='nameAndTime'>
                                <p className='displayName'>{name ? name : <div className='nameSkeleton skeleton'></div>}</p>
                                <span>{item.time ? item.time : "N/A"}</span>
                            </div>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </div>
                        <h2 className='discussionTextTitle'>{item.title}</h2>
                        {item.content ? (
                            <p className='discussionTextBody' dangerouslySetInnerHTML={{ __html: item.content }}></p>
                        ) : (
                            <div className="contentSkeleton skeleton"></div>
                        )}
                        <div className='discussionStatistics'>
                            <div className='voteCounter'>
                                <FontAwesomeIcon 
                                    icon={faArrowUp} 
                                    onClick={handleUpvote} 
                                    className={liked ? 'liked' : ''} 
                                />
                                <p>{item.likes?.length || 0}</p>
                                <FontAwesomeIcon 
                                    icon={faArrowDown} 
                                    onClick={handleDownvote} 
                                    className={disliked ? 'liked' : ''} 
                                />
                            </div>
                            <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{item.comments?.length || 0}</p>
                        </div>
                    </div>
                </div>
                <div className='quillAndButton'>
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        theme="snow"
                        modules={modules}
                        placeholder="Write something..."
                    />
                    <button className='postButton' onClick={handleComment}>Add Comment</button>
                </div>
                <div className='commentsSection'>
                    {comments ? comments.map(item => <Comments item={item} post={itemOld} setComments={setComments} />)
                        : <>
                            {[...Array(4)].map((_, index) => (
                                <div className='commentBody' key={index}>
                                    <div className='profilePicSkeleton skeleton'></div>
                                    <div className='commentHolder'>
                                        <div className='nameTimeIcon'>
                                            <div className='nameCommentSkeleton skeleton'></div>
                                            <FontAwesomeIcon icon={faEllipsis} />
                                        </div>
                                        <div className='contentSkeleton skeleton'></div>
                                        <div className='flexingSkeletonHolder'>
                                            <div className='likesSkeleton skeleton'></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>}
                </div>
            </div>
        </Layout>
    )
}

export default PostDetail;