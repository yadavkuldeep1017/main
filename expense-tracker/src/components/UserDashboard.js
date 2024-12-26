import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/UserDashboard.css'; // Make sure this path is correct
import { Link, useNavigate } from 'react-router-dom';

function UserDashboard() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(''); // Store prod_id
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State to store search query
    const [filteredProducts, setFilteredProducts] = useState([]); // To store filtered product list
    const username = localStorage.getItem('username');
    const navigate=useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                console.log(response.data);
                setProducts(response.data);
                setFilteredProducts(response.data); // Initialize with all products
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Error fetching products. Please try again later.");
            }
        };

        fetchProducts();
    }, []);

    const handleProductChange = (product) => {
        console.log(product);
        setSelectedProduct(product.prod_id);
        setSearchQuery(product.prod_name); // Update the input with the selected product name
        setPrice(product.price);
        setFilteredProducts([]); // Clear search results once product is selected
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Filter products based on search query
        const results = products.filter(product =>
            product.prod_name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(results);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            console.log("prod ", products);
            const response = await axios.post('http://localhost:5000/api/purchase_details', {
                quantity: parseInt(quantity),
                price: parseFloat(price),
                prod_id: selectedProduct, // Send only the prod_id
                username: username,
            });

            if (response.status === 201) {
                alert('Purchase added successfully!');
                document.getElementById('purchaseForm').reset();
                setSelectedProduct('');
                setQuantity('');
                setPrice('');
                setSearchQuery('');
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

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/logout'); // Send logout request
            localStorage.removeItem('isAuthenticated'); // Remove authentication flag
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('username');
            navigate('/', { replace: true }); // Redirect to login, prevent going back
        } catch (err) {
            console.error("Error logging out:", err);
            setError("An error occurred during logout.");
        }
    };

    return (
        <div>
            <header className="App-header">
                <h1>Purchase Tracker</h1>
                <div className="top-right-buttons">
                    <button onClick={handleLogout}>Logout</button> {/* Use onClick handler */}
                </div>
            </header>
            <main>
                <section id="purchase-form">
                    <h2>Record a New Purchase</h2>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <form id="purchaseForm" onSubmit={handleSubmit}>

                        <label htmlFor="itemName">Search and Select Item:</label>
                        <input
                            type="text"
                            id="searchItem"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search for a product"
                        />
                        {filteredProducts.length > 0 && searchQuery && (
                            <ul className="search-results">
                                {filteredProducts.map((product) => (
                                    <p
                                        key={product.prod_id}
                                        onClick={() => handleProductChange(product)}
                                        style={{ cursor: 'pointer', padding: '5px', backgroundColor: '#f0f0f0', margin: '2px 0' }}
                                    >
                                        {product.prod_name}
                                    </p>
                                ))}
                            </ul>
                        )}
                        <br />

                        <label htmlFor="quantity">Quantity:</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /><br />


                        <label htmlFor="total">Total Amount:</label>
                        <input type="number" id="total" value={price} onChange={(e) => setPrice(e.target.value)} required /><br /> {/* Display total */}

                        <div className="button-container">
                            <button id="save" type="submit">Save</button>
                            <button id="cancel" type="reset">Cancel</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default UserDashboard;
