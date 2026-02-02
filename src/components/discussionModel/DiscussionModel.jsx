import { faArrowDown, faArrowUp, faCommentDots, faReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defUser from '../../assets/default_user.jpg';
import { db } from '../../firebase';
import { AuthContext } from '../context/AuthContext';
import './discussionModel.scss';

const DiscussionModel = ({ item }) => {
    const { currentUser } = useContext(AuthContext);
    const [name, setName] = useState(null);
    const [profilePicture, setProfilePicture] = useState('');
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(Array.isArray(item.likes) ? item.likes.length : 0);
    const [voting, setVoting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!item?.ownerUid || !currentUser?.uid) return;
        const fetchUserDetails = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', item.ownerUid));
                if (userDoc.exists()) {
                    const d = userDoc.data();
                    setName(d?.displayName || 'User');
                    setProfilePicture(d?.photoURL || '');
                }
                setLiked(Array.isArray(item.likes) && item.likes.includes(currentUser.uid));
                setDisliked(Array.isArray(item.dislikes) && item.dislikes.includes(currentUser.uid));
            } catch (error) {
                console.log('Something went wrong:', error);
            }
        };
        fetchUserDetails();
    }, [item, currentUser?.uid]);

    const goDetail = () => navigate(`/postDetail/${item.ownerUid}/${item.id}`);

    const goProfile = (e) => {
        e.stopPropagation();
        navigate(`/profile/${item.ownerUid}`);
    };

    const handleVote = async (e, type) => {
        e.stopPropagation();
        if (!currentUser?.uid || voting) return;
        const postDocRef = doc(db, 'userPosts', item.ownerUid);
        try {
            setVoting(true);
            const updates = {};
            if (type === 'like') {
                if (disliked) updates[`${item.id}.dislikes`] = arrayRemove(currentUser.uid);
                if (liked) {
                    updates[`${item.id}.likes`] = arrayRemove(currentUser.uid);
                    setLiked(false);
                    setLikeCount((c) => Math.max(0, c - 1));
                } else {
                    updates[`${item.id}.likes`] = arrayUnion(currentUser.uid);
                    setLiked(true);
                    setDisliked(false);
                    setLikeCount((c) => c + 1);
                }
            } else {
                if (liked) {
                    updates[`${item.id}.likes`] = arrayRemove(currentUser.uid);
                    setLiked(false);
                    setLikeCount((c) => Math.max(0, c - 1));
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
        } catch {
            alert('Something went wrong!');
        } finally {
            setVoting(false);
        }
    };

    const commentsCount = item?.comments ? Object.keys(item.comments).length : 0;

    const contentPreview = useMemo(() => {
        const raw = item?.content || '';
        const el = typeof window !== 'undefined' ? document.createElement('div') : null;
        if (!el) return '';
        el.innerHTML = raw;
        const text = (el.textContent || el.innerText || '').replace(/\s+\n/g, ' ').trim();
        return text;
    }, [item?.content]);

    return (
        <div className="individualDiscussion" onClick={goDetail} id={item.id}>
            <div className="dicussionContainer">
                <div className="imageAndDiscussion">
                    <img
                        src={profilePicture || defUser}
                        alt=""
                        onClick={goProfile}
                        loading="lazy"
                    />
                    <div className="discussionHolder">
                        <div className="nameAndTime">
                            <button className="displayName" onClick={goProfile}>
                                {name || <div className="skeletonName" />}
                            </button>
                            <span className="timeStamp">{item.time || 'N/A'}</span>
                        </div>

                        <p className="discussionText">{item.title}</p>
                        {contentPreview ? <p className="discussionPreview">{contentPreview}</p> : null}

                        <div className="discussionStatistics">
                            <div className="voteCounter" aria-label="Voting controls">
                                <button
                                    className={`voteBtn up ${liked ? 'active' : ''}`}
                                    onClick={(e) => handleVote(e, 'like')}
                                    aria-pressed={liked}
                                    disabled={voting}
                                    title="Upvote"
                                >
                                    <FontAwesomeIcon icon={faArrowUp} />
                                </button>

                                <p className="likeCount">{likeCount}</p>

                                <button
                                    className={`voteBtn down ${disliked ? 'active' : ''}`}
                                    onClick={(e) => handleVote(e, 'dislike')}
                                    aria-pressed={disliked}
                                    disabled={voting}
                                    title="Downvote"
                                >
                                    <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                            </div>

                            <p className="commentCounter" title="Comments">
                                <FontAwesomeIcon icon={faCommentDots} />
                                {commentsCount}
                            </p>
                        </div>
                    </div>
                </div>

                <button className="replyBtn" onClick={(e) => { e.stopPropagation(); goDetail(); }}>
                    <FontAwesomeIcon icon={faReply} />
                    Reply
                </button>
            </div>
        </div>
    );
};

export default DiscussionModel;
