import React, { useState } from 'react'
import './register.scss'
import hill from '../../assets/hill (2).png'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase"
import { doc, setDoc } from "firebase/firestore"; 
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {

    const [error, setError] = useState(false);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;

        try {
            const createUser = await createUserWithEmailAndPassword(auth, email, password);
            const updateUser = await updateProfile(auth.currentUser, { displayName: displayName });
            const addUserToDb = await setDoc(doc(db, "users", auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                displayName: displayName,
                email: email
            });
            const addUserPostsToDb = await setDoc(doc(db, "userPosts", auth.currentUser.uid), {});
            navigate('/');
        } catch(error) {
            setError(true);
        }
    }

    return (
        <div className='formBody'>
            <div className="formContainer">
                <img src={hill} alt="image" />
                <div className='formItems'>
                    <span className='logo'>Create an account</span>
                    <span className='title'>Register</span>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder='User Name' />
                        <input type="email" placeholder='Email' />
                        <input type="password" placeholder='Password' />
                        <button>Sign Up</button>
                        {error && <span style={{color:"red"}}>Something went wrong</span>}
                    </form>
                    <p>Already have an account? <Link style={{color:'#6D54B5'}} to="/login">Log in</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Register