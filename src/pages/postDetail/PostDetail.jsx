import React, { useContext, useEffect, useState } from 'react';
import './postDetail.scss';
import Layout from '../../components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faCommentDots, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../components/context/AuthContext';
import { arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { v4 as uuid } from "uuid";

const PostDetail = () => {

    const location = useLocation();
    const itemOld = location.state;
    const { currentUser } = useContext(AuthContext);

    const [item, setItem] = useState(itemOld);
    const [name, setName] = useState("");
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
            setComments(null);
            let commentsObj = {}
            unsubThree.forEach((doc) => {
                commentsObj = doc.data()?.[itemOld.id]?.comments;
            })
            Object.entries(commentsObj).map(item => array1.push(item[1]))
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
            await updateDoc(doc(db, "userPosts", itemOld.ownerUid), {
                [itemOld.id + ".comments." + uniqueID]: {
                    "id": uniqueID,
                    "senderUid": currentUser.uid,
                    "content": content,
                    "likes": [],
                    "dislikes": [],
                    "replies": []
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
                                <span>Today, 4:45PM</span>
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
                <div style={{ color: "white" }} className='commentsSection'>
                    {comments && comments.map(item =>
                        <div className='commentBody'>
                            <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picuture" />
                            <div className='commentHolder'>
                                <div className='nameTimeIcon'>
                                    <div className='nameAndTime'>
                                        <p className='displayName'>unknown</p>
                                        <span>Today, 4:45PM</span>
                                    </div>
                                    <FontAwesomeIcon icon={faEllipsis} />
                                </div>
                                <div className='discussionText' dangerouslySetInnerHTML={{__html:item.content}}></div>
                                <div className='discussionStatistics'>
                                    <div className='voteCounter'>
                                        <FontAwesomeIcon icon={faArrowUp} />
                                        <p>{item.likes.length}</p>
                                        <FontAwesomeIcon icon={faArrowDown} />
                                    </div>
                                    <p className='commentCounter'><FontAwesomeIcon icon={faCommentDots} />{item.replies.length}</p>
                                </div>
                            </div>
                        </div>)}
                </div>
            </div>
        </Layout>
    )
}

export default PostDetail