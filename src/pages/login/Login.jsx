import React, { useState } from 'react'
import '../register/register.scss'
import hill from '../../assets/hill (1).png'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'

const Login = () => {

    const [error, setError] = useState(false);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            const signinUser = await signInWithEmailAndPassword(auth, email, password);
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
                <span className='logo'>Login to your account</span>
                <span className='title'>Login</span>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder='Email'/>
                    <input type="password" placeholder='Password'/>
                    <button>Sign in</button>
                    {error && <span style={{color:"red"}}>Something went wrong</span>}
                </form>
                <p>Don't have an account? <Link style={{color:'#6D54B5'}} to="/register">Create One</Link></p>
            </div>
        </div>
    </div>
  )
}

export default Login