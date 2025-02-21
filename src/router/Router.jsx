import React, { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../components/context/AuthContext'
import AdminPanel from '../pages/adminPanel/AdminPanel'
import Chat from '../pages/chat/Chat'
import Discussions from '../pages/discussions/Discussions'
import Login from '../pages/login/Login'
import PostDetail from '../pages/postDetail/PostDetail'
import Profile from '../pages/profile/Profile'
import Register from '../pages/register/Register'
import StartDiscussion from '../pages/startDiscussion/StartDiscussion'
import Settings from '../pages/settings/Settings'

const Router = () => {

    const { currentUser } = useContext(AuthContext);

    const ProtectedRoute = ({ children }) => {
        if (!currentUser) {
            return <Navigate to="/login" />
        }

        return children
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route index element={
                    <ProtectedRoute>
                        <Discussions />
                    </ProtectedRoute>
                } />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/create' element={<StartDiscussion />} />
                <Route path='/postDetail' element={<PostDetail />}/>
                <Route path='/profile' element={<Profile />}/>
                <Route path='/chat' element={<Chat />}/>
                <Route path='/admin' element={<AdminPanel />}/>
                <Route path='/settings' element={<Settings />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default Router