import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/ForgotPassword.css'; // Import the CSS file

function ForgotPassword() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [stage, setStage] = useState(1); // 1: Enter Mobile, 2: Create Password
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!/^\d{10}$/.test(mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/forgot-password', { mobileNumber });
            if (response.status === 200) {
                setMessage(response.data.message);
                setStage(2); // Move to password creation stage
            } else if (response.status === 404) {
                setError(response.data.message || 'Mobile number not found.');
            } else {
                setError('An error occurred. Please try again later.');
            }
        } catch (err) {
            console.error('Error verifying mobile number:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred. Please try again later.');
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/reset-password', {
                mobileNumber,
                newPassword,
            });
            if (response.status === 200) {
                setMessage('Password reset successfully. Redirecting to Login...');
                setTimeout(() => {
                    navigate('/'); // Redirect to login page
                }, 2000);
            } else {
                setError('Failed to reset password.');
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Forgot Password</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {stage === 1 && (
                    <form onSubmit={handleMobileSubmit}>
                        <div className="form-group">
                            <label htmlFor="mobileNumber">Mobile Number:</label>
                            <input
                                type="tel"
                                id="mobileNumber"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                                placeholder="Enter 10 digit mobile number"
                            />
                        </div>
                        <button type="submit" className="submit-button">Verify Mobile Number</button>
                    </form>
                )}

                {stage === 2 && (
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password:</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">Reset Password</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;