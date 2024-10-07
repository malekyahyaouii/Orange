import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RoamingComponent = ({ selectedCollection, selectedMargin }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (selectedCollection && selectedMargin !== '') {
      fetchData(selectedCollection, selectedMargin);
    }
  }, [selectedCollection, selectedMargin]);

  const fetchData = async (collection, margin) => {
    try {
      const response = await axios.get('http://localhost:3000/Roaming/filtre', {
        params: { collection, margin }
      });
      console.log('API Response:', response.data);
      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const countries = data.map(item => item.Pays || ''); // Use 'Pays' for labels
      const differences = data.map(item => item.totalDifference || 0);
      const durations = data.map(item => item.totalDuration || 0); // Add durations

      setChartData({
        labels: countries,
        datasets: [
          {
            label: 'Total Difference',
            data: differences,
            backgroundColor: 'rgba(255, 165, 0, 0.6)', // Orange with 60% opacity
            borderColor: 'rgba(255, 165, 0, 1)', // Solid Orange
            borderWidth: 1,
          },
        ],
      });
    } else {
      setChartData({});
    }
  }, [data]);

  return (
    <div>
      {data.length > 0 ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Top 20 Countries by Total Difference',
              },
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    const dataIndex = tooltipItem.dataIndex;
                    const totalDifference = data[dataIndex]?.totalDifference || 0;
                    const totalDuration = data[dataIndex]?.totalDuration || 0;
                    return [
                      `Country: ${tooltipItem.label}`,
                      `Total Difference: ${totalDifference}`,
                      `Total Duration: ${totalDuration}`
                    ];
                  }
                }
              }
            },
            scales: {
              x: { type: 'category', beginAtZero: true },
              y: { type: 'linear', beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default RoamingComponent;
