import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import '../css/Report.css';
import { Link, useNavigate } from 'react-router-dom';

function Report() {
    const [reportType, setReportType] = useState('custom');
    const [productScope, setProductScope] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [month, setMonth] = useState('');
    const [productName, setProductName] = useState('');
    const [productList, setProductList] = useState([]);
    const [filteredProductList, setFilteredProductList] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setProductList(response.data);
                setFilteredProductList(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Error fetching product list.");
            }
        };

        fetchProducts();
    }, []);

    const handleProductNameChange = (e) => {
        const query = e.target.value.toLowerCase();
        setProductName(e.target.value);
        setFilteredProductList(
            productList.filter((product) => product.prod_name.toLowerCase().includes(query))
        );
    };

    const handleProductSelect = (product) => {
        setProductName(product.prod_name);
        setFilteredProductList([]);
    };

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        let params = { reportType, productScope };

        if (reportType === 'custom') {
            if (!startDate || !endDate) {
                setError("Please select start and end dates.");
                setLoading(false);
                return;
            }
            params.startDate = startDate;
            params.endDate = endDate;
        } else if (reportType === 'monthly') {
            if (!month) {
                setError("Please select a month.");
                setLoading(false);
                return;
            }
            params.month = month;
        }

        if (productScope === 'specific') {
            if (!productName) {
                setError("Please select a product name.");
                setLoading(false);
                return;
            }
            params.productName = productName;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/reports', { params });
            setReportData(response.data);
        } catch (err) {
            console.error("Error fetching report:", err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to generate report.");
            }
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = async () => {
        setLoading(true);
        setError(null);
        let params = { reportType, productScope, download: 'excel' };

        if (reportType === 'custom') {
            if (!startDate || !endDate) {
                setError("Please select start and end dates.");
                setLoading(false);
                return;
            }
            params.startDate = startDate;
            params.endDate = endDate;
        } else if (reportType === 'monthly') {
            if (!month) {
                setError("Please select a month.");
                setLoading(false);
                return;
            }
            params.month = month;
        }

        if (productScope === 'specific') {
            if (!productName) {
                setError("Please select a product name.");
                setLoading(false);
                return;
            }
            params.productName = productName;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/reports', {
                params,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            FileSaver.saveAs(blob, 'report.xlsx');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Error downloading the report. Please try again.');
            }
        } finally {
            setLoading(false);
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
        <div className="report-container">
            <header className="App-header">
                <h1>Purchase Tracker</h1>
                <div className="top-right-buttons">
                    {/* Add Product Button */}
                    <Link to="/add-product">
                        <button>Add Product</button>
                    </Link>

                    {/* Product Report Button */}
                    <Link to="/admin">
                        <button>Home</button>
                    </Link>
                    <button onClick={handleLogout}>Logout</button> {/* Use onClick handler */}
                </div>
            </header>
            <h2>Generate Report</h2>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Loading...</div>}

            <div className="report-options">
                <label htmlFor="reportType">Report Type:</label>
                <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="custom">Custom Date Range</option>
                    <option value="monthly">Monthly Report</option>
                </select>

                {reportType === 'custom' && (
                    <div className="date-inputs">
                        <label htmlFor="startDate">Start Date:</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <label htmlFor="endDate">End Date:</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                )}

                {reportType === 'monthly' && (
                    <div className="month-input">
                        <label htmlFor="month">Select Month:</label>
                        <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                    </div>
                )}

                <label htmlFor="productScope">Product Scope:</label>
                <select id="productScope" value={productScope} onChange={(e) => setProductScope(e.target.value)}>
                    <option value="all">All Products</option>
                    <option value="specific">Specific Product</option>
                </select>

                {productScope === 'specific' && (
                    <div className="product-search-container">
                        <label htmlFor="productName">Product Name:</label>
                        <input
                            type="text"
                            id="productName"
                            placeholder="Type to search product..."
                            value={productName}
                            onChange={handleProductNameChange}
                        />
                        {filteredProductList.length > 0 && (
                            <ul className="product-suggestions">
                                {filteredProductList.map((product) => (
                                    <li
                                        key={product.prod_id}
                                        onClick={() => handleProductSelect(product)}
                                    >
                                        {product.prod_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div className="button-group">
                <button onClick={generateReport} disabled={loading}>Generate Report</button>
                <button onClick={downloadExcel} disabled={reportData.length === 0 || loading}>Download Excel</button>
            </div>

            {reportData.length > 0 && (
                <div className="report-table-container">
                    <table>
                        <thead>
                            <tr>
                                {reportData[0] && Object.keys(reportData[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, index) => (
                                        <td key={index}>{value === null ? '-' : value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Report;