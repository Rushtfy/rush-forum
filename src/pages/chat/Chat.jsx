import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './chat.scss';
import { ChatContext } from '../../components/context/ChatContext';
import MessageModel from '../../components/messageModel/MessageModel';
import { v4 as uuid } from "uuid";
import axios from 'axios';

const Chat = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [img, setImg] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const { currentUser } = useContext(AuthContext);
    const { data, dispatch } = useContext(ChatContext);

    const handleSearch = async () => {
        const q = query(collection(db, "users"), where("displayName", "==", username));

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setUser(doc.data());
            });
        } catch (error) {
            alert("Error searching for user:", error.message);
        }
    };

    const handleKey = (e) => {
        if (e.code === "Enter") handleSearch();
    };

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
                setUser(null);
            }
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    };

    const handleSelectUser = (u) => {
        dispatch({ type: "CHANGE_USER", payload: u });
    };

    const handleSend = async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            if (img) {
                const formData = new FormData();
                formData.append('file', img);
                formData.append('upload_preset', 'profile_preset');
                formData.append('cloud_name', 'dk53jsnru');

                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dk53jsnru/image/upload',
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                );
                
                await updateDoc(doc(db, "chats", data.chatId), {
                    "messages": arrayUnion({
                        "id": uuid(),
                        text,
                        "senderId": currentUser.uid,
                        "date": Timestamp.now(),
                        "img": response.data.secure_url
                    })
                });
            } else {
                await updateDoc(doc(db, "chats", data.chatId), {
                    "messages": arrayUnion({
                        "id": uuid(),
                        text,
                        "senderId": currentUser.uid,
                        "date": Timestamp.now()
                    })
                });
            }

            await updateDoc(doc(db, "userChats", currentUser.uid), {
                [data.chatId + ".lastMessage"]: {
                    text
                },
                [data.chatId + ".date"]: serverTimestamp()
            });

            await updateDoc(doc(db, "userChats", data.user.uid), {
                [data.chatId + ".lastMessage"]: {
                    text
                },
                [data.chatId + ".date"]: serverTimestamp()
            });

            setText("");
            setImg(null);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                setChats(doc.data());
            });

            return () => {
                unsub();
            };
        };

        currentUser.uid && getChats();
    }, [currentUser.uid]);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
            doc.exists() && setMessages(doc.data().messages);
        });

        return () => {
            unsub();
        };
    }, [data.chatId]);

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
                            {user && (
                                <div className='user' onClick={handleSelect}>
                                    <img src={user?.photoURL ? user?.photoURL : "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                                    <p>{user?.displayName}</p>
                                </div>
                            )}
                        </div>
                        <div className='chats'>
                            {Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map(chat => (
                                <div className='userChat' key={chat[0]} onClick={() => handleSelectUser(chat[1].userInfo)}>
                                    <img src={chat[1].userInfo.photoURL ? chat[1].userInfo.photoURL : "https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg"} alt="profile picture" />
                                    <div className='userChatInfo'>
                                        <span>{chat[1].userInfo.displayName}</span>
                                        <p>{chat[1].lastMessage?.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='chatHeaderAndMessagesField'>
                        <div className='chatHeader'>
                            <p>{data.user?.displayName}</p>
                        </div>
                        <div className='chatMessagesField'>
                            <div className='chatField'>
                                {messages.map(m => (
                                    <MessageModel message={m} key={m.id} />
                                ))}
                            </div>
                            <div className='inputField'>
                                <input type="text" placeholder='Message...' onChange={(e) => setText(e.target.value)} value={text} />
                                <div className='chatMedia'>
                                    <input type="file" style={{ display: "none" }} id="file" onChange={(e) => setImg(e.target.files[0])} />
                                    <label htmlFor="file">
                                        <FontAwesomeIcon icon={faImage} style={{ cursor: "pointer" }} />
                                    </label>
                                    <button onClick={handleSend} disabled={isSending}>Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Chat;