import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, FormControl, InputLabel, Select, MenuItem, Grid, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

const BarChartComponent = ({ selectedCollection }) => {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);

  // Fetch zones based on selected collection
  useEffect(() => {
    if (selectedCollection) {
      axios.get(`/trafic/zones/${selectedCollection}`)
        .then(response => {
          console.log('Zones:', response.data); // Debugging zones
          setZones(response.data);
        })
        .catch(error => console.error('Error fetching zones:', error));
    }
  }, [selectedCollection]);

  // Fetch countries based on selected zone
  useEffect(() => {
    if (selectedCollection && selectedZone) {
      axios.get(`/trafic/countries-by-zone/${selectedCollection}/${selectedZone}`)
        .then(response => {
          console.log('Countries:', response.data); // Debugging countries
          setCountries(response.data);
        })
        .catch(error => console.error('Error fetching countries:', error));
    } else {
      setCountries([]);
    }
  }, [selectedCollection, selectedZone]);

  // Fetch operators based on selected country
  useEffect(() => {
    if (selectedCollection && selectedCountry) {
      axios.get(`/trafic/operators/${selectedCollection}/${selectedCountry}`)
        .then(response => {
          console.log('Operators:', response.data); // Debugging operators
          setOperators(response.data);
        })
        .catch(error => console.error('Error fetching operators:', error));
    } else {
      setOperators([]);
    }
  }, [selectedCollection, selectedCountry]);

  // Fetch bar chart data based on selected country and operator
  useEffect(() => {
    if (selectedCollection && selectedCountry) {
      const endpoint = selectedOperator 
        ? `/trafic/duration-by-operator/${selectedCollection}/${selectedCountry}/${selectedOperator}`
        : `/trafic/duration-by-operator/${selectedCollection}/${selectedCountry}`;
      
      axios.get(endpoint)
        .then(response => {
          console.log('Bar Chart Data:', response.data); // Debugging bar chart data
          const formattedData = response.data.map(item => ({
            Opérateur: item._id || 'Unknown',
            totalDuration: item.totalDuration || 0
          }));
          setBarData(formattedData);
        })
        .catch(error => console.error('Error fetching bar chart data:', error));
    } else {
      setBarData([]);
    }
  }, [selectedCollection, selectedCountry, selectedOperator]);

  // Fetch line chart data based on selected operator
  useEffect(() => {
    if (selectedCollection && selectedCountry && selectedOperator) {
      axios.get(`/trafic/duration-by-operator-month/${selectedCollection}/${selectedCountry}/${selectedOperator}`)
        .then(response => {
          console.log('Line Chart Data:', response.data); // Debugging line chart data
          const formattedData = response.data.map(item => ({
            x: item.Mois,
            y: item.totalDuration
          }));
          setLineData(formattedData);
        })
        .catch(error => console.error('Error fetching line chart data:', error));
    } else {
      setLineData([]);
    }
  }, [selectedCollection, selectedCountry, selectedOperator]);

  const barChartTitle = selectedCountry
    ? `Durée totale des opérateurs pour ${selectedCountry}`
    : 'Durée totale des opérateurs';

  return (
    <Box m='1.5rem 2.5rem'>
      <Grid container spacing={2} mt={2}>
        {/* Zone Selection */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="zone-select-label">Zone</InputLabel>
            <Select
              labelId="zone-select-label"
              value={selectedZone}
              onChange={(e) => {
                console.log('Selected Zone:', e.target.value); // Debugging selected zone
                setSelectedZone(e.target.value);
                setSelectedCountry('');
                setSelectedOperator('');
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Zone</MenuItem>
              {zones.map((zone, index) => (
                <MenuItem key={index} value={zone}>{zone}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Country Selection */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="country-select-label">Pays</InputLabel>
            <Select
              labelId="country-select-label"
              value={selectedCountry}
              onChange={(e) => {
                console.log('Selected Country:', e.target.value); // Debugging selected country
                setSelectedCountry(e.target.value);
                setSelectedOperator('');
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Pays</MenuItem>
              {countries.length === 0 && <MenuItem value="" disabled>Aucun pays disponible</MenuItem>}
              {countries.map((country, index) => (
                <MenuItem key={index} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Operator Selection */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="operator-select-label">Opérateur</InputLabel>
            <Select
              labelId="operator-select-label"
              value={selectedOperator}
              onChange={(e) => {
                console.log('Selected Operator:', e.target.value); // Debugging selected operator
                setSelectedOperator(e.target.value);
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Opérateur</MenuItem>
              {operators.length === 0 && <MenuItem value="" disabled>Aucun opérateur disponible</MenuItem>}
              {operators.map((operator, index) => (
                <MenuItem key={index} value={operator}>{operator}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Box mt={4}>
        <Typography variant="h4" gutterBottom color="secondary">
          {barChartTitle}
        </Typography>
        <BarChart width={1150} height={500} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Opérateur" tick={{ textAnchor: 'end' }} interval={0} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalDuration" fill="#8884d8" />
        </BarChart>
      </Box>

      {/* Line Chart */}
      {selectedOperator && (
        <Box mt={4}>
          <Typography variant="h4" gutterBottom color="secondary">
            Durée totale par mois pour {selectedCountry} - {selectedOperator}
          </Typography>
          <LineChart width={800} height={400} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#82ca9d" />
          </LineChart>
        </Box>
      )}
    </Box>
  );
};

export default BarChartComponent;
