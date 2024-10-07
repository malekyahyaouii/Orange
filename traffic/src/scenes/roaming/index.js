import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import MarginFilterComponent from 'components/MarginFilterComponent';
import RoamingComponent from 'components/RoamingComponent';
import DureeParMois from 'components/DureeParMois';
import axios from 'axios';

const Roaming = () => {
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedMargin, setSelectedMargin] = useState('');
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    fetchCollections();
  }, []);

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

  return (
    <Box m="1.5rem 2.5rem">
      <FormControl fullWidth sx={{ mb: 2 }}>
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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="margin-select-label">Sélectionner une marge</InputLabel>
        <Select
          labelId="margin-select-label"
          value={selectedMargin}
          onChange={(e) => setSelectedMargin(e.target.value)}
        >
          <MenuItem value={0}>Marge 0</MenuItem>
          <MenuItem value={1}>Marge 1</MenuItem>
        </Select>
      </FormControl>

      <MarginFilterComponent selectedCollection={selectedCollection} selectedMargin={selectedMargin} />
      <RoamingComponent selectedCollection={selectedCollection} selectedMargin={selectedMargin} />
      <DureeParMois selectedCollection={selectedCollection} selectedMargin={selectedMargin} />
    </Box>
  );
};

export default Roaming;
