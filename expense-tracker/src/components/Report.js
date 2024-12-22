// Frontend (Report.js)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Report.css'
// import { Bar } from 'react-chartjs-2';

function Report() {
    const [reportData, setReportData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [productTypes, setProductTypes] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const fetchProductTypes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/product-types');
            setProductTypes(response.data);
        } catch (error) {
            console.error("Error fetching product types:", error);
            setError("Error fetching product types. Please try again later.");
        }
    };

    const generateReport = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/report', {
                params: {
                    startDate: startDate,
                    endDate: endDate,
                    typeId: selectedType,
                },
            });
            setReportData(response.data);
            prepareChartData(response.data);
        } catch (error) {
            console.error("Error generating report:", error);
            setError("Error generating report. Please try again later.");
        }
    };

    const prepareChartData = (data) => {
        if (!data || data.length === 0) {
            setChartData(null);
            return;
        }

        const labels = data.map((item) => item.prod_name);
        const quantities = data.map((item) => item.total_quantity);

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Total Quantity Purchased',
                    data: quantities,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue with opacity
                    borderColor: 'rgba(54, 162, 235, 1)', // Blue border
                    borderWidth: 1,
                },
            ],
        });
    };

    return (
        <div>
            <h1>Purchase Report</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div>
                <label htmlFor="startDate">Start Date:</label>
                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                <label htmlFor="endDate">End Date:</label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <label htmlFor="productType">Product Type:</label>
                <select id="productType" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">All Types</option>
                    {productTypes.map((type) => (
                        <option key={type.type_id} value={type.type_id}>
                            {type.type_name}
                        </option>
                    ))}
                </select>
                <button onClick={generateReport}>Generate Report</button>
            </div>

            {/* {chartData && (
                <div>
                    <Bar data={chartData} />
                </div>
            )} */}
            {reportData.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Total Quantity Purchased</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item) => (
                            <tr key={item.prod_id}>
                                <td>{item.prod_name}</td>
                                <td>{item.total_quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Report;