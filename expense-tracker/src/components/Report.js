import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import '../css/Report.css';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';

function Report() {
    const [reportType, setReportType] = useState('custom');
    const [productScope, setProductScope] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [month, setMonth] = useState('');
    const [productList, setProductList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setProductList(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Error fetching product list.");
            }
        };

        fetchProducts();
    }, []);

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
            if (!selectedProduct) {
                setError("Please select a product name.");
                setLoading(false);
                return;
            }
            params.productName = selectedProduct.label; // Send product name
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
            if (!selectedProduct) {
                setError("Please select a product name.");
                setLoading(false);
                return;
            }
            params.productName = selectedProduct.label;
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
            await axios.get('http://localhost:5000/logout');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('username');
            navigate('/', { replace: true });
        } catch (err) {
            console.error("Error logging out:", err);
            setError("An error occurred during logout.");
        }
    };

    const productOptions = productList.map((product) => ({
        value: product.prod_id,
        label: product.prod_name,
    }));

    return (
        <div className="report-container">
            <header className="App-header">
                <h1>Purchase Tracker</h1>
                <div className="top-right-buttons">
                    <Link to="/add-product">
                        <button className="header-button">Add Product</button>
                    </Link>
                    <Link to="/admin-dashboard">
                        <button className="header-button">Home</button>
                    </Link>
                    <button onClick={handleLogout} className="header-button">Logout</button>
                </div>
            </header>
            <main>
                <h2>Generate Report</h2>
                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-message">Loading...</div>}

                <div className="report-options-container">
                    <div className="report-option">
                        <label htmlFor="reportType">Report Type:</label>
                        <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                            <option value="custom">Custom Date Range</option>
                            <option value="monthly">Monthly Report</option>
                        </select>
                    </div>

                    {reportType === 'custom' && (
                        <div className="report-option date-inputs">
                            <label htmlFor="startDate">Start Date:</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            <label htmlFor="endDate">End Date:</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    )}

                    {reportType === 'monthly' && (
                        <div className="report-option">
                            <label htmlFor="month">Select Month:</label>
                            <input type="month" id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                        </div>
                    )}

                    <div className="report-option">
                        <label htmlFor="productScope">Product Scope:</label>
                        <select id="productScope" value={productScope} onChange={(e) => setProductScope(e.target.value)}>
                            <option value="all">All Products</option>
                            <option value="specific">Specific Product</option>
                        </select>
                    </div>

                    {productScope === 'specific' && (
                        <div className="report-option product-search-container">
                            <label htmlFor="productName">Product Name:</label>
                            <Select
                                value={selectedProduct}
                                onChange={setSelectedProduct}
                                options={productOptions}
                                isSearchable
                                placeholder="Search and select a product..."
                                id="productName"
                                isClearable
                            />
                        </div>
                    )}
                </div>

                <div className="button-group">
                    <button onClick={generateReport} disabled={loading} className="generate-button">Generate Report</button>
                    <button onClick={downloadExcel} disabled={reportData.length === 0 || loading} className="download-button">Download Excel</button>
                </div>

                {reportData.length > 0 && (
                    <div className="report-table-container">
                        <table className="report-table">
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
            </main>
        </div>
    );
}

export default Report;