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

    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState("");

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

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue && !tags.includes(trimmedValue)) {
                setTags([...tags, trimmedValue]);
            }
            setInputValue("");
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
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
                    "tags": tags,
                    "time": currDate + " " + currTime
                },
            });
            navigate('/');
        } catch (error) {
            console.log("Something went wrong:", error);
        }
    }

    return (
        <Layout>
            <div className='inputsField'>
                <div className='title'>
                    <h1>Create Post</h1>
                    <div className='tagInputBody'>
                        <div className='tagInputContainer'>
                            <div className='tagHolder'>
                                {tags.map((tag, index) => (
                                    <span>
                                        {tag}
                                        <button onClick={() => handleRemoveTag(index)}>✖</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add Tags"
                                style={{ border: "none", outline: "none", flex: 1 }}
                            />
                        </div>
                    </div>
                </div>

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