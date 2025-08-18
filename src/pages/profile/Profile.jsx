import axios from 'axios';
import { parse } from "date-fns";
import { updateProfile } from 'firebase/auth';
import { arrayRemove, arrayUnion, collection, deleteField, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defUser from '../../assets/default_user.jpg';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { auth, db } from '../../firebase';
import './profile.scss';

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { uid } = useParams();

    const [profilePicture, setProfilePicture] = useState('');
    const [userName, setUserName] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const [userData, setUserData] = useState({ posts: [], comments: [], saved: [], upvoted: [], downvoted: [] });

    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const [owners, setOwners] = useState({});
    const [itemLoading, setItemLoading] = useState({});

    const viewingOwnProfile = currentUser?.uid === uid;

    const handleFileChange = (event) => {
        const fileImage = event.target.files?.[0];
        if (fileImage) setFile(fileImage);
    };

    useEffect(() => {
        if (file) uploadImage();
    }, [file]);

    const uploadImage = async () => {
        if (!file || !currentUser?.uid) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'profile_preset');
        formData.append('cloud_name', 'dk53jsnru');

        try {
            const response = await axios.post('https://api.cloudinary.com/v1_1/dk53jsnru/image/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = response.data?.secure_url;
            if (!url) return;

            setImageUrl(url);
            await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: url });
            if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url });
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleFollow = async () => {
        if (!currentUser?.uid || currentUser.uid === uid || followLoading) return;
        try {
            setPendingAction('follow');
            setFollowLoading(true);
            await updateDoc(doc(db, 'users', uid), { followers: arrayUnion(currentUser.uid) });
            await updateDoc(doc(db, 'users', currentUser.uid), { following: arrayUnion(uid) });
            setIsFollowing(true);
            setFollowersCount((prev) => prev + 1);
        } catch (error) {
            console.error('Error following user:', error);
        } finally {
            setFollowLoading(false);
            setPendingAction(null);
        }
    };

    const handleUnfollow = async () => {
        if (!currentUser?.uid || currentUser.uid === uid || followLoading) return;
        try {
            setPendingAction('unfollow');
            setFollowLoading(true);
            await updateDoc(doc(db, 'users', uid), { followers: arrayRemove(currentUser.uid) });
            await updateDoc(doc(db, 'users', currentUser.uid), { following: arrayRemove(uid) });
            setIsFollowing(false);
            setFollowersCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error unfollowing user:', error);
        } finally {
            setFollowLoading(false);
            setPendingAction(null);
        }
    };

    const timeAgo = (d) => {
        if (!d) return '';
        const s = Math.floor((Date.now() - d.getTime()) / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const days = Math.floor(h / 24);
        if (days < 7) return `${days}d ago`;
        const w = Math.floor(days / 7);
        if (w < 5) return `${w}w ago`;
        const mo = Math.floor(days / 30);
        if (mo < 12) return `${mo}mo ago`;
        const y = Math.floor(days / 365);
        return `${y}y ago`;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!uid) return;

            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (!userDoc.exists()) {
                    navigate('/not-found');
                    return;
                }
                const u = userDoc.data();
                setProfilePicture(u?.photoURL || '');
                setUserName(u?.displayName || 'User');
                const followers = Array.isArray(u?.followers) ? u.followers : [];
                setFollowersCount(followers.length);
                setIsFollowing(currentUser?.uid ? followers.includes(currentUser.uid) : false);

                const postsSnapshot = await getDocs(collection(db, 'userPosts'));
                const meSnap = currentUser?.uid ? await getDoc(doc(db, 'users', currentUser.uid)) : null;

                let userPosts = [];
                let userComments = [];
                let savedPosts = [];
                let upvotedPosts = [];
                let downvotedPosts = [];

                postsSnapshot.forEach((docSnap) => {
                    const data = docSnap.data() || {};
                    Object.entries(data).forEach(([postId, post]) => {
                        const fullPost = { ...post, id: postId, ownerUid: docSnap.id };

                        if (fullPost.ownerUid === uid) userPosts.push(fullPost);

                        if (fullPost.comments) {
                            Object.entries(fullPost.comments).forEach(([commentId, comment]) => {
                                const fullComment = { ...comment, id: commentId, postId: postId, ownerUid: fullPost.ownerUid };
                                if (fullComment.senderUid === uid) userComments.push(fullComment);
                            });
                        }

                        if (Array.isArray(fullPost.likes) && fullPost.likes.includes(uid)) upvotedPosts.push(fullPost);
                        if (Array.isArray(fullPost.dislikes) && fullPost.dislikes.includes(uid)) downvotedPosts.push(fullPost);
                    });
                });

                if (meSnap?.exists() && Array.isArray(meSnap.data()?.savedPosts) && meSnap.data().savedPosts.length) {
                    const savedPostsPromises = meSnap.data().savedPosts.map(async (item) => {
                        const postDoc = await getDoc(doc(db, 'userPosts', item.ownerUid));
                        const map = postDoc.data() || {};
                        const post = map[item.postId] || null;
                        return post ? { ...post, id: item.postId, ownerUid: item.ownerUid } : null;
                    });
                    const resolvedSaved = await Promise.all(savedPostsPromises);
                    savedPosts = resolvedSaved.filter(Boolean);
                }

                setUserData({ posts: userPosts, comments: userComments, saved: savedPosts, upvoted: upvotedPosts, downvoted: downvotedPosts });

                const ownerUids = new Set([
                    ...userPosts.map((p) => p.ownerUid),
                    ...savedPosts.map((p) => p.ownerUid),
                    ...upvotedPosts.map((p) => p.ownerUid),
                    ...downvotedPosts.map((p) => p.ownerUid)
                ]);
                const need = [...ownerUids].filter((x) => !owners[x]);
                if (need.length) {
                    const entries = await Promise.all(need.map(async (x) => {
                        const s = await getDoc(doc(db, 'users', x));
                        const d = s.data() || {};
                        return [x, { displayName: d.displayName || 'User', photoURL: d.photoURL || '' }];
                    }));
                    setOwners((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchData();
    }, [uid, currentUser?.uid, imageUrl, navigate]);

    const setLoadingFor = (key, v) => setItemLoading((s) => ({ ...s, [key]: v }));

    const handleDeletePost = async (e, post) => {
        e.stopPropagation();
        if (!viewingOwnProfile) return;
        const key = `post:${post.ownerUid}:${post.id}`;
        try {
            setLoadingFor(key, true);
            await updateDoc(doc(db, 'userPosts', post.ownerUid), { [`${post.id}`]: deleteField() });
            setUserData((d) => ({ ...d, posts: d.posts.filter((p) => !(p.id === post.id && p.ownerUid === post.ownerUid)) }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFor(key, false);
        }
    };

    const handleUnsavePost = async (e, post) => {
        e.stopPropagation();
        if (!viewingOwnProfile) return;
        const key = `unsave:${post.ownerUid}:${post.id}`;
        try {
            setLoadingFor(key, true);
            await updateDoc(doc(db, 'users', currentUser.uid), { savedPosts: arrayRemove({ ownerUid: post.ownerUid, postId: post.id }) });
            setUserData((d) => ({ ...d, saved: d.saved.filter((p) => !(p.id === post.id && p.ownerUid === post.ownerUid)) }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFor(key, false);
        }
    };

    const handleDeleteComment = async (e, comment) => {
        e.stopPropagation();
        if (!viewingOwnProfile) return;
        const key = `comment:${comment.ownerUid}:${comment.postId}:${comment.id}`;
        try {
            setLoadingFor(key, true);
            await updateDoc(doc(db, 'userPosts', comment.ownerUid), { [`${comment.postId}.comments.${comment.id}`]: deleteField() });
            setUserData((d) => ({ ...d, comments: d.comments.filter((c) => !(c.id === comment.id && c.postId === comment.postId && c.ownerUid === comment.ownerUid)) }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFor(key, false);
        }
    };

    const renderPost = (post, inSaved) => {
        const owner = owners[post.ownerUid] || {};
        const dateString = post.time;
        const d = parse(dateString, "EEEE, dd/MM/yyyy HH:mm", new Date());
        const keyDelete = `post:${post.ownerUid}:${post.id}`;
        const keyUnsave = `unsave:${post.ownerUid}:${post.id}`;
        const tags = Array.isArray(post.tags) ? post.tags : Array.isArray(post.categories) ? post.categories : [];
        return (
            <div key={post.id} className='postItem' onClick={() => navigate(`/postDetail/${post.ownerUid}/${post.id}`)}>
                <div className='itemHead'>
                    <img className='ownerAvatar' src={owner.photoURL || defUser} alt='' loading='lazy' />
                    <div className='ownerMeta'>
                        <div className='ownerName'>{owner.displayName || 'User'}</div>
                        <time className='itemTime' dateTime={d ? d.toISOString() : ''}>{timeAgo(d)}</time>
                    </div>
                </div>
                <h3>{post.title}</h3>
                <div className='tagList'>{tags.slice(0, 6).map((t, i) => <span key={i} className='chip'>#{String(t).trim()}</span>)}</div>
                <p dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                <div className='itemActions'>
                    {viewingOwnProfile && activeTab === 'posts' && (
                        <button className='btnGhost btnDanger' onClick={(e) => handleDeletePost(e, post)} disabled={!!itemLoading[keyDelete]}>
                            {itemLoading[keyDelete] ? <span className='btnSpinner' aria-hidden='true' /> : null}
                            <span>{itemLoading[keyDelete] ? 'Deleting…' : 'Delete'}</span>
                        </button>
                    )}
                    {viewingOwnProfile && inSaved && (
                        <button className='btnGhost' onClick={(e) => handleUnsavePost(e, post)} disabled={!!itemLoading[keyUnsave]}>
                            {itemLoading[keyUnsave] ? <span className='btnSpinner' aria-hidden='true' /> : null}
                            <span>{itemLoading[keyUnsave] ? 'Removing…' : 'Remove from Saved'}</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderComment = (comment) => {
        const dateString = comment.time;
        const d = parse(dateString, "EEEE, dd/MM/yyyy HH:mm", new Date());
        const key = `comment:${comment.ownerUid}:${comment.postId}:${comment.id}`;
        return (
            <div key={comment.id} className='commentItem' onClick={() => navigate(`/postDetail/${comment.ownerUid}/${comment.postId}`)}>
                <div className='itemHead'>
                    <div className='ownerMeta'>
                        <div className='ownerName'>Comment</div>
                        <time className='itemTime' dateTime={d ? d.toISOString() : ''}>{timeAgo(d)}</time>
                    </div>
                </div>
                <p dangerouslySetInnerHTML={{ __html: comment.content || '' }} />
                {viewingOwnProfile && (
                    <div className='itemActions'>
                        <button className='btnGhost btnDanger' onClick={(e) => handleDeleteComment(e, comment)} disabled={!!itemLoading[key]}>
                            {itemLoading[key] ? <span className='btnSpinner' aria-hidden='true' /> : null}
                            <span>{itemLoading[key] ? 'Deleting…' : 'Delete'}</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className='containerProfileNav'>
                <div className='profileHeader'>
                    <div className='userCredentials'>
                        {currentUser?.uid === uid && (
                            <input type='file' accept='image/*' id='imageSelector' onChange={handleFileChange} />
                        )}
                        <label htmlFor='imageSelector'>
                            <img
                                src={profilePicture || defUser}
                                alt={`${userName || 'User'} avatar`}
                                loading='lazy'
                            />
                        </label>
                        <h3>{userName && userName}</h3>
                        <p className='followCounter'>{followersCount} Followers</p>

                        {currentUser?.uid !== uid ? (
                            isFollowing ? (
                                <button
                                    className={`unfollowBtn ${followLoading ? 'loading' : ''}`}
                                    onClick={handleUnfollow}
                                    disabled={followLoading}
                                >
                                    {followLoading && pendingAction === 'unfollow' ? (
                                        <>
                                            <span className='btnSpinner' aria-hidden='true' />
                                            <span>Unfollowing…</span>
                                        </>
                                    ) : (
                                        'Unfollow'
                                    )}
                                </button>
                            ) : (
                                <button
                                    className={`followBtn ${followLoading ? 'loading' : ''}`}
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                >
                                    {followLoading && pendingAction === 'follow' ? (
                                        <>
                                            <span className='btnSpinner' aria-hidden='true' />
                                            <span>Following…</span>
                                        </>
                                    ) : (
                                        'Follow'
                                    )}
                                </button>
                            )
                        ) : (
                            <button className='followBtn' onClick={() => navigate('/settings')}>Edit Profile</button>
                        )}
                    </div>

                    <ul>
                        <li className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>Posts</li>
                        <li className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>Comments</li>
                        {currentUser?.uid === uid && (
                            <li className={activeTab === 'saved' ? 'active' : ''} onClick={() => setActiveTab('saved')}>Saved</li>
                        )}
                        <li className={activeTab === 'upvoted' ? 'active' : ''} onClick={() => setActiveTab('upvoted')}>Upvoted</li>
                        <li className={activeTab === 'downvoted' ? 'active' : ''} onClick={() => setActiveTab('downvoted')}>Downvoted</li>
                    </ul>
                </div>

                <div className='profileContent'>
                    {activeTab === 'posts' && (
                        <div className='profileTabContent'>
                            <h2>{currentUser?.uid === uid ? "Your Posts" : "User Posts"}</h2>
                            <div className='scrollableContent'>
                                {userData.posts.length ? userData.posts.map((post) => renderPost(post, false)) : <p>No posts available.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className='profileTabContent'>
                            <h2>{currentUser?.uid === uid ? "Your Comments" : "User Comments"}</h2>
                            <div className='scrollableContent'>
                                {userData.comments.length ? userData.comments.map((comment) => renderComment(comment)) : <p>No comments available.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className='profileTabContent'>
                            <h2>Saved Posts</h2>
                            <div className='scrollableContent'>
                                {userData.saved.length ? userData.saved.map((post) => renderPost(post, true)) : <p>No saved posts.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upvoted' && (
                        <div className='profileTabContent'>
                            <h2>Upvoted Posts</h2>
                            <div className='scrollableContent'>
                                {userData.upvoted.length ? userData.upvoted.map((post) => renderPost(post, false)) : <p>No upvoted posts.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'downvoted' && (
                        <div className='profileTabContent'>
                            <h2>Downvoted Posts</h2>
                            <div className='scrollableContent'>
                                {userData.downvoted.length ? userData.downvoted.map((post) => renderPost(post, false)) : <p>No downvoted posts.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;