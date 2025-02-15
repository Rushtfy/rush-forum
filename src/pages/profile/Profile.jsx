import React, { useContext } from 'react';
import './profile.scss';
import Layout from '../../components/layout/Layout';
import { AuthContext } from '../../components/context/AuthContext';

const Profile = () => {

    const { currentUser } = useContext(AuthContext);

  return (
    <Layout>
        <div className='containerProfileNav'>
            <div className='profileHeader'>
                <div className='userCredentials'>
                    <img src="https://i.pinimg.com/474x/65/25/a0/6525a08f1df98a2e3a545fe2ace4be47.jpg" alt="profile picture" />
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