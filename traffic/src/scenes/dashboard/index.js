import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, useTheme, useMediaQuery, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DownloadOutlined } from '@mui/icons-material';
import axios from 'axios';
import FlexBetween from 'components/FlexBetween';
import Header from 'components/Header';
import { DataGrid } from '@mui/x-data-grid';

const Dashboard = () => {
  const theme = useTheme();
  const isNonMediumScreens = useMediaQuery('(min-width: 1200px)');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchData(selectedCollection);
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data/collections');
      setCollections(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des collections:', error);
    }
  };

  const fetchData = async (collection) => {
    try {
      const response = await axios.get(`http://localhost:3000/data/getAll?collection=${collection}`);
      console.log('Données récupérées:', response.data);

      if (Array.isArray(response.data) && response.data.length > 0) {
        const dataWithId = response.data.map(item => ({ ...item, id: item._id }));
        setData(dataWithId);

        const keys = Object.keys(response.data[0]);
        const cols = keys.map(key => ({
          field: key,
          headerName: key,
          width: 150,
        }));
        setColumns(cols);
      } else {
        setData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('Fichier sélectionné:', file);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await axios.post('http://localhost:3000/data/uploadall', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Réponse:', response.data);
      fetchCollections(); // Rafraîchir les collections après le téléchargement
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
    }
  };

  return (
    <Box m='1.5rem 2.5rem'>
      <FlexBetween>
        <Header title='DASHBOARD' subtitle='Bienvenue !' />
        <Box>
          <Button
            component="label"
            sx={{
              backgroundColor: theme.palette.secondary.light,
              color: theme.palette.background.alt,
              fontSize: '14px',
              fontWeight: 'bold',
              padding: '10px 20px',
            }}
          >
            <DownloadOutlined sx={{ mr: '10px' }} />
            Importer un fichier en CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileUpload } 
            />
          </Button>
        </Box>
      </FlexBetween>

      <Box mt={2}>
        <FormControl fullWidth>
          <InputLabel id="collection-select-label">Sélectionner une collection</InputLabel>
          <Select
            labelId="collection-select-label"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            {collections.map((collection, index) => (
              <MenuItem key={index} value={collection}>{collection}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box mt={2} height={400} sx={{ width: '100%' }}>
        {console.log('Données pour le DataGrid:', data)}
        {console.log('Colonnes pour le DataGrid:', columns)}
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
