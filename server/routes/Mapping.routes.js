import express from 'express';
import mongoose from 'mongoose';
import { getDynamicModel } from '../models/mesDonnees.js'; 
import multer from 'multer';
import csv from 'csv-parser';
const router = express.Router();
//const upload = multer({ dest: 'uploads/' });

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom du fichier
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  }
});
router.post('/uploadall/:collectionName', upload.single('csvFile'), async (req, res) => {
  try {
    const { collectionName } = req.params;

    if (!collectionName) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        if (!rows.length || !rows[0].hasOwnProperty('Zone') || !rows[0].hasOwnProperty('Pays') || !rows[0].hasOwnProperty('Operateur')) {
          return res.status(400).json({ error: 'Invalid file format. Required headers: Zone, Pays, Operateur.' });
        }

        const DynamicModel = getDynamicModel(collectionName);
        await DynamicModel.insertMany(rows);

        fs.unlinkSync(filePath);

        res.status(200).json({ message: 'File imported successfully' });
      });
  } catch (error) {
    console.error('Error during file import:', error);
    res.status(500).json({ error: 'An error occurred during file import' });
  }
});

// 1. Route pour obtenir la liste des collections disponibles
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    res.json(collectionNames);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2. Route pour obtenir les zones d'une collection spécifique
router.get('/zones/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const Model = getDynamicModel(collectionName); // Utiliser le modèle dynamique
    const zones = await Model.distinct('Zone').exec(); // Utiliser `exec()` pour obtenir une promesse
    res.json(zones);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 3. Route pour obtenir les pays d'une collection spécifique
router.get('/countries/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const Model = getDynamicModel(collectionName); // Utiliser le modèle dynamique
    const countries = await Model.distinct('Pays').exec(); // Utiliser `exec()` pour obtenir une promesse
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Function to replace all spaces in the operator string with hyphens
const formatOperator = (operator) => {
  return operator ? operator.replace(/\s+/g, '-') : '';
};

// Function to normalize text (convert to uppercase and trim whitespace)
const normalizeText = (text) => {
  return text ? text.toUpperCase().trim() : '';
};

router.get('/selected-fields/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { zone, country } = req.query;

    const Model = getDynamicModel(collectionName);
    let query = {};
    if (zone) query.Zone = zone;
    if (country) query.Pays = country;

    // Fetch data from the model
    const data = await Model.find(query).select('Pays Opérateur Zone _id').exec();

    // Normalize and deduplicate data
    const uniqueDataMap = new Map();
    data.forEach(item => {
      const normalizedPays = normalizeText(item.Pays);
      const formattedOperateur = formatOperator(normalizeText(item.Opérateur));
      const normalizedZone = normalizeText(item.Zone);

      const uniqueKey = `${normalizedPays}|${formattedOperateur}|${normalizedZone}`;

      if (!uniqueDataMap.has(uniqueKey)) {
        uniqueDataMap.set(uniqueKey, {
          id: item._id.toString(),
          pays: item.Pays || '',
          operateur: formattedOperateur,
          zone: item.Zone || ''
        });
      }
    });

    const uniqueData = Array.from(uniqueDataMap.values());

    res.json(uniqueData);
  } catch (error) {
    console.error('Error fetching selected fields:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Fetching the Current Zone of a Selected Country
router.get('/currentZone/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { country } = req.query;

    if (!country) {
      return res.status(400).json({ message: 'Country is required.' });
    }

    const Model = getDynamicModel(collectionName);
    const countryData = await Model.findOne({ Pays: country }).select('Zone').exec();

    if (countryData) {
      res.status(200).json({ zone: countryData.Zone });
    } else {
      res.status(404).json({ message: 'Country not found.' });
    }
  } catch (error) {
    console.error('Error fetching current zone:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Updating the Zone of Selected Countries
router.put('/updateZone/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { country, newZone } = req.body;

    if (!country || !newZone) {
      return res.status(400).json({ message: 'Country and new zone are required.' });
    }

    const Model = getDynamicModel(collectionName);
    const result = await Model.updateMany(
      { Pays: country },
      { $set: { Zone: newZone } }
    ).exec();

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Zone updated successfully for all matching documents.' });
    } else {
      res.status(404).json({ message: 'Country not found or no changes made.' });
    }
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Fonction pour nettoyer les chaînes (retirer les espaces et les caractères invisibles)
const cleanString = (str) => str ? str.trim() : '';
router.get('/currentRetailPrice/:collection', async (req, res) => {
  const { collection } = req.params;
  const { zone } = req.query;

  console.log('Collection:', collection);
  console.log('Zone reçue:', zone);

  try {
    if (!zone) {
      return res.status(400).json({ message: 'Zone est requise.' });
    }

    const zoneClean = cleanString(zone); // Assurez-vous que cleanString() fonctionne correctement
    console.log('Zone nettoyée:', zoneClean);

    const result = await mongoose.connection.db.collection(collection).findOne({ Zone: { $regex: new RegExp(`^${zoneClean}$`, 'i') } });

    if (result) {
      console.log('Résultat trouvé:', result);
      return res.json({ retail_price: result.retail_price });
    } else {
      console.log('Aucun résultat trouvé pour la zone:', zoneClean);
      return res.status(404).json({ message: 'Aucun retailPrice trouvé pour cette zone.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du retailPrice:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération du retailPrice.' });
  }
});
router.put('/updateRetailPrice/:collection', async (req, res) => {
  const { zone, retail_price } = req.body;
  const { collection } = req.params;

  console.log('Collection:', collection);
  console.log('Zone:', zone);
  console.log('Retail Price:', retail_price);

  try {
    if (!zone || retail_price === undefined) {
      return res.status(400).json({ message: 'Zone et retail_price sont requis.' });
    }

    const result = await mongoose.connection.db.collection(collection).updateMany(
      { Zone: zone },
      { $set: { retail_price: retail_price } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Retail price updated successfully.' });
    } else {
      res.status(404).json({ message: 'Zone not found or no changes made.' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du retail price:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du retail price.' });
  }
});


export default router;
