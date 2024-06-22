const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  dateOfSale: Date,
  sold: Boolean
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.post('/initialize-database', async (req, res) => {
  try {
    const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);
    res.status(200).send('Database initialized with seed data.');
  } catch (error) {
    res.status(500).send('Error initializing database.');
  }
});

app.get('/transactions', async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  const regex = new RegExp(search, 'i');

  try {
    const query = {
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
      $or: [
        { title: regex },
        { description: regex },
        { price: parseFloat(search) || 0 }
      ]
    };

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions.');
  }
});

app.get('/transaction-statistics', async (req, res) => {
  const { month } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1; 
  try {
    const transactions = await Transaction.find({
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] }
    });

    const totalSaleAmount = transactions.reduce((acc, t) => acc + t.price, 0);
    const totalSoldItems = transactions.filter(t => t.sold).length;
    const totalNotSoldItems = transactions.filter(t => !t.sold).length;

    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    res.status(500).send(`Error fetching transaction statistics: ${error.message}`);
  }
});

app.get('/bar-chart-data', async (req, res) => {
  const { month } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();

  try {
    const transactions = await Transaction.find({
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] }
    });

    const priceRanges = [
      { range: '0-100', count: 0 },
      { range: '101-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '301-400', count: 0 },
      { range: '401-500', count: 0 },
      { range: '501-600', count: 0 },
      { range: '601-700', count: 0 },
      { range: '701-800', count: 0 },
      { range: '801-900', count: 0 },
      { range: '901-above', count: 0 }
    ];

    transactions.forEach(t => {
      if (t.price <= 100) priceRanges[0].count++;
      else if (t.price <= 200) priceRanges[1].count++;
      else if (t.price <= 300) priceRanges[2].count++;
      else if (t.price <= 400) priceRanges[3].count++;
      else if (t.price <= 500) priceRanges[4].count++;
      else if (t.price <= 600) priceRanges[5].count++;
      else if (t.price <= 700) priceRanges[6].count++;
      else if (t.price <= 800) priceRanges[7].count++;
      else if (t.price <= 900) priceRanges[8].count++;
      else priceRanges[9].count++;
    });

    res.status(200).json(priceRanges);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data.');
  }
});

app.get('/pie-chart-data', async (req, res) => {
  const { month } = req.query;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();

  try {
    const transactions = await Transaction.find({
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] }
    });

    const categoryCount = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json(categoryCount);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data.');
  }
});

app.get('/combined-data', async (req, res) => {
  const { month, search = '', page = 1 } = req.query;
  const limit = 10; // number of results per page
  const skip = (page - 1) * limit;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();

  const regex = new RegExp(search, 'i');

  const query = {
    $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
    $or: [
      { title: regex },
      { description: regex },
      { category: regex }
    ]
  };

  try {
    const transactions = await Transaction.find(query).skip(skip).limit(limit);
    const totalTransactions = await Transaction.countDocuments(query);

    const totalSaleAmount = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]).then(res => res[0] ? res[0].total : 0);

    const totalSoldItems = await Transaction.countDocuments({ ...query, sold: true });
    const totalNotSoldItems = await Transaction.countDocuments({ ...query, sold: false });

    const statistics = {
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems
    };

    const barChartData = await axios.get(`http://localhost:3000/bar-chart-data?month=${month}`);
    const pieChartData = await axios.get(`http://localhost:3000/pie-chart-data?month=${month}`);

    res.json({
      transactions,
      statistics,
      barChartData: barChartData.data,
      pieChartData: pieChartData.data,
      total: totalTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching combined data', error });
  }
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
