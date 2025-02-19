import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './chat.scss';

const Chat = () => {

    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);

    const { currentUser } = useContext(AuthContext);

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

    const handleSelect = async () => {
        const combinedId =
            currentUser.uid > user.uid
                ? currentUser.uid + user.uid
                : user.uid + currentUser.uid;

        try {
            const res = await getDoc(doc(db, "chats", combinedId));
            const res2 = await getDoc(doc(db, "userChats", currentUser.uid));

            if (!res2.exists()) {
                await setDoc(doc(db, "userChats", currentUser.uid), {});
            }

            if (!res.exists()) {
                await setDoc(doc(db, "chats", combinedId), { messages: [] });

                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [combinedId + ".userInfo"]: {
                        "uid": user.uid,
                        "displayName": user.displayName,
                        "photoURL": user.photoURL ? user.photoURL : ""
                    },
                    [combinedId + ".date"]: serverTimestamp()
                });

                await updateDoc(doc(db, "userChats", user.uid), {
                    [combinedId + ".userInfo"]: {
                        "uid": currentUser.uid,
                        "displayName": currentUser.displayName,
                        "photoURL": currentUser.photoURL ? currentUser.photoURL : ""
                    },
                    [combinedId + ".date"]: serverTimestamp()
                });
            }
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    }

    useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                setChats(doc.data());
            });

            return () => {
                unsub();
            }
        }

        currentUser.uid && getChats();
    }, [currentUser.uid]);

    return (
        <Layout>
            <div className='chatBody'>
                <div className='chatContainer'>
                    <div className='chatSidebar'>
                        <div className='chatSidebarHeader'>
                            <h2>RUSHCHAT</h2>
                        </div>
                        <div className='chatSearchUser'>
                            <input type="text" placeholder='Find a user' onKeyDown={handleKey} onChange={(e) => setUsername(e.target.value)} />
                            {user &&
                                <div className='user' onClick={handleSelect}>
                                    <img src={user?.photoURL ? user?.photoURL : "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                                    <p>{user?.displayName}</p>
                                </div>}
                        </div>
                        <div className='chats'>
                            {Object.entries(chats)?.map(chat => (
                                <div className='userChat' key={chat[0]}>
                                    <img src={chat[1].photoURL ? chat[1].photoURL : "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                                    <div className='userChatInfo'>
                                        <span>{chat[1].userInfo.displayName}</span>
                                        <p>{chat[1].userInfo.lastMessage?.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='chatHeaderAndMessagesField'>
                        <div className='chatHeader'>
                        </div>
                        <div className='chatMessagesField'>
                            <div className='chatField'>

                            </div>
                            <div className='inputField'>
                                <input type="text" placeholder='Message...' />
                                <div className='chatMedia'>
                                    <FontAwesomeIcon icon={faImage} style={{ cursor: "pointer" }} />
                                    <button>Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Chat