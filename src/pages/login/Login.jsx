import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import hill from '../../assets/hill (1).png';
import { auth, db } from '../../firebase';
import '../register/register.scss';

const Login = () => {
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.status === "banned") {
                    alert("Your account has been banned. Please contact support.");
                    await auth.signOut();
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div className='formBody'>
            <div className="formContainer">
                <img src={hill} alt="image" />
                <div className='formItems'>
                    <span className='logo'>Login to your account</span>
                    <span className='title'>Login</span>
                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder='Email' />
                        <input type="password" placeholder='Password' />
                        <button>Sign in</button>
                        {error && <span style={{ color: "red" }}>Something went wrong</span>}
                    </form>
                    <p>Don't have an account? <Link to="/register">Create One</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;