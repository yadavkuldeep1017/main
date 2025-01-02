import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/SignUp.css'; // Import your CSS file

function Signup() {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/signup', {
                fullName,
                username,
                password,
                mobileNumber,
            });

            if (response.status === 201) {
                setMessage('Signup successful. Redirecting to login...');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else if (response.status === 409) {
                setError(response.data.message || 'Username or mobile number already exists.');
            } else {
                setError('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('An error occurred during signup.');
            }
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>Sign Up</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name:</label>
                        <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mobileNumber">Mobile Number:</label>
                        <input type="tel" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
                    </div>
                    <button type="submit" className="submit-button">Sign Up</button>
                    <p className="login-link">Already have an account? <Link to="/">Log in</Link></p>
                </form>
            </div>
        </div>
    );
}

export default Signup;