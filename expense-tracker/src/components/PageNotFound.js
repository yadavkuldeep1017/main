import React from 'react';
import { Link } from 'react-router-dom';
import '../css/PageNotFound.css'; // Import your CSS file

const PageNotFound = () => {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1 className="not-found-title">404</h1>
                <p className="not-found-message">Oops! The page you're looking for can't be found.</p>
                <div className="not-found-actions">
                    <Link to="/" className="not-found-link">Go back to Home</Link>
                    {/* Optional: Add a search bar or other helpful links */}
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;