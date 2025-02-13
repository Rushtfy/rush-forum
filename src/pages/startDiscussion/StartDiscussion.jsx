import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { AuthContext } from '../../components/context/AuthContext';
import Layout from '../../components/layout/Layout';
import { db } from '../../firebase';
import './startDiscussion.scss';

const StartDiscussion = () => {

    const { currentUser } = useContext(AuthContext);

    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [error, setError] = useState(false);

    const maxLength = 300;
    const navigate = useNavigate();

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

    const handleSubmit = async () => {
        try {
            const uniqueID = uuid();
            const now = new Date();
            const currDate = now.toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "numeric",
                day: "2-digit",
            });

            const currTime = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });

            await updateDoc(doc(db, "userPosts", currentUser.uid), {
                [uniqueID]: {
                    "id": uniqueID,
                    "ownerUid": currentUser.uid,
                    "title": title,
                    "content": content,
                    "likes": [],
                    "dislikes": [],
                    "comments": [],
                    "time": currDate + " " + currTime
                },
            });
            navigate('/');
        } catch (error) {
            alert(error);
            setError(true);
        }
    }

    return (
        <Layout>
            <div className='inputsField'>
                <h1>Create Post</h1>

                <div className="title-input-container">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={maxLength}
                            placeholder="Title"
                            className="custom-input"
                        />
                    </div>
                    <span className="char-counter">{title.length}/{maxLength}</span>
                </div>

                <div className="editor-container">
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        theme="snow"
                        modules={modules}
                        placeholder="Write something..."
                    />
                    <div className="editor-buttons">
                        <button className="save-draft">Save Draft</button>
                        <button className="post" onClick={handleSubmit}>Post</button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default StartDiscussion