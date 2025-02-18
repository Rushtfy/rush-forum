import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './chat.scss';

const Chat = () => {

    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);

    const handleSearch = async () => {
        const q = query(collection(db, "users"), where("displayName", "==", username));

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setUser(doc.data());
            });
        } catch (error) {
            alert(error);
        }
    }

    const handleKey = (e) => {
        e.code === "Enter" && handleSearch();
    }

    return (
        <Layout>
            <input type="text" placeholder='search user' onKeyDown={handleKey} onChange={e => setUsername(e.target.value)} />
            {user &&
                <div className='user'>
                    <img src={user?.photoURL} alt="Profile Picture" />
                    <p>{user?.displayName}</p>
                </div>}
        </Layout>
    )
}

export default Chat