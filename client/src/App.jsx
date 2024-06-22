import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function App() {
  const [combinedData, setCombinedData] = useState(null);
  const [month, setMonth] = useState('January');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCombinedData();
  }, [month, search, page]);

  const fetchCombinedData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/combined-data', {
        params: { month, search, page }
      });
      console.log('Response data:', response.data); // Debug log
      setCombinedData(response.data);
    } catch (error) {
      console.error('Error fetching combined data:', error.message);
    }
  };

  if (!combinedData) {
    return <div className="flex items-center justify-center h-screen"><div className="text-2xl">Loading...</div></div>;
  }

  const barChartData = {
    labels: combinedData.barChartData.map(data => data.range),
    datasets: [{
      label: 'Price Range Count',
      data: combinedData.barChartData.map(data => data.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const pieChartData = {
    labels: Object.keys(combinedData.pieChartData),
    datasets: [{
      data: Object.values(combinedData.pieChartData),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
    }],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Transactions Data</h1>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Month: </label>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border rounded">
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Search: </label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded w-full md:w-1/2" />
      </div>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Page: </label>
        <input type="number" value={page} onChange={(e) => setPage(e.target.value)} className="p-2 border rounded w-16" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-100 rounded shadow">
          <p className="font-semibold">Total Sale Amount:</p>
          <p>{combinedData.statistics.totalSaleAmount}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <p className="font-semibold">Total Sold Items:</p>
          <p>{combinedData.statistics.totalSoldItems}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <p className="font-semibold">Total Not Sold Items:</p>
          <p>{combinedData.statistics.totalNotSoldItems}</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      <table className="table-auto w-full mb-4 border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Date of Sale</th>
            <th className="border p-2">Sold</th>
          </tr>
        </thead>
        <tbody>
          {combinedData.transactions.map(t => (
            <tr key={t._id}>
              <td className="border p-2">{t.title}</td>
              <td className="border p-2">{t.description}</td>
              <td className="border p-2">{t.price}</td>
              <td className="border p-2">{t.category}</td>
              <td className="border p-2">{new Date(t.dateOfSale).toLocaleDateString()}</td>
              <td className="border p-2">{t.sold ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
        <div>
          <h2 className="text-2xl font-bold mb-4">Bar Chart</h2>
          <div className="mb-6">
            <Bar data={barChartData} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Pie Chart</h2>
          <div className="mb-6" style={{ height: '800px' }}>
            <Pie data={pieChartData} />
          </div>
        </div>
      


    </div>
  );
}

export default App;
