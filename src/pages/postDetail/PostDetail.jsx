import { faArrowDown, faArrowUp, faCommentDots, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
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

                setComments(allComments);
                setItem(userPostDoc.data()?.[itemOld.id] || {});
                setName(userDoc.data()?.displayName || "Unknown");
                setProfilePicture(userDoc.data()?.photoURL);
            } catch (error) {
                console.log("Something went wrong:", error);
                navigate("/");
            }
        }
        currentUser?.uid && getData();
    }, [currentUser?.uid, itemOld]);

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
                        {item.content && <p className='discussionTextBody' dangerouslySetInnerHTML={{ __html: item.content }}></p>}
                        <div className='discussionStatistics'>
                            <div className='voteCounter'>
                                <FontAwesomeIcon icon={faArrowUp} />
                                <p>{item.likes.length}</p>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </div>
                            <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{item.comments.length}</p>
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
                    {comments ? comments.map(item => <Comments item={item} post={itemOld} setComments={setComments}/>)
                        : <>
                            <div className='commentBody'>
                                <div className='profilePicSkeleton skeleton'></div>
                                <div className='commentHolder'>
                                    <div className='nameTimeIcon'>
                                        <div className='nameCommentSkeleton skeleton'></div>
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </div>
                                    <div className='contentSkeleton skeleton'></div>
                                    <div className='flexingSkeletonHolder'>
                                        <div className='likesSkeleton skeleton'></div>
                                        <div className='likesSkeleton skeleton'></div>
                                    </div>
                                </div>
                            </div>
                            <div className='commentBody'>
                                <div className='profilePicSkeleton skeleton'></div>
                                <div className='commentHolder'>
                                    <div className='nameTimeIcon'>
                                        <div className='nameCommentSkeleton skeleton'></div>
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </div>
                                    <div className='contentSkeleton skeleton'></div>
                                    <div className='flexingSkeletonHolder'>
                                        <div className='likesSkeleton skeleton'></div>
                                        <div className='likesSkeleton skeleton'></div>
                                    </div>
                                </div>
                            </div>
                            <div className='commentBody'>
                                <div className='profilePicSkeleton skeleton'></div>
                                <div className='commentHolder'>
                                    <div className='nameTimeIcon'>
                                        <div className='nameCommentSkeleton skeleton'></div>
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </div>
                                    <div className='contentSkeleton skeleton'></div>
                                    <div className='flexingSkeletonHolder'>
                                        <div className='likesSkeleton skeleton'></div>
                                        <div className='likesSkeleton skeleton'></div>
                                    </div>
                                </div>
                            </div>
                            <div className='commentBody'>
                                <div className='profilePicSkeleton skeleton'></div>
                                <div className='commentHolder'>
                                    <div className='nameTimeIcon'>
                                        <div className='nameCommentSkeleton skeleton'></div>
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </div>
                                    <div className='contentSkeleton skeleton'></div>
                                    <div className='flexingSkeletonHolder'>
                                        <div className='likesSkeleton skeleton'></div>
                                        <div className='likesSkeleton skeleton'></div>
                                    </div>
                                </div>
                            </div>
                        </>}
                </div>
            </div>
        </Layout>
    )
}

export default PostDetail