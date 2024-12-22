// Frontend (UserDashboard.js)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/UserDashboard.css';
import { Link } from 'react-router-dom';

function UserDashboard() {
    const [productTypes, setProductTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [total, setTotal] = useState(0); // State for total amount
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const username = localStorage.getItem('username')

    useEffect(() => {
        fetchProductTypes();
    }, []);

    useEffect(() => {
        if (selectedType) {
            fetchProductsByType(selectedType);
        } else {
            setProducts([]);
            setSelectedProduct('')
        }
    }, [selectedType]);

    useEffect(() => {
        if (price && quantity) {
            setTotal(parseFloat(price) * parseInt(quantity));
        } else {
            setTotal(0);
        }
    }, [price, quantity]);

    const fetchProductTypes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/product-types');
            setProductTypes(response.data);
        } catch (error) {
            console.error("Error fetching product types:", error);
            setError("Error fetching product types. Please try again later.");
        }
    };

    const fetchProductsByType = async (typeId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/products?typeId=${typeId}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Error fetching products. Please try again later.");
        }
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };

    const handleProductChange = (e) => {
        setSelectedProduct(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/purchases', {
                date: purchaseDate,
                quantity: parseInt(quantity),
                price: parseFloat(price),
                comment: comment,
                prod_id: parseInt(selectedProduct),
                username: username
            });
            if (response.status === 201) {
                alert("Purchase added succesfully")
                document.getElementById("purchaseForm").reset()
                setSelectedType('')
            }
            else {
                setError("error in adding purchase")
            }
        }
        catch (error) {
            console.error("Error adding purchase:", error);
            if(error.response) {
                setError(error.response.data.message)
            }
            else {
                setError("Error in adding purchase")
            }
        }
    }

    return (
        <div>
            <header className="App-header">
                <h1>Purchase Tracker</h1>
                <div className="top-right-buttons">
                    {/* Add Product Button */}
                    <Link to="/add-product">
                        <button>Add Product</button>
                    </Link>

                    {/* Product Report Button */}
                    <Link to="/report">
                        <button>Product Report</button>
                    </Link>
                    <Link to="/">
                        <button>Logout</button>
                    </Link>
                </div>
            </header>
            <main>
                <section id="purchase-form">
                    <h2>Record a New Purchase</h2>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <form id="purchaseForm" onSubmit={handleSubmit}>
                        <label htmlFor="purchaseDate">Purchase Date:</label>
                        <input type="date" id="purchaseDate" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required /><br />

                        <label htmlFor="productType">Product Type:</label>
                        <select id="productType" value={selectedType} onChange={handleTypeChange} required>
                            <option value="">Select a Type</option>
                            {productTypes.map((type) => (
                                <option key={type.type_id} value={type.type_id}>
                                    {type.type_name}
                                </option>
                            ))}
                        </select><br />

                        <label htmlFor="itemName">Name of Item:</label>
                        <select id="itemName" value={selectedProduct} onChange={handleProductChange} required>
                            <option value="">Select a Product</option>
                            {products.map((product) => (
                                <option key={product.prod_id} value={product.prod_id}>
                                    {product.prod_name}
                                </option>
                            ))}
                        </select><br />

                        <label htmlFor="quantity">Quantity:</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /><br />

                        <label htmlFor="price">Price:</label>
                        <input type="number" id="price" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /><br />

                        <label htmlFor="total">Total Amount:</label>
                        <input type="number" id="total" value={total} readOnly /><br /> {/* Display total */}

                        <label htmlFor="comment">Comment/Note:</label>
                        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}></textarea><br />
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