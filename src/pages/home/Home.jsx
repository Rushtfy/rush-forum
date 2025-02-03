import React, { useContext } from 'react'
import { AuthContext } from '../../components/context/AuthContext'
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const {currentUser} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogOut = async () => {
        await signOut(auth);
        navigate("/login");
    }

  return (
    <div>
        <p>{currentUser.displayName}</p>
        <p>{currentUser.email}</p>
        <button onClick={handleLogOut}>Log Out</button>
    </div>
  )
}

export default Home