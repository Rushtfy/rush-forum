import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../../components/context/AuthContext'
import { db } from '../../../../firebase';
import { arrayUnion, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import './discussions.scss'
import DiscussionModel from '../../../../components/discussionModel/DiscussionModel';

const Discussions = () => {

    const { currentUser } = useContext(AuthContext);

    const [error, setError] = useState(false);
    const [posts, setPosts] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target[0].value;

        try {
            await updateDoc(doc(db, "userPosts", currentUser.uid), {
                "posts": arrayUnion({
                    "ownerUid": currentUser.uid,
                    "postText": text,
                    "likes": [],
                    "dislikes": [],
                    "comments": [],
                    "displayName": currentUser.displayName
                }),
            });
            e.target[0].value = "";
        } catch (error) {
            setError(true);
        }
    }

    function shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    }

    useEffect(() => {
        const getPosts = () => {
            const unsub = onSnapshot(collection(db, "userPosts"), (doc) => {
                let array1 = []
                setPosts([])
                doc.forEach((info) => {
                    info.data().posts?.map(item => array1.push(item))
                });
                shuffle(array1);
                setPosts(array1);
            });

            return () => {
                unsub();
            }
        }

        currentUser.uid && getPosts()
    }, [currentUser.uid]);

    return (
        <div className='discussions'>
            {/* <div>
                {error && <p>Something went wrong</p>}
                <p>{currentUser.displayName}</p>
                <p>{currentUser.email}</p>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Post Content' />
                    <button>Send Post</button>
                </form>
            </div> */}
            <div>
                {posts && posts.map((item, index) =>
                    // <div style={{ border: "1px solid white", borderRadius: "5px", maxWidth: "400px", padding: "10px", margin: "8px" }} key={index}>
                    //     <p style={{ fontSize: "12px", color: "red" }}>{item.displayName}</p>
                    //     <p>{item.postText}</p>
                    // </div>
                    <DiscussionModel item={item}/>
                )}
            </div>
        </div>

    )
}

export default Discussions