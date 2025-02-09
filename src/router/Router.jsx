import React, { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import Register from '../pages/register/Register'
import Login from '../pages/login/Login'
import { AuthContext } from '../components/context/AuthContext'
import StartDiscussion from '../pages/startDiscussion/StartDiscussion'
import PostDetail from '../pages/postDetail/PostDetail'

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
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/create' element={<StartDiscussion />} />
                <Route path='/postDetail' element={<PostDetail />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default Router