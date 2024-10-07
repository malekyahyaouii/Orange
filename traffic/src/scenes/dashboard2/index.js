import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import { Select, MenuItem, CircularProgress, FormControl, InputLabel } from '@mui/material';

const Dashboard2 = () => {
  const theme = useTheme();
  const [collections, setCollections] = useState([]);
  const [countries, setCountries] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedMargin, setSelectedMargin] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [lineChartData, setLineChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection && selectedMargin) {
      fetchCountriesAndOperators();
    }
  }, [selectedCollection, selectedMargin]);

  useEffect(() => {
    if (selectedCountry && selectedOperator) {
      fetchLineChartData();
    }
  }, [selectedCountry, selectedOperator]);

  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data/collections');
      setCollections(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des collections:', error);
    }
  };

  const fetchCountriesAndOperators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/trafic/PaysOperateurs/${selectedCollection}?margin=${selectedMargin}`);
      const data = response.data;
      console.log('Countries and operators data:', data); // Pour débogage
      setCountries(data.map(item => item._id));
      setOperators(data.flatMap(item => item.operateurs));
    } catch (error) {
      console.error('Erreur lors de la récupération des pays et opérateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLineChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/trafic/LineChartData/${selectedCollection}/${selectedCountry}/${selectedOperator}?margin=${selectedMargin}`);
      setLineChartData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données du graphique linéaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: lineChartData.map(item => item.Mois),
    datasets: [
      {
        label: 'Total Durée',
        data: lineChartData.map(item => item.totaldurée),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        fill: false,
      },
    ],
  };

  return (
    <div>
      <FormControl fullWidth margin="normal">
        <InputLabel>Collection</InputLabel>
        <Select
          value={selectedCollection}
          onChange={e => setSelectedCollection(e.target.value)}
        >
          {collections.map(collection => (
            <MenuItem key={collection} value={collection}>{collection}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Margin</InputLabel>
        <Select
          value={selectedMargin}
          onChange={e => setSelectedMargin(e.target.value)}
        >
          <MenuItem value={0}>Margin 0</MenuItem>
          <MenuItem value={1}>Margin 1</MenuItem>
        </Select>
      </FormControl>

      {loading && <CircularProgress />}

      <FormControl fullWidth margin="normal">
        <InputLabel>Country</InputLabel>
        <Select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
        >
          {countries.length === 0 ? (
            <MenuItem value="">Aucun pays disponible</MenuItem>
          ) : (
            countries.map(country => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Operator</InputLabel>
        <Select
          value={selectedOperator}
          onChange={e => setSelectedOperator(e.target.value)}
        >
          {operators.length === 0 ? (
            <MenuItem value="">Aucun opérateur disponible</MenuItem>
          ) : (
            operators.map(operator => (
              <MenuItem key={operator} value={operator}>{operator}</MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <div style={{ marginTop: '20px' }}>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default Dashboard2;
