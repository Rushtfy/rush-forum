import React, { useContext, useEffect, useRef, useState } from 'react';
import './messageModel.scss';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const MessageModel = ({ message }) => {
    const { currentUser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);
    
    const [date, setDate] = useState("");

    const ref = useRef();

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    useEffect(() => {
        if (message.date) {
            const dateObj = message.date.toDate();
            const options = {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            };
            setDate(dateObj.toLocaleString('en-GB', options));
        }
    }, [message.date]);

    const { photoURL: currentUserPhotoURL } = currentUser;
    const { photoURL: userPhotoURL } = data.user || {};

    return (
        <div ref={ref} className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className='messageInfo'>
                <img 
                    src={message.senderId === currentUser.uid ? currentUserPhotoURL : userPhotoURL || "default-photo-url.jpg"} 
                    alt="sender" 
                />
                <span>{date}</span>
            </div>
            <div className='messageContent'>
                {message.text && <p>{message.text}</p>}
                {message.img && <img src={message.img} alt="image" />}
            </div>
        </div>
    );
}

export default MessageModel;