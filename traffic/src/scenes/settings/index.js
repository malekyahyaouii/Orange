import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Select, MenuItem, Grid, Typography, Snackbar, Alert } from '@mui/material';

const Setting = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [countries, setCountries] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [currentZone, setCurrentZone] = useState('');
  const [newZone, setNewZone] = useState('');
  const [updateMessage, setUpdateMessage] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [selectedZone, setSelectedZone] = useState('');
  const [currentRetailPrice, setCurrentRetailPrice] = useState('');
  const [newRetailPrice, setNewRetailPrice] = useState('');
  const [updateRetailPriceMessage, setUpdateRetailPriceMessage] = useState(null);
  const [loadingRetailPriceUpdate, setLoadingRetailPriceUpdate] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/mapping/collections')
      .then(response => setCollections(response.data))
      .catch(error => console.error('Erreur lors de la récupération des collections:', error));
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      axios.get(`http://localhost:3000/mapping/countries/${selectedCollection}`)
        .then(response => setCountries(response.data))
        .catch(error => console.error('Erreur lors de la récupération des pays:', error));

      axios.get(`http://localhost:3000/mapping/zones/${selectedCollection}`)
        .then(response => setZones(response.data))
        .catch(error => console.error('Erreur lors de la récupération des zones:', error));
    }
  }, [selectedCollection]);

  useEffect(() => {
    if (selectedZone && selectedCollection) {
      axios.get(`http://localhost:3000/mapping/currentRetailPrice/${selectedCollection}?zone=${selectedZone}`)
        .then(response => {
          console.log('Données reçues:', response.data); 
          setCurrentRetailPrice(response.data.retail_price);
        })
        .catch(error => console.error('Erreur lors de la récupération du retail_price:', error));
    }
  }, [selectedZone, selectedCollection]);

  const handleDelete = () => {
    const isValidFormat = (value) => /^\d{6}$/.test(value);

    if (!selectedCollection || !isValidFormat(startMonth) || !isValidFormat(endMonth)) {
      setDeleteMessage({ text: 'Veuillez sélectionner une collection et entrer les mois au format AAAAMM.', type: 'error' });
      return;
    }

    setLoadingDelete(true);
    setDeleteMessage(null);

    axios.delete('http://localhost:3000/data/deleteByMonth', {
      data: {
        collection: selectedCollection,
        startMonth: parseInt(startMonth),
        endMonth: parseInt(endMonth)
      }
    })
      .then(response => {
        setLoadingDelete(false);
        setDeleteMessage({ text: 'Data deleted successfully.', type: 'success' });
      })
      .catch(error => {
        setLoadingDelete(false);
        setDeleteMessage({ text: 'Erreur lors de la suppression des données: ' + error.message, type: 'error' });
      });
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setCurrentZone('');
    setNewZone('');

    if (country) {
      axios.get(`http://localhost:3000/mapping/currentZone/${selectedCollection}?country=${country}`)
        .then(response => setCurrentZone(response.data.zone))
        .catch(error => console.error('Erreur lors de la récupération de la zone:', error));
    }
  };

  const handleZoneUpdate = () => {
    if (!selectedCountry || !newZone) {
      setUpdateMessage({ text: 'Veuillez sélectionner un pays et entrer une nouvelle zone.', type: 'error' });
      return;
    }

    setLoadingUpdate(true);
    setUpdateMessage(null);

    axios.put(`http://localhost:3000/mapping/updateZone/${selectedCollection}`, {
      country: selectedCountry,
      newZone: newZone
    })
      .then(response => {
        setLoadingUpdate(false);
        setUpdateMessage({ text: 'Zone updated successfully.', type: 'success' });
      })
      .catch(error => {
        setLoadingUpdate(false);
        setUpdateMessage({ text: 'Erreur lors de la mise à jour de la zone: ' + error.message, type: 'error' });
      });
  };

  const handleRetailPriceUpdate = () => {
    if (!selectedZone || !newRetailPrice) {
      setUpdateRetailPriceMessage({ text: 'Veuillez sélectionner une zone et entrer un nouveau retail_price.', type: 'error' });
      return;
    }

    setLoadingRetailPriceUpdate(true);
    setUpdateRetailPriceMessage(null);

    axios.put(`http://localhost:3000/mapping/updateRetailPrice/${selectedCollection}`, {
      zone: selectedZone,
      retail_price: parseFloat(newRetailPrice)
    })
      .then(response => {
        setLoadingRetailPriceUpdate(false);
        setUpdateRetailPriceMessage({ text: 'Retail price updated successfully.', type: 'success' });
      })
      .catch(error => {
        setLoadingRetailPriceUpdate(false);
        setUpdateRetailPriceMessage({ text: 'Erreur lors de la mise à jour du retail_price: ' + error.message, type: 'error' });
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h2" gutterBottom color="secondary">Paramètres :</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6">Collection:</Typography>
          <Select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Sélectionnez une collection</MenuItem>
            {collections.map((collection) => (
              <MenuItem key={collection} value={collection}>{collection}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Supprimer les données par mois</Typography>
          <TextField
            label="Mois de début (AAAAMM)"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            placeholder="202401"
            inputProps={{ maxLength: 6 }}
            fullWidth
          />
          <TextField
            label="Mois de fin (AAAAMM)"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            placeholder="202412"
            inputProps={{ maxLength: 6 }}
            fullWidth
            style={{ marginTop: '10px' }}
          />
          <Button
            onClick={handleDelete}
            disabled={loadingDelete}
            variant="contained"
           color="secondary"
            style={{ marginTop: '10px' }}
          >
            Supprimer
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Modification de la table de mapping</Typography>
          <Select
            value={selectedCountry}
            onChange={handleCountryChange}
            fullWidth
          >
            <MenuItem value="">Sélectionnez un pays</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
          {selectedCountry && (
            <>
              <TextField
                label="Zone actuelle"
                value={currentZone || ''} // Utilisez une chaîne vide par défaut
                readOnly
                fullWidth
                style={{ marginTop: '10px' }}
              />
              <TextField
                label="Nouvelle zone"
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                fullWidth
                style={{ marginTop: '10px' }}
              />
              <Button
                onClick={handleZoneUpdate}
                disabled={loadingUpdate}
                variant="contained"
                color="primary"
                style={{ marginTop: '10px' }}
              >
                Mettre à jour la zone
              </Button>
            </>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Modification du Retail Price</Typography>
          <Select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Sélectionnez une zone</MenuItem>
            {zones.map((zone) => (
              <MenuItem key={zone} value={zone}>{zone}</MenuItem>
            ))}
          </Select>
          {selectedZone && (
            <>
              <TextField
                label="Retail Price actuel"
                value={currentRetailPrice || ''} // Utilisez une chaîne vide par défaut
                disabled
                fullWidth
                style={{ marginTop: '10px' }}
              />
              <TextField
                label="Nouveau retail_price"
                value={newRetailPrice}
                onChange={(e) => setNewRetailPrice(e.target.value)}
                fullWidth
                type="number"
                style={{ marginTop: '10px' }}
              />
              <Button
                onClick={handleRetailPriceUpdate}
                disabled={loadingRetailPriceUpdate}
                variant="contained"
                color="primary"
                style={{ marginTop: '10px' }}
              >
                {loadingRetailPriceUpdate ? 'Mise à jour...' : 'Mettre à jour retail_price'}
              </Button>
            </>
          )}
        </Grid>
      </Grid>

      {deleteMessage && (
        <Snackbar open autoHideDuration={6000} onClose={() => setDeleteMessage(null)}>
          <Alert onClose={() => setDeleteMessage(null)} severity={deleteMessage.type}>
            {deleteMessage.text}
          </Alert>
        </Snackbar>
      )}

      {updateMessage && (
        <Snackbar open autoHideDuration={6000} onClose={() => setUpdateMessage(null)}>
          <Alert onClose={() => setUpdateMessage(null)} severity={updateMessage.type}>
            {updateMessage.text}
          </Alert>
        </Snackbar>
      )}

      {updateRetailPriceMessage && (
        <Snackbar open autoHideDuration={6000} onClose={() => setUpdateRetailPriceMessage(null)}>
          <Alert onClose={() => setUpdateRetailPriceMessage(null)} severity={updateRetailPriceMessage.type}>
            {updateRetailPriceMessage.text}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default Setting;
