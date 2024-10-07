import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Définir et enregistrer les modèles dynamiquement
const getDynamicModel = (collectionName) => {
  try {
    if (mongoose.modelNames().includes(collectionName)) {
      return mongoose.model(collectionName);
    }

    const schema = new mongoose.Schema({
      annee: Number,
      trimestre: String,
      semaine: Number,
      mois: Number,
      jour: Number,
      cashFlow: String,
      typeMarche: String,
      billingOperator: String,
      billedProduct: String,
      Opérateur: String,
      prixUnitaireEuro: Number,
      Pays: String,
      charge: String,
      nbrAppel: Number,
      duréeMinute: Number,
      Zone: String,
      retailPrice: Number,
      prix_unitaireTN: Number,
      Difference: Number,
      marge: Number
    });

    return mongoose.model(collectionName, schema);
  } catch (error) {
    console.error('Erreur lors de la définition du modèle:', error);
    throw error;
  }
};
// Endpoint pour obtenir tous les noms de collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    res.status(200).json(collectionNames);
  } catch (error) {
    console.error('Erreur lors de la récupération des noms de collections:', error);
    res.status(500).json({ error: 'Error fetching collection names' });
  }
});
// Endpoint pour obtenir les pays distincts d'une collection
router.get('/countries/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const DynamicModel = getDynamicModel(collectionName);
    
    const countries = await DynamicModel.distinct("Pays");
    
    res.status(200).json(countries);
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    res.status(500).json({ error: 'Error fetching countries' });
  }
});

// Endpoint pour obtenir les pays par zone
router.get('/countries-by-zone/:collectionName/:zone', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const zone = req.params.zone;
    const DynamicModel = getDynamicModel(collectionName);
    
    const countries = await DynamicModel.distinct("Pays", { Zone: zone });
    
    res.status(200).json(countries);
  } catch (error) {
    console.error('Erreur lors de la récupération des pays par zone:', error);
    res.status(500).json({ error: 'Error fetching countries by zone' });
  }
});

// Endpoint pour obtenir les opérateurs par pays
router.get('/operators/:collectionName/:country', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const country = req.params.country;
    const DynamicModel = getDynamicModel(collectionName);
    
    const operators = await DynamicModel.distinct("Opérateur", { Pays: country });
    
    res.status(200).json(operators);
  } catch (error) {
    console.error('Erreur lors de la récupération des opérateurs:', error);
    res.status(500).json({ error: 'Error fetching operators' });
  }
});

// Endpoint pour obtenir les zones distinctes d'une collection
router.get('/zones/:collection', async (req, res) => {
  const { collection } = req.params;
  
  try {
    const DynamicModel = getDynamicModel(collection);
    
    // Check if the model is valid
    if (!DynamicModel) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    const zones = await DynamicModel.distinct('Zone');
    res.status(200).json(zones);
  } catch (error) {
    console.error('Erreur lors de la récupération des zones:', error);
    res.status(500).json({ error: 'Error fetching zones' });
  }
});


// Endpoint pour obtenir la durée totale par opérateur dans un pays
router.get('/duration-by-operator/:collectionName/:country', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const country = req.params.country;
    const DynamicModel = getDynamicModel(collectionName);
    
    console.log(`Fetching duration by operator for collection: ${collectionName}, country: ${country}`);
    
    // Debug: Afficher quelques documents pour vérifier les valeurs
    const sampleDocs = await DynamicModel.find({ Pays: country }).limit(5).exec();
    console.log('Sample documents:', sampleDocs);

    const data = await DynamicModel.aggregate([
      { 
        $match: { Pays: country } 
      },
      {
        $project: {
          Opérateur: 1,
          duréeMinute: {
            $toDouble: {
              $replaceAll: {
                input: "$durée Minute",
                find: ",",
                replacement: "."
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$Opérateur",
          totalDuration: { $sum: "$duréeMinute" } // Utilisez le champ converti
        }
      }
    ]);

    console.log(`Data found: ${JSON.stringify(data)}`);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/filtre', async (req, res) => {
  const { collection, filterType, topCount = 20, minDuration = 0, maxDuration = 3000000 } = req.query;

  if (!collection || !filterType) {
    return res.status(400).json({ error: 'Collection name and filter type are required' });
  }

  try {
    const Model = getDynamicModel(collection);
    let data;

    switch (filterType) {
      case 'top':
        data = await Model.aggregate([
          {
            $project: {
              Pays: 1,
              totalDuration: {
                $convert: {
                  input: { $replaceAll: { input: "$durée Minute", find: ",", replacement: "." } },
                  to: "double",
                  onError: null,
                  onNull: null
                }
              }
            }
          },
          {
            $group: {
              _id: "$Pays",
              totalDuration: { $sum: "$totalDuration" }
            }
          },
          {
            $project: {
              _id: 0,
              Pays: "$_id",
              totalDuration: {
                $round: ["$totalDuration", 2]
              }
            }
          },
          { $sort: { totalDuration: -1 } },
          { $limit: parseInt(topCount, 10) }
        ]);
        break;

      case 'lowest':
        data = await Model.aggregate([
          {
            $project: {
              Pays: 1,
              totalDuration: {
                $convert: {
                  input: { $replaceAll: { input: "$durée Minute", find: ",", replacement: "." } },
                  to: "double",
                  onError: null,
                  onNull: null
                }
              }
            }
          },
          {
            $group: {
              _id: "$Pays",
              totalDuration: { $sum: "$totalDuration" }
            }
          },
          {
            $project: {
              _id: 0,
              Pays: "$_id",
              totalDuration: {
                $round: ["$totalDuration", 2]
              }
            }
          },
          { $sort: { totalDuration: 1 } },
          { $limit: parseInt(topCount, 10) }
        ]);
        break;

      case 'between':
        data = await Model.aggregate([
          {
            $project: {
              Pays: 1,
              totalDuration: {
                $convert: {
                  input: { $replaceAll: { input: "$durée Minute", find: ",", replacement: "." } },
                  to: "double",
                  onError: null,
                  onNull: null
                }
              }
            }
          },
          {
            $match: {
              totalDuration: { $gte: parseFloat(minDuration), $lte: parseFloat(maxDuration) }
            }
          },
          {
            $group: {
              _id: "$Pays",
              totalDuration: { $sum: "$totalDuration" }
            }
          },
          {
            $project: {
              _id: 0,
              Pays: "$_id",
              totalDuration: {
                $round: ["$totalDuration", 2]
              }
            }
          }
        ]);
        break;

      default:
        return res.status(400).json({ error: 'Invalid filter type' });
    } console.log(data);

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to get total duration by zone
router.get('/duration-by-zone/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const DynamicModel = getDynamicModel(collectionName);

    const data = await DynamicModel.aggregate([
      {
        $addFields: {
          // Remplacer les virgules par des points pour la conversion correcte
          "durée Minute": {
            $replaceAll: {
              input: "$durée Minute",
              find: ",",
              replacement: "."
            }
          }
        }
      },
      {
        $addFields: {
          // Convertir la chaîne en nombre, en remplaçant les chaînes vides par 0
          "durée Minute": {
            $cond: {
              if: { $gt: [{ $strLenCP: "$durée Minute" }, 0] },  // Vérifie si la chaîne n'est pas vide
              then: { $toDouble: "$durée Minute" },
              else: 0  // Valeur par défaut si la chaîne est vide
            }
          }
        }
      },
      {
        $group: {
          _id: "$Zone",
          totalDuration: { $sum: "$durée Minute" }
        }
      },
      {
        $project: {
          _id: 0,
          zone: "$_id",
          totalDuration: {
            $round: ["$totalDuration", 2]
          }
        }
      }
    ]);

    console.log('Aggregated Data:', data);

    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération de la durée par zone:', error);
    res.status(500).json({ error: 'Error fetching duration by zone' });
  }
});

// Endpoint to get total duration by month
router.get('/duration-by-month/:collectionName', async (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const DynamicModel = getDynamicModel(collectionName);

    const data = await DynamicModel.aggregate([
      {
        $addFields: {
          // Convert the duration to number, replacing commas with dots
          "duréeMinute": {
            $convert: {
              input: { $replaceAll: { input: "$durée Minute", find: ",", replacement: "." } },
              to: "double",
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $group: {
          _id: { mois: "$Mois" },
          totalDuration: { $sum: "$duréeMinute" }
        }
      },
      {
        $sort: { "_id.Mois": 1 }
      },
      {
        $project: {
          _id: 0,
          mois: "$_id.Mois",
          totalDuration: { $round: ["$totalDuration", 2] }
        }
      }
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération de la durée par mois:', error);
    res.status(500).json({ error: 'Error fetching duration by month' });
  }
});
router.get('/duration-by-operator-month/:collectionName/:country/:operator', async (req, res) => {
  const { collectionName, country, operator } = req.params;

  if (!collectionName || !country || !operator) {
    return res.status(400).json({ error: 'Collection name, country, and operator are required' });
  }

  try {
    const Model = getDynamicModel(collectionName);

    const data = await Model.aggregate([
      { $match: { Pays: country, Opérateur: operator } },
      {
        $addFields: {
          durationMinute: {
            $convert: {
              input: { $replaceAll: { input: "$durée Minute", find: ",", replacement: "." } },
              to: "double",
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $group: {
          _id: "$Mois",
          totalDuration: { $sum: "$durationMinute" }
        }
      },
      {
        $project: {
          Mois: "$_id",
          totalDuration: { $round: ["$totalDuration", 2] }
        }
      },
      { $sort: { Mois: 1 } }
    ]);

    if (!data.length) {
      return res.status(404).json({ error: 'No data found for the specified country and operator' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching duration by operator and month:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});





//*************************************************************************************************************** */
router.get('/LineChartData/:collection/:Pays/:Operateur', async (req, res) => {
  const { collection, Pays, Operateur } = req.params;
  const { margin } = req.query;

  if (!collection || !Pays || !Operateur || margin === undefined) {
    return res.status(400).json({ error: 'Collection, country, operator, and margin are required' });
  }

  try {
    const Model = getDynamicModel(collection);
    const marginValue = parseInt(margin, 10);

    // Log for debugging
    console.log(`Fetching data for collection: ${collection}, country: ${Pays}, operator: ${Operateur}, margin: ${marginValue}`);

    const data = await Model.aggregate([
      { $match: { Pays: Pays, Operateur: Operateur, marge: marginValue } },
      {
        $project: {
          Mois: 1,
          totaldurée: {
            $cond: {
              if: { $regexMatch: { input: "$duréeMinute", regex: /^[0-9,.]+$/ } },
              then: {
                $toDouble: {
                  $replaceAll: {
                    input: "$duréeMinute",
                    find: ",",
                    replacement: "."
                  }
                }
              },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: "$Mois",
          totaldurée: { $sum: "$totaldurée" }
        }
      },
      {
        $project: {
          Mois: "$_id",
          totaldurée: { $round: ["$totaldurée", 2] }
        }
      },
      { $sort: { Mois: 1 } }
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified parameters' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching line chart data:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
router.get('/PaysOperateurs/:collection', async (req, res) => {
  const { collection } = req.params;
  const { margin } = req.query;

  if (!collection || margin === undefined) {
    return res.status(400).json({ error: 'Collection name and margin are required' });
  }

  try {
    const Model = getDynamicModel(collection);
    const marginValue = parseInt(margin, 10);

    // Log for debugging
    console.log(`Fetching countries and operators for collection: ${collection}, margin: ${marginValue}`);

    // Fetch countries and operators
    const data = await Model.aggregate([
      { $match: { marge: marginValue } },
      {
        $group: {
          _id: "$Pays",
          operateurs: { $addToSet: "$Operateur" }
        }
      }
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified margin' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching countries and operators:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



export default router;
