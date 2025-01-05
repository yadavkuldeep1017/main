import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/UserDashboard.css'; // Import your CSS
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useAuth } from '../App.js'; // Import useAuth


function UserDashboard() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState(null);
    const username = localStorage.getItem('username');
    const navigate = useNavigate();
    const formRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Error fetching products. Please try again later.");
            }
        };

        fetchProducts();
    }, []);

    const handleProductChange = (selectedOption) => {
        setSelectedProduct(selectedOption);
        if (selectedOption) {
            setPrice(selectedOption.price);
        } else {
            setPrice('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedProduct) {
            setError("Please select a product.");
            return;
        }

        if (!quantity || quantity <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        if (!price || price <= 0) {
            setError("Please enter a valid price.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/purchase_details', {
                quantity: parseInt(quantity),
                price: parseFloat(price),
                prod_id: selectedProduct.value,
                username: username,
            });

            if (response.status === 201) {
                alert('Purchase added successfully!');
                handleCancel();
            } else {
                setError('Failed to add purchase.');
            }
        } catch (err) {
            console.error("Error adding purchase:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred while adding the purchase.');
            }
        }
    };

    const handleCancel = () => {
        setQuantity('');
        setPrice('');
        setSelectedProduct(null);
        if (formRef.current) {
            formRef.current.reset();
        }
    };
    const auth = useAuth();


    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/logout');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('username');
            auth.logout();
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error logging out:", err);
            setError("An error occurred during logout.");
        }
    };

    const productOptions = products.map(product => ({
        value: product.prod_id,
        label: product.prod_name,
        price: product.price
    }));

    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <header>
                    <h1>Purchase Tracker</h1>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </header>
                <h2>Record a New Purchase</h2>
                {error && <div className="error-message">{error}</div>}
                <form id="purchaseForm" onSubmit={handleSubmit} ref={formRef}>
                    <div className="form-group">
                        <label htmlFor="itemName">Product Name:</label>
                        <Select
                            value={selectedProduct}
                            onChange={handleProductChange}
                            options={productOptions}
                            isSearchable
                            placeholder="Search and select an item..."
                            id="searchItem"
                            isClearable
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantity">Quantity:</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="total">Total Amount:</label>
                        <input type="number" id="total" value={price} onChange={(e) => setPrice(e.target.value)} required/>
                    </div>

                    <div className="button-container">
                        <button type="submit" className="submit-button">Save Purchase</button>
                        <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserDashboard;