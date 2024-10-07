import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DureeParMois = ({ selectedCollection, selectedMargin }) => {
  const [countries, setCountries] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (selectedCollection && selectedMargin !== '') {
      fetchCountries();
    }
  }, [selectedCollection, selectedMargin]);

  useEffect(() => {
    if (selectedCountry) {
      fetchOperatorsByCountry(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedOperator) {
      fetchData();
    }
  }, [selectedOperator]);

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/Roaming/Pays/${selectedCollection}/${selectedMargin}`);
      console.log('Countries data:', response.data); // Log countries data
      setCountries(response.data);
      if (response.data.length > 0) {
        setSelectedCountry(response.data[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des pays :', error);
    }
  };

  const fetchOperatorsByCountry = async (country) => {
    try {
      const response = await axios.get(`http://localhost:3000/Roaming/Operators/${selectedCollection}/${selectedMargin}?country=${country}`);
      console.log('Operators data:', response.data); // Log operators data
      setOperators(response.data);
      if (response.data.length > 0) {
        setSelectedOperator(response.data[0]); // Préselectionner le premier opérateur
      } else {
        setSelectedOperator(''); // Réinitialiser l'opérateur s'il n'y en a pas
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des opérateurs :', error);
    }
  };

  const fetchData = async () => {
    try {
      if (!selectedOperator) {
        console.error('Veuillez sélectionner un opérateur.');
        setChartData({});
        return;
      }

      const url = `http://localhost:3000/Roaming/OperatorData/${selectedCountry}/${selectedCollection}?margin=${selectedMargin}&operator=${selectedOperator}`;

      const response = await axios.get(url);
      console.log('Response data:', response.data); // Log response data

      if (!response.data || response.data.length === 0) {
        console.error('Aucune donnée disponible.');
        setChartData({});
        return;
      }

      // Process the data
      const newFormattedData = response.data.flatMap(item =>
        item.monthlyData?.map(dataPoint => ({
          operator: item._id,
          month: dataPoint.month,
          totalDifference: dataPoint.totalDifference || 0,
        })) || []
      );

      console.log('Formatted data:', newFormattedData); // Log formatted data

      if (newFormattedData.length === 0) {
        console.error('Les données formatées sont vides.');
        setChartData({});
        return;
      }

      newFormattedData.sort((a, b) => a.month.localeCompare(b.month));

      const labels = [...new Set(newFormattedData.map(data => data.month))];

      // Define datasets inside fetchData
      const datasets = [
        {
          label: `${selectedOperator} - Total Difference`,
          data: labels.map(month => {
            const entry = newFormattedData.find(d => d.operator === selectedOperator && d.month === month);
            console.log(`Total Difference for ${month}:`, entry ? entry.totalDifference : 0); // Log total difference
            return entry ? entry.totalDifference : 0;
          }),
          borderColor: getRandomColor(),
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderDash: [5, 5],
          yAxisID: 'y1',
        }
      ];

      setChartData({
        labels: labels.map(formatMonth),
        datasets: datasets,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  const getTooltipLabel = (tooltipItem) => {
    const datasetLabel = tooltipItem.dataset.label || '';
    const value = tooltipItem.raw || 0;
    return `${datasetLabel}: ${value}`;
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const formatMonth = (month) => {
    const year = month.substring(0, 4);
    const monthNum = month.substring(4, 6);
    const date = new Date(year, monthNum - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel>Pays</InputLabel>
        <Select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {countries.map(country => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Opérateur</InputLabel>
        <Select
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
          disabled={!selectedCountry || operators.length === 0}
        >
          {operators.map(operator => (
            <MenuItem key={operator} value={operator}>
              {operator}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {chartData.labels && chartData.labels.length > 0 ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => getTooltipLabel(tooltipItem),
                },
              },
            },
            scales: {
              x: {
                type: 'category',
                title: {
                  display: true,
                  text: 'Mois',
                },
              },
              y1: {
                type: 'linear',
                title: {
                  display: true,
                  text: 'Total Difference',
                },
                beginAtZero: true,
                position: 'left',
                grid: {
                  drawOnChartArea: false,
                },
                suggestedMin: Math.min(...(chartData.datasets?.find(dataset => dataset.yAxisID === 'y1')?.data || [0])),
                suggestedMax: Math.max(...(chartData.datasets?.find(dataset => dataset.yAxisID === 'y1')?.data || [0])),
              },
            },
          }}
        />
      ) : (
        <p>Aucune donnée disponible</p>
      )}
    </Box>
  );
};

export default DureeParMois;
