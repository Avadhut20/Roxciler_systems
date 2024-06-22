# Roxciler Systems

Roxciler Systems is a web application designed to manage transaction data and provide insightful analytics through interactive charts. It leverages MongoDB for data storage and Express.js for the backend API, while the frontend is built with React and utilizes Chart.js for visualizations.

## Features

- **Transaction Management**: CRUD operations for managing transaction data.
- **Analytics**: Provides statistical insights and visual representations of transaction data.
- **Filtering and Pagination**: Allows users to filter transactions by month, search keywords, and paginate results.
- **Interactive Charts**: Displays transaction data using dynamic bar and pie charts.

## Technologies Used

- **Frontend**: React, React Chart.js 2
- **Backend**: Node.js, Express.js, MongoDB
- **Data Visualization**: Chart.js
- **External Services**: Axios for HTTP requests

## Setup

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Avadhut20/Roxciler_systems.git
   cd Roxciler_systems
  

2. **Install dependencies:**
    ```bash
    npm install

    
3. **Setup MongoDb:**
Ensure MongoDB is installed and running locally or provide a MongoDB Atlas URI in index.js.

4. **Start frontend**
    ```bash
    cd client
    npm install
    npm start
    
5. **Access the application:**
Open your browser and go to http://localhost:3000 to view the application.    


## API Endpoints
1. **GET /transactions:** Retrieves transactions based on specified filters.
2. **GET /transaction-statistics:** Retrieves statistics for transactions.
3. **GET /bar-chart-data:** Retrieves data for generating a bar chart.
4. **GET /pie-chart-data:**Retrieves data for generating a pie chart.
5. **GET /combined-data:** Retrieves combined data including transactions, statistics, bar chart data, and pie chart data.