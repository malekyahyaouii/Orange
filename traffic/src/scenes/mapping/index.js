import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, FormControl, InputLabel, Select, MenuItem, Grid, Button, Typography, TextField, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Papa from 'papaparse';

// Function to format the operator's name (replacing spaces with hyphens)
const formatOperator = (operator) => operator ? operator.replace(/\s+/g, '-') : '';

// Function to generate and download the CSV file
const downloadCSV = (data) => {
  const formattedData = data.map(item => ({
    'Pays': item.pays || '',
    'Opérateur': formatOperator(item.operateur || ''),
    'Zone': item.zone || '',
  }));

  const csv = Papa.unparse(formattedData, {
    fields: ['Pays', 'Opérateur', 'Zone'],
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'data.csv');
  link.click();
};

const Mapping = () => {
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [isFileValid, setIsFileValid] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    axios.get('/Mapping/collections')
      .then(response => setCollections(response.data))
      .catch(error => console.error('Error fetching collections:', error));
  }, []);

  useEffect(() => {
    if (collection) {
      axios.get(`/Mapping/zones/${collection}`)
        .then(response => setZones(response.data))
        .catch(error => console.error('Error fetching zones:', error));
    }
  }, [collection]);

  useEffect(() => {
    if (selectedZone) {
      axios.get(`/Mapping/countries-by-zone/${collection}/${selectedZone}`)
        .then(response => setCountries(response.data))
        .catch(error => console.error('Error fetching countries:', error));
    } else {
      setCountries([]);
    }
  }, [collection, selectedZone]);

  useEffect(() => {
    if (collection) {
      axios.get(`/Mapping/selected-fields/${collection}`, {
        params: {
          zone: selectedZone || undefined,
          country: selectedCountry || undefined,
        }
      })
        .then(response => {
          const data = response.data;

          // Log data to debug
          console.log('Data received from server:', data);

          // Add unique id to each row
          const uniqueData = data.map((item, index) => ({
            id: item._id || index, // Fallback to index if _id is not present
            pays: item.pays || '',
            operateur: item.operateur || '',
            zone: item.zone || ''
          }));

          setData(uniqueData);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [collection, selectedZone, selectedCountry]);

  const validateFile = (file) => {
    if (!file) return false;

    // Perform your validation here
    const validExtensions = ['csv'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      return false;
    }

    // Additional validation logic (e.g., checking file content) can go here

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsFileValid(validateFile(selectedFile));
  };

  const handleUpload = () => {
    if (!file) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner un fichier.', severity: 'warning' });
      return;
    }
  
    if (!isFileValid) {
      setSnackbar({ open: true, message: 'Le fichier sélectionné est invalide.', severity: 'warning' });
      return;
    }
  
    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('collectionName', collection); // Ajouter le nom de la collection
  
    axios.post(`/uploadall/${collection}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log('File upload response:', response.data);
        setSnackbar({ open: true, message: 'Fichier importé et données mises à jour avec succès.', severity: 'success' });
        setFile(null); // Clear the file input
        setIsFileValid(false); // Reset file validation
      })
      .catch(error => {
        console.error('Error uploading file:', error.response?.data || error.message);
        setSnackbar({ open: true, message: 'Erreur lors de l\'importation du fichier. ' + (error.response?.data.message || error.message), severity: 'error' });
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Determine if zones or countries are available
  const areZonesAvailable = zones.length > 0;
  const areCountriesAvailable = countries.length > 0;

  return (
    <Box m='1.5rem 2.5rem'>
      <Typography variant="h1" gutterBottom color="secondary">Mappage</Typography>
      <Box display="flex" justifyContent="flex-end">
  <Button onClick={() => downloadCSV(data)} variant="contained" color="secondary">
    Export to CSV
  </Button>
</Box>
      <FormControl fullWidth margin="normal">
        <InputLabel id="collection-select-label">Sélectionner une collection</InputLabel>
        <Select
          labelId="collection-select-label"
          value={collection}
          onChange={(e) => {
            setCollection(e.target.value);
            setSelectedZone('');
            setSelectedCountry('');
            setData([]);
            setZones([]);
            setCountries([]);
          }}
          displayEmpty
        >
          <MenuItem value="" disabled>Sélectionner une collection</MenuItem>
          {collections.map((col, index) => (
            <MenuItem key={index} value={col}>{col}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="zone-select-label">Sélectionner une zone</InputLabel>
            <Select
              labelId="zone-select-label"
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                setSelectedCountry('');
              }}
              displayEmpty
            >
              <MenuItem value="">Tous les zones</MenuItem>
              {areZonesAvailable ? (
                zones.map((zone, index) => (
                  <MenuItem key={index} value={zone}>{zone}</MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>Aucune zone disponible</MenuItem>
              )}
            </Select>
          </FormControl>
         
       
      

        </Grid>
      </Grid>

      <Box mt={4}>
        <DataGrid
          rows={data}
          columns={[
            { field: 'pays', headerName: 'Pays', width: 200 },
            { field: 'operateur', headerName: 'Opérateur', width: 200 },
            { field: 'zone', headerName: 'Zone', width: 200 },
          ]}
          pageSize={10}
          autoHeight
          getRowId={(row) => row.id} // Ensure unique `id` is used
        />
      </Box>

     
     
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Mapping;
