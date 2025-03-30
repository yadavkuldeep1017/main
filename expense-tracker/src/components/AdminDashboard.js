import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../css/AdminDashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState(null);
    const username = localStorage.getItem('username');
    const navigate = useNavigate();
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
    const formRef = useRef(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [addedProducts, setAddedProducts] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editQuantityValue, setEditQuantityValue] = useState('');
    const [editPriceValue, setEditPriceValue] = useState('');
    const [sumProduct, setSumProduct] = useState(0);
    const productSelectRef = useRef(null); 


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
    }, []);

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

        const newProduct = {
            prod_id: selectedProduct.value,
            prod_name: selectedProduct.label,
            quantity: parseInt(quantity),
            price: parseFloat(price)
        };
        setSumProduct(sumProduct + (newProduct.price));
        setAddedProducts([...addedProducts, newProduct]);
        setQuantity('');
        setPrice('');
        setSelectedProduct(null);
        // Focus on the quantity input after adding a product
        productSelectRef.current.focus(); 
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

        console.log('updatedProducts[index].price:', updatedProducts[index].price);


        // Update sumProduct on editing the quantity or price
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
        // Update sumProduct on deleting a product
        setSumProduct(sumProduct - deletedProductPrice);
        updatedProducts.splice(index, 1);
        setAddedProducts(updatedProducts);
    };

    const handleSubmit = async () => {
        if (addedProducts.length === 0) {
            setError('Please add at least one product before saving');
            return;
        }

        const purchases = addedProducts.map((product) => ({
            prod_id: product.prod_id,
            quantity: product.quantity,
            price: product.price,
            username,
            date: purchaseDate,
        }));

        try {
            const response = await axios.post(`${backendUrl}/api/purchases`, purchases);
            if (response.status === 201) {
                alert('Purchases saved successfully!');
                setAddedProducts([]);
                setSumProduct(0);
            } else {
                setError('Failed to save purchases');
            }
        } catch (err) {
            console.error("Error saving purchases:", err);
            setError('An error occurred while saving purchases');
        }
    };

    const handleCancel = () => {
        setQuantity('');
        setPrice('');
        setSelectedProduct(null);
        setPurchaseDate(new Date().toISOString().slice(0, 10));
        setAddedProducts([]);
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
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Purchase Tracker - Admin</h1>
                    <div className="header-actions">
                        <Link to="/add-product" className="header-link">Add Product</Link>
                        <Link to="/report" className="header-link">Product Report</Link>
                        <Link to="/purchases" className="header-link">Purchases</Link>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>
            <main className="dashboard-main">
                <section className="purchase-form-section">
                    <h2>Record a New Purchase</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form id="purchaseForm" onSubmit={(e) => e.preventDefault()} ref={formRef}>
                        <div className="form-group">
                            <label htmlFor="purchaseDate">Purchase Date:</label>
                            <input type="date" id="purchaseDate" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
                        </div>

                        <div className="form-group product-search">
                            <label htmlFor="itemName">Product Name:</label>
                            <Select
                                ref={productSelectRef}
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
                            <input type="number" id="total" value={price} onChange={(e) => setPrice(e.target.value)} required onKeyDown={(e) => { if (e.key === 'Enter') { handleAddProduct();} }}/>
                        </div>

                        <button type="button" onClick={handleAddProduct}>Add to List</button>
                        <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
                    </form>
                </section>
                {addedProducts.length > 0 && (
                    <section className="added-products-section">
                        <h2>Added Products</h2>
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
                                        <td>
                                            {editingIndex === index ? (
                                                <>
                                                    <button onClick={() => handleSaveEdit(index)}>Save</button>
                                                    <button onClick={handleCancelEdit}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditProduct(index)}>Edit</button>
                                                    <button onClick={() => handleDeleteProduct(index)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="total-sum">Total: {sumProduct.toFixed(2)}</p> {/* Display the total sum of all products */}
                        <button type="button" onClick={handleSubmit}>Save Purchases</button>
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard; 