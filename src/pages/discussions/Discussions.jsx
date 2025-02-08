import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../components/context/AuthContext'
import { db } from '../../firebase';
import { arrayUnion, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import './discussions.scss'
import DiscussionModel from '../../components/discussionModel/DiscussionModel';

const Discussions = () => {

    const { currentUser } = useContext(AuthContext);

    const [posts, setPosts] = useState([]);


    function shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    }

    useEffect(() => {
        const getPosts = async () => {
            const unsub = await getDocs(collection(db, "userPosts"));
                let array1 = []
                setPosts([])
                unsub.forEach((info) => {
                    info.data().posts?.map(item => array1.push(item))
                });
                // shuffle(array1);
                setPosts(array1);

            return () => {
                unsub();
            }
        }

        currentUser.uid && getPosts()
    }, [currentUser.uid]);

    return (
        <div className='discussions'>
            {posts && posts.map((item, index) =>
                <DiscussionModel key={index} item={item} />
            )}
        </div>

    )
}

export default Discussions