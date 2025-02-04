import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../components/context/AuthContext'
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import Layout from '../../components/layout/Layout';

const Home = () => {

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState(false);
  const [posts, setPosts] = useState([]);

  const handleLogOut = async () => {
    await signOut(auth);
    navigate("/login");
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target[0].value;

    try {
      await updateDoc(doc(db, "userPosts", currentUser.uid), {
        "posts": arrayUnion({
          "senderUid": currentUser.uid,
          "postText": text,
          "likedUsers": [],
          "dislikedUsers": [],
          "comments": [],
        }),
      });
      e.target[0].value = "";
    } catch (error) {
      setError(true);
    }
  }

  useEffect(() => {
    const getPosts = () => {
      const unsub = onSnapshot(doc(db, "userPosts", currentUser.uid), (doc) => {
        setPosts(doc.data().posts);
      });

      return () => {
        unsub();
      }
    }

    currentUser.uid && getPosts()
  }, [currentUser.uid]);

  return (
    <Layout>
      <div>
        {error && <p>Something went wrong</p>}
        <p>{currentUser.displayName}</p>
        <p>{currentUser.email}</p>
        <button onClick={handleLogOut}>Log Out</button>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder='Post Content' />
          <button>Submit</button>
        </form>
      </div>
      <div>
        {posts && posts.map(item => <p>{item.postText}</p>)}
      </div>
    </Layout>
  )
}

export default Home