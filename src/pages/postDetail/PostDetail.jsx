import { faArrowDown, faArrowUp, faBookmark, faCommentDots, faEllipsis, faFlag, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayRemove, arrayUnion, collection, deleteField, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import Comments from '../../components/comments/Comments';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './postDetail.scss';

const PostDetail = () => {

    const { ownerUid, id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [item, setItem] = useState(null);
    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState("");
    const [content, setContent] = useState("");
    const [comments, setComments] = useState(null);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [dropdown, setDropdown] = useState(false);

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

    const toggleDropdown = async (e) => {
        e.stopPropagation();
        setDropdown((prev) => !prev);
    }

    useEffect(() => {
        const getItem = async () => {
            if (!ownerUid || !id) {
                navigate("/");
                return;
            } else {
                try {
                    const itemBackup = await getDoc(doc(db, "userPosts", ownerUid));
                    setItem(itemBackup.data()?.[id]);
                } catch (error) {
                    console.log(error);
                }
            }
        }

        currentUser?.uid && getItem();
    }, [currentUser?.uid]);

    useEffect(() => {
        const getData = async () => {
            try {
                const userPostDoc = await getDoc(doc(db, "userPosts", item.ownerUid));
                const userDoc = await getDoc(doc(db, "users", item.ownerUid));
                const allPostsSnapshot = await getDocs(collection(db, "userPosts"));

                let allComments = [];
                setComments(null);
                allPostsSnapshot.forEach((doc) => {
                    const postComments = doc.data()?.[item.id]?.comments;
                    if (postComments) {
                        allComments.push(...Object.values(postComments));
                    }
                });

                const postData = userPostDoc.data()?.[item.id] || {};

                setLiked(postData.likes?.includes(currentUser.uid));
                setDisliked(postData.dislikes?.includes(currentUser.uid));

                setComments(allComments);
                setName(userDoc.data()?.displayName || "Unknown");
                setProfilePicture(userDoc.data()?.photoURL);
            } catch (error) {
                console.log("Something went wrong:", error);
                navigate("/");
            }
        };

        item && getData();

    }, [item]);

    const handleUpvote = async () => {
        try {
            const postDocRef = doc(db, "userPosts", item.ownerUid);
            const postDoc = await getDoc(postDocRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();

                const postLikes = postData[item.id]?.likes;
                const postDislikes = postData[item.id]?.dislikes;

                if (postDislikes && postDislikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".dislikes"]: arrayRemove(currentUser.uid)
                    });
                    setDisliked(false);
                }

                if (postLikes && postLikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".likes"]: arrayRemove(currentUser.uid)
                    });
                    setLiked(false);
                } else {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".likes"]: arrayUnion(currentUser.uid)
                    });
                    setLiked(true);
                }

                const updatedPostDoc = await getDoc(postDocRef);
                const updatedPostData = updatedPostDoc.data();
                setItem(updatedPostData[item.id]);
            }
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    };

    const handleDownvote = async () => {
        try {
            const postDocRef = doc(db, "userPosts", item.ownerUid);
            const postDoc = await getDoc(postDocRef);

            if (postDoc.exists()) {
                const postData = postDoc.data();

                const postLikes = postData[item.id]?.likes;
                const postDislikes = postData[item.id]?.dislikes;

                if (postLikes && postLikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".likes"]: arrayRemove(currentUser.uid)
                    });
                    setLiked(false);
                }


                if (postDislikes && postDislikes.includes(currentUser.uid)) {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".dislikes"]: arrayRemove(currentUser.uid)
                    });
                    setDisliked(false);
                } else {
                    await updateDoc(doc(db, "userPosts", item.ownerUid), {
                        [item.id + ".dislikes"]: arrayUnion(currentUser.uid)
                    });
                    setDisliked(true);
                }

                const updatedPostDoc = await getDoc(postDocRef);
                const updatedPostData = updatedPostDoc.data();
                setItem(updatedPostData[item.id]);
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

            await updateDoc(doc(db, "userPosts", item.ownerUid), {
                [item.id + ".comments." + uniqueID]: newComment
            });

            setComments((prev) => [...prev, newComment]);
            setContent("");
        } catch (error) {
            alert(error);
        }
    }

    const deletePost = async () => {
        setDropdown((prev) => !prev);

        try {
            const postDoc = doc(db, "userPosts", item.ownerUid);
            await updateDoc(postDoc, {
                [item.id]: deleteField()
            });
            navigate('/');

        } catch (error) {
            console.log("Error removing post:", error);
        }
    };

    const savePost = async () => {
        setDropdown((prev) => !prev);

        try {
            const postData = {
                postId: item.id,
                ownerUid: item.ownerUid
            };

            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            const savedPosts = userDoc.data()?.savedPosts || [];

            const isPostAlreadySaved = savedPosts.some(post => post.postId === item.id && post.ownerUid === item.ownerUid);

            if (!isPostAlreadySaved) {
                await updateDoc(userDocRef, {
                    savedPosts: arrayUnion(postData),
                });
                alert("Post saved successfully!");
            } else {
                alert("Post is already saved.");
            }
        } catch (error) {
            console.error("Error saving the post:", error);
        }
    };

    return (
        <Layout>
            <div className='containerPostDetail'>
                <div className='imageAndDiscussion'>
                    <img src={profilePicture || "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                    <div className='discussionHolder'>
                        <div className='nameTimeIcon'>
                            <div className='nameAndTime'>
                                <div className='displayName'>{name ? name : <div className='nameSkeleton skeleton'></div>}</div>
                                <span>{item?.time ? item?.time : "N/A"}</span>
                            </div>
                            <div className="dropdown">
                                <FontAwesomeIcon icon={faEllipsis} onClick={toggleDropdown} className='threeDots' />
                                {dropdown && (
                                    <div className="dropdownContent">
                                        <p><FontAwesomeIcon icon={faFlag} />Report</p>
                                        <p onClick={savePost}><FontAwesomeIcon icon={faBookmark} />Save</p>
                                        {item.ownerUid === currentUser?.uid && (
                                            <p onClick={deletePost}><FontAwesomeIcon icon={faTrash} />Delete</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <h2 className='discussionTextTitle'>{item?.title}</h2>
                        {item?.content ? (
                            <p className='discussionTextBody' dangerouslySetInnerHTML={{ __html: item?.content }}></p>
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
                                <p>{item?.likes?.length || 0}</p>
                                <FontAwesomeIcon
                                    icon={faArrowDown}
                                    onClick={handleDownvote}
                                    className={disliked ? 'liked' : ''}
                                />
                            </div>
                            <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{item && Object.keys(item?.comments).length || 0}</p>
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
                    {comments ? comments.map(element => <Comments item={element} post={item} setComments={setComments} key={element.id} />)
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