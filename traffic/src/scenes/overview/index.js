import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BarChartComponent from 'components/BarChartComponent'; // Assurez-vous du bon chemin
import ZoneComponent from 'components/ZoneComponent';
import TotalDurationComponent from 'components/TotalDurationComponent';

const Overview = () => {
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedMargin, setSelectedMargin] = useState(''); // État pour la marge

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchCountries();
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data/collections');
      setCollections(response.data);
      if (response.data.length > 0) {
        setSelectedCollection(response.data[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des collections:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/trafic/countries/${selectedCollection}`);
      setCountries(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des pays:', error);
    }
  };

  return (
    <div>
      <Box m="1.5rem 2.5rem">
        <FormControl fullWidth>
          <InputLabel id="collection-select-label">Sélectionner une collection</InputLabel>
          <Select
            labelId="collection-select-label"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            {collections.map((collection, index) => (
              <MenuItem key={index} value={collection}>
                {collection}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
       
        <ZoneComponent selectedCollection={selectedCollection} />
        <TotalDurationComponent selectedCollection={selectedCollection}  />
        <BarChartComponent selectedCollection={selectedCollection} />
      </Box>
    </div>
  );
};

export default Overview;
