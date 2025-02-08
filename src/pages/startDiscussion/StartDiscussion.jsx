import React, { useContext, useState } from 'react';
import './startDiscussion.scss';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            await updateDoc(doc(db, "userPosts", currentUser.uid), {
                "posts": arrayUnion({
                    "ownerUid": currentUser.uid,
                    "title": title,
                    "content": content,
                    "likes": [],
                    "dislikes": [],
                    "comments": []
                }),
            });
            navigate('/');
        } catch (error) {
            alert("Something went wrong");
            setError(true);
        }
    }

    return (
        <div className='startDiscussionBody'>
            <Header />
            <div className="startDiscussion">
                <Sidebar />
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
            </div>
        </div>
    )
}

export default StartDiscussion