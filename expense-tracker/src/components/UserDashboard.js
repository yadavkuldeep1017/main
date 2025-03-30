import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/UserDashboard.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useAuth } from '../App.js';

function UserDashboard() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState(null);
    const username = localStorage.getItem('username');
    const navigate = useNavigate();
    const formRef = useRef(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const auth = useAuth();
    const [addedProducts, setAddedProducts] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editQuantityValue, setEditQuantityValue] = useState('');
    const [editPriceValue, setEditPriceValue] = useState('');
    const [sumProduct, setSumProduct] = useState(0);


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/products`);
                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Error fetching products. Please try again later.");
            }
        };

        fetchProducts();
    }, [backendUrl]);

    const handleProductChange = (selectedOption) => {
        setSelectedProduct(selectedOption);
        if (selectedOption) {
            setPrice(selectedOption.price);
            document.getElementById('quantity').focus(); 
        } else {
            setPrice('');
        }
    };

    const handleAddProduct = () => {
        if (!selectedProduct || !quantity || !price) {
            setError('Please fill in all required fields (product, quantity, price)');
            return;
        }

        setError('');

        const newProduct = {
            prod_id: selectedProduct.value,
            prod_name: selectedProduct.label,
            quantity: parseInt(quantity),
            price: parseFloat(price),
        };

        setSumProduct(sumProduct + (newProduct.price));
        setAddedProducts([...addedProducts, newProduct]);
        setQuantity('');
        setPrice('');
        setSelectedProduct(null);
         // Focus on the quantity input after adding a product
         document.getElementById('quantity').focus();
    };

    const handleEditProduct = (index) => {
        setEditingIndex(index);
        setEditQuantityValue(addedProducts[index].quantity);
        setEditPriceValue(addedProducts[index].price);
    };

    const handleSaveEdit = (index) => {
        const updatedProducts = [...addedProducts];
        const oldProductPrice = updatedProducts[index].price;
        console.log('oldProduct.price:', oldProductPrice);

        updatedProducts[index].quantity = parseInt(editQuantityValue);
        updatedProducts[index].price = parseFloat(editPriceValue);
        const priceChange = updatedProducts[index].price - oldProductPrice;
        console.log('Price Change:- ', priceChange);
        setSumProduct(sumProduct + priceChange);
        setAddedProducts(updatedProducts);
        setEditingIndex(null);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleDeleteProduct = (index) => {
        const updatedProducts = [...addedProducts];
        const deletedProductPrice = updatedProducts[index].price;
        setSumProduct(sumProduct - deletedProductPrice);
        updatedProducts.splice(index, 1);
        setAddedProducts(updatedProducts);
    };


    const handleSavePurchases = async () => {
        if (!addedProducts.length) {
            setError('Please add at least one product to save.');
            return;
        }

        const purchasesToSave = addedProducts.map((product) => ({
            prod_id: product.prod_id,
            quantity: product.quantity,
            price: product.price,
            username,
            date: new Date().toISOString().split('T')[0],
        }));

        try {
            const response = await axios.post(`${backendUrl}/api/purchases`, purchasesToSave);
            if (response.status === 201) {
                alert('Purchases saved successfully!');
                setAddedProducts([]);
                setSumProduct(0);
            } else {
                setError('Failed to save purchases');
            }
        } catch (err) {
            console.error("Error saving purchases:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred while saving purchases');
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

    const handleLogout = async () => {
        try {
            await axios.get(`${backendUrl}/logout`);
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
                <h2>Record New Purchases</h2>
                {error && <div className="error-message">{error}</div>}
                <form id="purchaseForm" onSubmit={(e) => e.preventDefault()} ref={formRef}>
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
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantity">Quantity:</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required onKeyDown={(e) => { if (e.key === 'Enter') { document.getElementById('total').focus(); } }} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="total">Total Amount:</label>
                        <input type="number" id="total" value={price} onChange={(e) => setPrice(e.target.value)} required onKeyDown={(e) => { if (e.key === 'Enter') { handleAddProduct(); } }}/>
                    </div>

                    <button type="button" onClick={handleAddProduct}>Add to List</button>
                    <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
                </form>

                <h2>Products to Save</h2>
                {error && <div className="error-message">{error}</div>}
                {addedProducts.length === 0 ? (
                    <p className="no-products">No products added yet.</p>
                ) : (
                    <div className="added-products-container"> {/* Added a container div */}
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addedProducts.map((product, index) => (
                                    <tr key={index}>
                                        <td>{product.prod_name}</td>
                                        <td>
                                            {editingIndex === index ? (
                                                <input type="number" value={editQuantityValue} onChange={(e) => setEditQuantityValue(e.target.value)} />
                                            ) : (
                                                product.quantity
                                            )}
                                        </td>
                                        <td>
                                            {editingIndex === index ? (
                                                <input type="number" step="0.01" value={editPriceValue} onChange={(e) => setEditPriceValue(e.target.value)} />
                                            ) : (
                                                product.price
                                            )}
                                        </td>
                                        <td className="action-buttons">
                                            {editingIndex === index ? (
                                                <>
                                                    <button className="edit-button" onClick={() => handleSaveEdit(index)}>Save</button>
                                                    <button className="remove-button" onClick={handleCancelEdit}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="edit-button" onClick={() => handleEditProduct(index)}>Edit</button>
                                                    <button className="remove-button" onClick={() => handleDeleteProduct(index)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="total-sum">Total: {sumProduct.toFixed(2)}</p> {/* Display the total sum of all products */}
                        <button type="button" onClick={handleSavePurchases} className="save-all-button">Save All Purchases</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;