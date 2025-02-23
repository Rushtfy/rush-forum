import React, { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';
import AdminPanel from '../pages/adminPanel/AdminPanel';
import CategoriesPost from '../pages/categoriesPost/CategoriesPost';
import Chat from '../pages/chat/Chat';
import Discussions from '../pages/discussions/Discussions';
import FollowPosts from '../pages/followPosts/FollowPosts';
import Login from '../pages/login/Login';
import PostDetail from '../pages/postDetail/PostDetail';
import Profile from '../pages/profile/Profile';
import Register from '../pages/register/Register';
import Settings from '../pages/settings/Settings';
import StartDiscussion from '../pages/startDiscussion/StartDiscussion';

const Router = () => {
    const { currentUser } = useContext(AuthContext);

    const ProtectedRoute = ({ children }) => {
        if (!currentUser) {
            return <Navigate to="/login" />
        }
        return children;
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route index element={
                    <ProtectedRoute>
                        <Discussions />
                    </ProtectedRoute>
                } />
                <Route path='/admin' element={<AdminPanel />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/create' element={<StartDiscussion />} />
                <Route path='/postDetail/:ownerUid/:id' element={<PostDetail />} />
                <Route path='/profile/:uid' element={<Profile />} />
                <Route path='/chat' element={<Chat />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/following' element={<FollowPosts />} />
                <Route path='/category/:tag' element={<CategoriesPost />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;