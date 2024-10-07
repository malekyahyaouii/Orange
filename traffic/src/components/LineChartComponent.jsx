import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, FormControl, InputLabel, Select, MenuItem, Grid, TextField, CircularProgress, Typography } from '@mui/material';
import Linechart from './Linechart'; 

const LineChartComponent = ({ selectedCollection }) => { 
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [monthStart, setMonthStart] = useState('');
  const [monthEnd, setMonthEnd] = useState('');
  const [topCount, setTopCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data based on selected filters
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Validation des paramètres de mois au format YYYYMM
      if (!/^\d{6}$/.test(monthStart) || !/^\d{6}$/.test(monthEnd)) {
        throw new Error('Le format des mois est invalide. Il doit être YYYYMM.');
      }

      const response = await axios.get(`/trafic/filtered-duration/${selectedCollection}`, {
        params: {
          startMonth: monthStart,
          endMonth: monthEnd,
          topCount: topCount,
          filterType: filterType,
        },
      });

      console.log('Data received:', response.data); // Log les données reçues
      setData(response.data);
    } catch (error) {
      setError(error.message || 'Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch when filters change
  useEffect(() => {
    if (selectedCollection && monthStart && monthEnd) {
      fetchData();
    }
  }, [selectedCollection, monthStart, monthEnd, topCount, filterType]);

  return (
    <Box m='1.5rem 2.5rem'>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="filter-select-label">Filtre</InputLabel>
            <Select
              labelId="filter-select-label"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="" disabled>Filtre</MenuItem>
              <MenuItem value="top">Top</MenuItem>
              <MenuItem value="lowest">Lowest</MenuItem>
              <MenuItem value="between">Between</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Nombre"
            type="number"
            fullWidth
            value={topCount}
            onChange={(e) => setTopCount(parseInt(e.target.value, 10))}
            disabled={filterType !== 'top' && filterType !== 'lowest'}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Mois Début (YYYYMM)"
            type="number"
            fullWidth
            value={monthStart}
            onChange={(e) => setMonthStart(e.target.value)}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Mois Fin (YYYYMM)"
            type="number"
            fullWidth
            value={monthEnd}
            onChange={(e) => setMonthEnd(e.target.value)}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : data.length > 0 ? (
          <Linechart data={data} />
        ) : (
          <Typography>Veuillez sélectionner les filtres pour afficher le graphique.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default LineChartComponent;
