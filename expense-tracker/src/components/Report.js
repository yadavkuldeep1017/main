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
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/products`);
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
            const response = await axios.get(`${backendUrl}/api/reports`, { params });
            // const formattedData = response.data.map((row) => {
            //     let totalPrice;
            //     if (row.total_amount) {
            //         totalPrice = row.total_amount;
            //     } else if (row.total_price) {
            //         totalPrice = row.total_price;
            //     } else {
            //         totalPrice = row.price * row.quantity;
            //     }
            //     return { ...row, totalPrice };
            // });
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
            const response = await axios.get(`${backendUrl}/api/reports`, {
                params,
                responseType: 'blob',
            });

            if (response.status === 200) {
                const contentDisposition = response.headers['content-disposition'];
                let filename = 'report.xlsx';

                if (contentDisposition) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const blob = new Blob([response.data], {
                    type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const totalPriceSum = reportData.reduce((sum, item) => sum + item.Amount, 0);
                console.log('Total sum:- ', totalPriceSum);
                const ws = XLSX.utils.json_to_sheet(reportData);
                XLSX.utils.sheet_add_aoa(ws, [["Total Price Sum:", totalPriceSum]], { origin: "A" + (reportData.length + 2) });
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Report');
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                FileSaver.saveAs(data, filename);
            } else {
                console.error('Download failed with status:', response.status);
                setError(`Download failed with status: ${response.status}`);
            }
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

    const productOptions = productList.map((product) => ({
        value: product.prod_id,
        label: product.prod_name,
    }));

    return (
        <div className="report-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Add New Product</h1> {/* Changed title */}
                    <div className="header-actions">
                        <Link to="/admin-dashboard" className="header-link">Add New Purchase</Link> {/* Home link */}
                        <Link to="/purchases" className="header-link">Purchases</Link>
                        <Link to="/add-product" className="header-link">Add New Product</Link>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
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
                                <tr>
                                    <td colSpan={Object.keys(reportData[0]).length - 1} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Price Sum:</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {reportData.reduce((sum, item) => sum + Number(item.Amount), 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Report;