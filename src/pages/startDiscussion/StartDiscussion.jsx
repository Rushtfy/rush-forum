import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
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

    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [posting, setPosting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);

    const maxLength = 300;
    const navigate = useNavigate();

    const modules = {
        toolbar: [
            [{ bold: true }, { italic: true }, { underline: true }, { strike: true }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ color: [] }, { background: [] }],
            ['blockquote', 'code-block'],
            ['clean']
        ]
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
            setInputValue('');
        }
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleSaveDraft = async () => {
        if (!currentUser?.uid) return;
        try {
            setSaving(true);
            await updateDoc(doc(db, 'users', currentUser.uid), {
                draft: {
                    title,
                    content,
                    tags,
                    updatedAt: new Date().toISOString()
                }
            });
            setHasDraft(true);
        } catch (e) {
            console.error('Save draft error:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDraft = async () => {
        if (!currentUser?.uid) return;
        try {
            setDeleting(true);
            await updateDoc(doc(db, 'users', currentUser.uid), { draft: deleteField() });
            setHasDraft(false);
            setTitle('');
            setContent('');
            setTags([]);
            setInputValue('');
        } catch (e) {
            console.error('Delete draft error:', e);
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentUser?.uid) return;
        try {
            setPosting(true);
            const uniqueID = uuid();
            const now = new Date();
            const currDate = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'numeric', day: '2-digit' });
            const currTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            await updateDoc(doc(db, 'userPosts', currentUser.uid), {
                [uniqueID]: {
                    id: uniqueID,
                    ownerUid: currentUser.uid,
                    title,
                    content,
                    likes: [],
                    dislikes: [],
                    comments: {},
                    tags,
                    time: currDate + ' ' + currTime
                }
            });

            await updateDoc(doc(db, 'users', currentUser.uid), { draft: deleteField() });
            setHasDraft(false);
            navigate('/');
        } catch (error) {
            console.log('Something went wrong:', error);
        } finally {
            setPosting(false);
        }
    };

    useEffect(() => {
        const loadDraft = async () => {
            if (!currentUser?.uid) return;
            try {
                const snap = await getDoc(doc(db, 'users', currentUser.uid));
                const d = snap.data();
                if (d?.draft) {
                    setTitle(d.draft.title || '');
                    setContent(d.draft.content || '');
                    setTags(Array.isArray(d.draft.tags) ? d.draft.tags : []);
                    setHasDraft(true);
                } else {
                    setHasDraft(false);
                }
            } catch (e) {
                console.error('Load draft error:', e);
            }
        };
        loadDraft();
    }, [currentUser?.uid]);

    return (
        <Layout>
            <div className="startDiscussion">
                <div className="formCard">
                    <header className="formHeader">
                        <h1>Start a discussion</h1>
                        <p className="helper">Be specific and respectful.</p>
                    </header>

                    <div className="field">
                        <div className="labelRow">
                            <label htmlFor="sd-title">Title</label>
                            <span className="charCount">{title.length}/{maxLength}</span>
                        </div>
                        <input
                            id="sd-title"
                            className="control"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={maxLength}
                            placeholder="Enter a concise, descriptive title"
                            aria-describedby="sd-title-count"
                        />
                    </div>

                    <div className="field">
                        <div className="labelRow">
                            <label htmlFor="sd-tags">Tags</label>
                        </div>

                        <div className="tagInputBody">
                            <div className="tagInputContainer">
                                <div className="tagHolder">
                                    {tags.map((tag, index) => (
                                        <span key={`${tag}-${index}`}>
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(index)} aria-label={`Remove tag ${tag}`}>✖</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    id="sd-tags"
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Add tags and press Enter"
                                    aria-label="Add a tag"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="sd-content">Content</label>
                        <div className="editor-container">
                            <ReactQuill className='my-editor'
                                id="sd-content"
                                value={content}
                                onChange={setContent}
                                theme="snow"
                                modules={modules}
                                placeholder="Write something…"
                            />
                            <div className="actions">
                                <button className="btnGhost" type="button" onClick={handleSaveDraft} disabled={saving || posting || deleting}>
                                    {saving ? 'Saving…' : 'Save Draft'}
                                </button>
                                {hasDraft && (
                                    <button className="btnDanger" type="button" onClick={handleDeleteDraft} disabled={deleting || posting}>
                                        {deleting ? 'Deleting…' : 'Delete Draft'}
                                    </button>
                                )}
                                <button className="btnPrimary" type="button" onClick={handleSubmit} disabled={posting || deleting}>
                                    {posting ? 'Posting…' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default StartDiscussion;