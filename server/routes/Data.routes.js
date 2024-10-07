import express from 'express';
import multer from 'multer';
import csv from 'csvtojson';
import mongoose from 'mongoose';
import path from 'path';

const router = express.Router();

// Configuration du stockage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Endpoint pour télécharger et importer des fichiers CSV
router.post('/uploadall', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    // Conversion CSV en JSON
    const jsonArray = await csv({ delimiter: ';' }).fromFile(req.file.path);
    console.log('Données JSON importées:', JSON.stringify(jsonArray, null, 2));

    // Nettoyage des données
    const cleanedArray = jsonArray.map(item => {
      item.marge = isNaN(item.marge) ? 0 : Number(item.marge);
      const { _id, ...rest } = item;
      return rest;
    });

    // Création du modèle dynamique
    const collectionName = path.parse(req.file.originalname).name;
    const dynamicSchema = new mongoose.Schema({}, { strict: false });
    const DynamicModel = mongoose.model(collectionName, dynamicSchema);

    // Insertion des données dans la collection
    await DynamicModel.insertMany(cleanedArray);

    res.json({ message: "Données ajoutées avec succès" });
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour récupérer toutes les données d'une collection
router.get('/getAll', async (req, res) => {
  try {
    const collectionName = req.query.collection;

    // Vérifiez que le paramètre collection est défini
    if (!collectionName) {
      return res.status(400).json({ error: 'Le paramètre collection est requis' });
    }

    console.log(`Récupération des données pour la collection: ${collectionName}`);

    // Vérifiez si le modèle existe déjà
    let DynamicModel;
    try {
      DynamicModel = mongoose.model(collectionName);
    } catch (e) {
      // Si le modèle n'existe pas, créez-le avec un schéma vide
      const dynamicSchema = new mongoose.Schema({}, { strict: false });
      DynamicModel = mongoose.model(collectionName, dynamicSchema);
    }

    const data = await DynamicModel.find();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour récupérer les noms de toutes les collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    res.status(200).json(collectionNames);
  } catch (error) {
    console.error('Erreur lors de la récupération des collections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour supprimer les données d'une collection pour des mois spécifiques
router.delete('/deleteByMonth', async (req, res) => {
  try {
    const { collection, startMonth, endMonth } = req.body;

    if (!collection || !startMonth || !endMonth) {
      return res.status(400).json({ error: 'Collection, mois de début, et mois de fin sont requis.' });
    }

    console.log(`Suppression des données pour la collection: ${collection}, de ${startMonth} à ${endMonth}`);

    let DynamicModel;
    try {
      DynamicModel = mongoose.model(collection);
    } catch (e) {
      const dynamicSchema = new mongoose.Schema({}, { strict: false });
      DynamicModel = mongoose.model(collection, dynamicSchema);
    }

    // Update query for string handling
    const deletionQuery = { Mois: { $gte: startMonth.toString(), $lte: endMonth.toString() } };
    console.log(`Query used for deletion: ${JSON.stringify(deletionQuery)}`);

    const documentsToDelete = await DynamicModel.find(deletionQuery);
    console.log(`Documents to delete: ${JSON.stringify(documentsToDelete, null, 2)}`);

    if (documentsToDelete.length === 0) {
      return res.status(404).json({ message: "Aucun document trouvé pour la plage de mois spécifiée." });
    }

    const result = await DynamicModel.deleteMany(deletionQuery);

    res.status(200).json({ message: `${result.deletedCount} documents supprimés avec succès.` });
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateZone', async (req, res) => {
  const { collection, currentZone, newZone } = req.body;

  if (!collection || !currentZone || !newZone) {
    return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires.' });
  }

  try {
    const result = await YourModel.updateMany(
      { Zone: currentZone },
      { $set: { Zone: newZone } }
    );
    res.status(200).json({ message: `Mise à jour réussie pour ${result.modifiedCount} documents.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la zone.', error: error.message });
  }
});
router.put('/updateRetailPrice', async (req, res) => {
  const { collection, zone, retailPrice } = req.body;

  if (!collection || !zone || retailPrice === undefined) {
    return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires.' });
  }

  try {
    const result = await YourModel.updateMany(
      { Zone: zone },
      { $set: { retailPrice: retailPrice } }
    );
    res.status(200).json({ message: `Mise à jour réussie pour ${result.modifiedCount} documents.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du retail price.', error: error.message });
  }
});

router.get('/zone', async (req, res) => {
  const { collection, country } = req.query;

  if (!collection || !country) {
    return res.status(400).json({ message: 'Veuillez fournir la collection et le pays.' });
  }

  try {
    const document = await YourModel.findOne({ Pays: country });  // Recherchez le modèle correspondant
    if (document) {
      res.status(200).json({ zone: document.Zone });
    } else {
      res.status(404).json({ message: 'Aucun document trouvé pour ce pays.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la zone.', error: error.message });
  }
});











export default router;


