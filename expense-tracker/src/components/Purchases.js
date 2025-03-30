import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Purchases.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';

function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState(null);
    const [editPurchaseId, setEditPurchaseId] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [error, setError] = useState(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();


    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/purchases/admin`);
            setPurchases(response.data);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            setError("Error fetching purchases. Please try again later.");
        }
    };

    const handleDelete = async (purchId) => {
        try {
            await axios.delete(`${backendUrl}/api/purchases/${purchId}`);
            fetchPurchases();
        } catch (error) {
            console.error("Error deleting purchase:", error);
            setError("Error deleting purchase. Please try again later.");
        }
    };

    const handleEdit = (purchase) => {
        setEditPurchaseId(purchase.purch_id);
        setEditQuantity(purchase.quantity);
        setEditPrice(purchase.total_price);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`${backendUrl}/api/purchases/${editPurchaseId}`, {
                quantity: parseInt(editQuantity),
                price: parseFloat(editPrice),
            });
            setEditPurchaseId(null);
            fetchPurchases();
        } catch (error) {
            console.error("Error updating purchase:", error);
            setError("Error updating purchase. Please try again later.");
        }
    };

    const handleCancelEdit = () => {
        setEditPurchaseId(null);
    };

    const filteredPurchases = purchases.filter((purchase) => {
        const nameMatch = purchase.prod_name.toLowerCase().includes(searchTerm.toLowerCase());
        const dateMatch = filterDate ? moment(purchase.purchase_date).isSame(moment(filterDate), 'day') : true;
        return nameMatch && dateMatch;
    });

    const handleLogout = async () => {
        try {
            await axios.get(`${backendUrl}/logout`);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('username');
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error logging out:", err);
            setError("An error occurred during logout.");
        }
    };

    return (
        <div className="admin-purchases-container">
             <header className="dashboard-header">
                <div className="header-content">
                    <h1>Purchases</h1> {/* Changed title */}
                    <div className="header-actions">
                        <Link to="/admin-dashboard" className="header-link">Home</Link> {/* Home link */}
                        <Link to="/add-product" className="header-link">Add Product</Link>
                        <Link to="/report" className="header-link">Product Report</Link>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>
            {error && <div className="error-message">{error}</div>}
            <div className="search-filter-container">
                <input type="text" placeholder="Search by product name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                <DatePicker selected={filterDate} onChange={(date) => setFilterDate(date)} dateFormat="yyyy-MM-dd" placeholderText="Filter by date" className="date-picker" />
            </div>
            <table className="purchases-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Username</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPurchases.map((purchase) => (
                        <tr key={purchase.purch_id}>
                            <td>{moment(purchase.purchase_date).format('YYYY-MM-DD')}</td>
                            <td>{purchase.prod_name}</td>
                            <td>
                                {editPurchaseId === purchase.purch_id ? (
                                    <input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} />
                                ) : (
                                    purchase.quantity
                                )}
                            </td>
                            <td>
                                {editPurchaseId === purchase.purch_id ? (
                                    <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                                ) : (
                                    purchase.total_price
                                )}
                            </td>
                            <td>{purchase.username}</td> {/* Display username */}
                            <td className="action-buttons">
                                {editPurchaseId === purchase.purch_id ? (
                                    <>
                                        <button onClick={handleSaveEdit}>Save</button>
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(purchase)}>Edit</button>
                                        <button onClick={() => handleDelete(purchase.purch_id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Purchases;