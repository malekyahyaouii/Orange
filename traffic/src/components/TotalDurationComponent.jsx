import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Container, Box, Typography, TextField, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';

// Register the necessary components from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TotalDurationComponent = ({ selectedCollection, selectedMargin }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [filterType, setFilterType] = useState('top'); // Filter type: 'top', 'lowest', or 'between'
  const [filterValue, setFilterValue] = useState(20); // For 'top' and 'lowest'
  const [minDuration, setMinDuration] = useState(0); // For 'between'
  const [maxDuration, setMaxDuration] = useState(3000000); // Adjusted to max duration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCollection && selectedMargin !== '') {
      fetchData(selectedCollection, selectedMargin);
    }
  }, [selectedCollection, selectedMargin, filterType, filterValue, minDuration, maxDuration]);

  const fetchData = async (collection, margin) => {
    setLoading(true);
    setError(null);
    try {
      const params = { collection, margin };

      // Configure parameters based on filter type
      if (filterType === 'top' || filterType === 'lowest') {
        params.topCount = filterValue;
        params.filterType = filterType;
      } else if (filterType === 'between') {
        params.minDuration = parseFloat(minDuration); // Convert to float
        params.maxDuration = parseFloat(maxDuration); // Convert to float
        params.filterType = filterType;
      }

      console.log('Fetching data with params:', params); // Debugging line
      const response = await axios.get('http://localhost:3000/trafic/filtre', { params });
      console.log('API Response:', response.data);

      if (Array.isArray(response.data)) {
        let filteredData = response.data;

        // Apply client-side filtering
        if (filterType === 'between') {
          filteredData = filteredData.filter(item =>
            parseFloat(item.totalDuration) >= minDuration && parseFloat(item.totalDuration) <= maxDuration
          );
        }

        console.log('Filtered Data:', filteredData); // Debugging line
        setData(filteredData);
      } else {
        setData([]);
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      setError('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const countries = data.map(item => item.Pays || '');  // Ensure 'Pays' is correct
      const durations = data.map(item => item.totalDuration || 0).filter(value => !isNaN(value));

      console.log('Chart Data:', { labels: countries, data: durations }); // Debugging line

      setChartData({
        labels: countries,
        datasets: [
          {
            label: 'Total Duration',
            data: durations,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
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
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter Type"
            >
              <MenuItem value="top">Top</MenuItem>
              <MenuItem value="lowest">Lowest</MenuItem>
              <MenuItem value="between">Between</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {filterType === 'top' || filterType === 'lowest' ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Number of Countries"
              type="number"
              variant="outlined"
              value={filterValue}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  setFilterValue(value);
                }
              }}
              fullWidth
            />
          </Box>
        ) : filterType === 'between' ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Min Duration"
              type="number"
              variant="outlined"
              value={minDuration}
              onChange={(e) => {
                const value = parseFloat(e.target.value); 
                if (!isNaN(value)) {
                  setMinDuration(value);
                }
              }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Max Duration"
              type="number"
              variant="outlined"
              value={maxDuration}
              onChange={(e) => {
                const value = parseFloat(e.target.value); 
                if (!isNaN(value)) {
                  setMaxDuration(value);
                }
              }}
              fullWidth
            />
          </Box>
        ) : null}
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ width: '1000px', height: '500px' }}>
        {data.length > 0 ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: filterType === 'between'
                    ? `Countries with Duration Between ${minDuration} and ${maxDuration}`
                    : 'Top Countries by Total Duration',
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
                  min: minDuration > 0 ? minDuration : 0,
                  max: maxDuration,
                  suggestedMax: maxDuration,
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

export default TotalDurationComponent;
