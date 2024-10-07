import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

const MarginFilterComponent = ({ selectedCollection, selectedMargin }) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (selectedCollection && selectedMargin !== '') {
      fetchData(selectedCollection, selectedMargin);
    }
  }, [selectedCollection, selectedMargin]);

  const fetchData = async (collection, margin) => {
    try {
      const response = await axios.get('http://localhost:3000/Roaming/by-margin', {
        params: { collection, margin }
      });
      console.log('Données récupérées:', response.data);

      if (Array.isArray(response.data)) {
        const dataWithId = response.data.map(item => ({
          ...item,
          id: item._id,
          'prix_unitaireTN': item['prix_unitaireTN'],
          'retail_price': item['retail_price'],
          'Difference': item['Difference'],
          'Mois': item['Mois'],
          'jour' : item['jour']
        }));
        setData(dataWithId);

        const cols = [
          { field: 'Pays', headerName: 'Pays', width: 150 },
          { field: 'Opérateur', headerName: 'Opérateur', width: 150 },
          { field: 'prix_unitaireTN', headerName: 'Prix Unitaire TN', width: 150 },
          { field: 'retail_price', headerName: 'Retail Price', width: 150 },
          { field: 'Difference', headerName: 'Différence', width: 150 },
          { field: 'Mois', headerName: 'Mois', width: 150 },
          { field: 'jour', headerName: 'Jour', width: 150 },
        ];
        setColumns(cols);
      } else {
        setData([]);
        setColumns([]);
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setData([]);
      setColumns([]);
    }
  };

  return (
    <Box mt={2}>
      <Box mt={1}>
        <Typography
          variant="h6"
          color={selectedMargin === 0 ? 'green' : selectedMargin === 1 ? 'red' : 'inherit'}
        >
          {selectedMargin === 0
            ? 'Opérateurs avec un bénéfice'
            : selectedMargin === 1
            ? 'Opérateurs avec une perte'
            : ''}
        </Typography>
      </Box>

      <Box mt={2} height={400} sx={{ width: '100%' }}>
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

export default MarginFilterComponent;
