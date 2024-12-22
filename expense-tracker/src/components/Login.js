import { useState } from 'react';
import './../css/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {

    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault(); //prevent form from refershing the page
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username: username,
                password: password
            });
            if (response.status === 200) {
                const data = response.data; // Get the response data
                localStorage.setItem('username',username);
                navigate('/user', { state: { username: username, userId: data.userId } });
            }
            else{
                setError('Invalid')
            }
        } catch (err) {
            console.log("Login error: ", err);
            console.log("Error response: ",err.response.data.message);
            setError(err.response.data.message);
            
            
        }
    };


    return (
        <div className="container">
            <div className="screen">
                <div className="screen__content">
                    <form className="login" onSubmit={handleLogin}>
                    {error && <div style={{ color: 'red',}}>{error}</div>} {/* Display error message */}

                        <div className="login__field">
                            <i className="login__icon fas fa-user"></i>
                            <input type="text" className="login__input" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} required />
                        </div>
                        <div className="login__field">
                            <i className="login__icon fas fa-lock"></i>
                            <input type="password" className="login__input" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)
                            } required />
                        </div>
                        <button className="button login__submit">
                            <span className="button__text">Log In</span>
                            <i className="button__icon fas fa-chevron-right"></i>
                        </button>

                    </form>
                </div>
                <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4"></span>
                    <span className="screen__background__shape screen__background__shape3"></span>
                    <span className="screen__background__shape screen__background__shape2"></span>
                    <span className="screen__background__shape screen__background__shape1"></span>
                </div>
            </div>
        </div>
    )
}

export default Login;