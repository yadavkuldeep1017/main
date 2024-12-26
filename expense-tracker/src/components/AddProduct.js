import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/AdminDashboard.css'; // Make sure the path is correct

function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [newProductName, setNewProductName] = useState('');
    const [newProductDesc, setNewProductDesc] = useState('');
    const [editingProductId, setEditingProductId] = useState(null);
    const [editedProductName, setEditedProductName] = useState('');
    const [editedProductDesc, setEditedProductDesc] = useState('');
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products'); // Use relative path
            setProducts(response.data);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Error fetching products.");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError(null); // Clear any previous errors

        if (!newProductName || !newProductDesc) {
            setError("Please provide both product name and description.");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/products', { prod_name: newProductName, prod_desc: newProductDesc });
            setNewProductName('');
            setNewProductDesc('');
            fetchProducts();
        } catch (err) {
            console.error("Error adding product:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Error adding product.");
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProductId(product.prod_id);
        setEditedProductName(product.prod_name);
        setEditedProductDesc(product.prod_desc);
    };

    const handleSaveEdit = async () => {
        setError(null);

        if (!editedProductName || !editedProductDesc) {
            setError("Please provide both product name and description.");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/products/${editingProductId}`, { prod_name: editedProductName, prod_desc: editedProductDesc });
            setEditingProductId(null);
            fetchProducts();
        } catch (err) {
            console.error("Error updating product:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Error updating product.");
            }
        }
    };

    const handleDeleteProduct = async (productId) => {
        setError(null);
        try {
            await axios.delete(`http://localhost:5000/api/products/${productId}`);
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Error deleting product.");
            }
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:5000/api/logout');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('username');
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error logging out:", err);
            setError("An error occurred during logout.");
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredProducts = products.filter((product) =>
        product.prod_name.toLowerCase().includes(searchQuery) ||
        product.prod_desc.toLowerCase().includes(searchQuery)
    );


    return (
        <div>
            <header className="App-header">
                <h1>Admin Dashboard</h1>
                <div className="top-right-buttons">
                    {/* Add Product Button */}
                    <Link to="/admin">
                        <button>Add New Purchase</button>
                    </Link>

                    {/* Product Report Button */}
                    <Link to="/report">
                        <button>Product Report</button>
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>
            <main>
                <h2>Product Management</h2>
                {error && <div className="error-message">{error}</div>} {/* Use a class for styling */}

                <h3>Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                    <input type="text" placeholder="Product Name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
                    <input type="text" placeholder="Product Description" value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)} required />
                    <button type="submit">Add Product</button>
                </form>

                <input type="text" placeholder="Search products..." value={searchQuery} onChange={handleSearch} style={{ marginBottom: '10px', width: '300px' }} /> {/* Search input */}
                <h3>Product List</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredProducts.map((product) => (
                            <tr key={product.prod_id}>
                                <td>{product.prod_id}</td>
                                <td>
                                    {editingProductId === product.prod_id ? (
                                        <input type="text" value={editedProductName} onChange={(e) => setEditedProductName(e.target.value)} required />
                                    ) : (
                                        product.prod_name
                                    )}
                                </td>
                                <td>
                                    {editingProductId === product.prod_id ? (
                                        <input type="text" value={editedProductDesc} onChange={(e) => setEditedProductDesc(e.target.value)} required />
                                    ) : (
                                        product.prod_desc
                                    )}
                                </td>
                                <td>
                                    <div className="button-container">
                                        {editingProductId === product.prod_id ? (
                                            <button onClick={handleSaveEdit}>Save</button>
                                        ) : (
                                            <button onClick={() => handleEditProduct(product)}>Edit</button>
                                        )}
                                        <button onClick={() => handleDeleteProduct(product.prod_id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}

export default AdminDashboard;