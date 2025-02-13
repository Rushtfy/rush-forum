import { faArrowDown, faArrowUp, faCommentDots, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useLocation } from 'react-router-dom';
import { v4 as uuid } from "uuid";
import Comments from '../../components/comments/Comments';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './postDetail.scss';

const PostDetail = () => {

    const location = useLocation();
    const itemOld = location.state;
    const { currentUser } = useContext(AuthContext);

    const [item, setItem] = useState(itemOld);
    const [name, setName] = useState(null);
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
            const unsub = await getDoc(doc(db, "userPosts", itemOld.ownerUid));
            const unsubTwo = await getDoc(doc(db, "users", itemOld.ownerUid));
            const unsubThree = await getDocs(collection(db, "userPosts"));


            let array1 = [];
            let commentsObj = {}
            setComments(null);
            unsubThree.forEach((doc) => {
                commentsObj = doc.data()?.[itemOld.id]?.comments;
            })
            Object.entries(commentsObj).map(item => array1.push(item[1]));

            setComments(array1);
            setItem(unsub.data()[itemOld.id]);
            setName(unsubTwo.data().displayName);

            return () => {
                unsub();
                unsubTwo();
                unsubThree();
            }

        }
        currentUser.uid && getData();
    }, [currentUser.uid]);

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
            await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                [itemOld.id + ".comments." + uniqueID]: {
                    "id": uniqueID,
                    "senderUid": currentUser.uid,
                    "content": content,
                    "likes": [],
                    "dislikes": [],
                    "replies": [],
                    "time": currDate + " " + currTime
                }
            })
            setContent("");
            window.location.reload();
        } catch (error) {
            alert(error);
        }
    }

    return (
        <Layout>
            <div className='containerPostDetail'>
                <div className='imageAndDiscussion'>
                    <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picuture" />
                    <div className='discussionHolder'>
                        <div className='nameTimeIcon'>
                            <div className='nameAndTime'>
                                <p className='displayName'>{name ? name : <div className='nameSkeleton skeleton'></div>}</p>
                                <span>{item.time ? item.time : "N/A"}</span>
                            </div>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </div>
                        <h2 className='discussionText'>{item.title}</h2>
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
                    {comments ? comments.map(item => <Comments item={item} post={itemOld}/>)
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