import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
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

const ZoneComponent = ({ selectedCollection }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCollection) {
      fetchData(selectedCollection);
    }
  }, [selectedCollection]);

  const fetchData = async (collection) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/trafic/duration-by-zone/${collection}`);
      setData(response.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
                                                                                                                                                          
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const zones = data.map(item => item.zone || 'Unknown');
      const durations = data.map(item => item.totalDuration || 0).filter(value => !isNaN(value));

      setChartData({
        labels: zones,
        datasets: [
          {
            label: 'Total Duration by Zone',
            data: durations,
            backgroundColor: 'rgba(255, 165, 0, 0.6)', 
            borderColor: 'rgba(255, 165, 0, 1)', 
            borderWidth: 1,
          },
        ],
      });
    } else {
      setChartData({});
    }
  }, [data]);

  return (
    <Container>
      
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <Box>
        {data.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Total Duration by Zone',
                },
              },
              scales: {
                x: {
                  type: 'category',
                  labels: chartData.labels,
                  beginAtZero: true,
                },
                y: {
                  type: 'linear',
                  beginAtZero: true,
                  min: 0,
                  suggestedMax: Math.max(...chartData.datasets[0].data) + 1000,
                },
              },
            }}
          />
        ) : (
          !loading && <Typography>No data available</Typography>
        )}
      </Box>
    </Container>
  );
};

export default ZoneComponent;
