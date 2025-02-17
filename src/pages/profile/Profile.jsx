import React, { useContext, useState } from 'react';
import './profile.scss';
import Layout from '../../components/layout/Layout';
import { AuthContext } from '../../components/context/AuthContext';
import { auth, db } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {

    const { currentUser } = useContext(AuthContext);
    const [base64, setBase64] = useState("");
    const [profilePicture, setProfilePicture] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setBase64(reader.result);
            reader.onerror = (error) => console.error("Error converting to Base64:", error);
        }
    }

    return (
        <Layout>
            <div className='containerProfileNav'>
                <div className='profileHeader'>
                    <div className='userCredentials'>
                        <input type="file" accept="image/*" id='imageSelector' onChange={handleFileChange} />
                        <label htmlFor="imageSelector">
                            {base64 ? <img src={base64} alt="profile picture" /> : <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picture" />}
                        </label>
                        <h3>{currentUser.displayName}</h3>
                    </div>
                    <ul>
                        <li><a href="/profile/posts">Posts</a></li>
                        <li><a href="/profile/comments">Comments</a></li>
                        <li><a href="/profile/saved">Saved</a></li>
                        <li><a href="/profile/upvoted">Upvoted</a></li>
                        <li><a href="/profile/downvoted">Downvoted</a></li>
                    </ul>
                </div>
            </div>
        </Layout>
    )
}

export default Profile