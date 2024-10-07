import express from 'express';
import mongoose from 'mongoose';


const router = express.Router();


// Function to get or create a dynamic Mongoose model
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
      prixUnitaireTN: Number,
      difference: Number,
      marge: Number
    });


    return mongoose.model(collectionName, schema);
  } catch (error) {
    console.error('Erreur lors de la définition du modèle:', error);
    throw error;
  }
};
// Function to extract the month from 'mois' field


router.get('/by-margin', async (req, res) => {
  const { collection, margin } = req.query;


  if (!collection || margin === undefined) {
    return res.status(400).json({ error: 'Collection name and margin are required' });
  }


  try {
    const Model = getDynamicModel(collection);
    let data = await Model.find({ marge: margin }).exec();


    data = data.map(item => ({
      ...item._doc,
      
    }));


    res.json(data);
  } catch (error) {
    console.error('Error fetching data by margin:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
router.get('/filtre', async (req, res) => {
  const { collection, margin, topCount = 20 } = req.query;

  if (!collection || margin === undefined) {
    return res.status(400).json({ error: 'Collection name and margin are required' });
  }

  try {
    const Model = getDynamicModel(collection);
    const marginValue = parseInt(margin, 10);

    const differenceFilter = marginValue === 1 ? { $lt: 0 } : { $gt: 0 };

    let data = await Model.aggregate([
      { $match: { marge: marginValue } },
      {
        $project: {
          Pays: 1,
          Difference: {
            $convert: {
              input: {
                $replaceAll: {
                  input: "$Difference",
                  find: ",",
                  replacement: "."
                }
              },
              to: "double",
              onError: null,
              onNull: null
            }
          },
          // Handle the field with space
          totalDuration: {
            $convert: {
              input: {
                $replaceAll: {
                  input: "$durée Minute",
                  find: ",",
                  replacement: "."
                }
              },
              to: "double",
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $match: { Difference: { $ne: null }, Difference: differenceFilter }
      },
      {
        $group: {
          _id: "$Pays",
          totalDifference: { $sum: "$Difference" },
          totalDuration: { $sum: "$totalDuration" } // Sum of duration
        }
      },
      {
        $project: {
          _id: "$_id",
          Pays: "$_id",
          totalDifference: {
            $round: ["$totalDifference", 2]
          },
          totalDuration: {
            $round: ["$totalDuration", 2]
          }
        }
      },
      { $sort: { totalDifference: 1 } },
      { $limit: parseInt(topCount, 10) }
    ]);

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.get('/Duration/:Pays/:collection', async (req, res) => {
  const { Pays, collection } = req.params;

  if (!Pays || !collection) {
    return res.status(400).json({ error: 'Country and collection name are required' });
  }

  try {
    const Model = getDynamicModel(collection);

    let data = await Model.aggregate([
      { $match: { Pays: Pays } },
      {
        $project: {
          Mois: 1,
          // Conversion et traitement du champ `durée Minute`
          dureeMinuteConverted: {
            $cond: {
              if: { $regexMatch: { input: "$durée Minute", regex: /^[0-9,.]+$/ } },
              then: {
                $toDouble: {
                  $replaceAll: {
                    input: "$durée Minute",
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
          totalDuration: { $sum: "$dureeMinuteConverted" }
        }
      },
      {
        $project: {
          Mois: "$_id",
          totalDuration: {
            $round: ["$totalDuration", 2]
          }
        }
      },
      { $sort: { Mois: 1 } }
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified country' });
    }
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching differences by country:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


router.get('/Pays/:collection/:margin', async (req, res) => {
  const { collection, margin } = req.params;

  if (!collection || margin === undefined) {
    return res.status(400).json({ error: 'Collection name and margin are required' });
  }

  try {
    const Model = getDynamicModel(collection);
    const countries = await Model.distinct('Pays', { marge: parseInt(margin, 10) });

    if (!countries || countries.length === 0) {
      return res.status(404).json({ error: 'No countries found' });
    }

    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
router.get('/Operators/:collection/:margin', async (req, res) => {
  
  const { collection, margin } = req.params;
  const { country } = req.query;
  if (!collection || !country || margin === undefined) {
    return res.status(400).json({ error: 'Collection, country, and margin are required' });
  }
  try {
    const Model = getDynamicModel(collection);
    const operators = await Model.distinct('Opérateur', { Pays: country, marge: parseInt(margin, 10) });
    if (!operators || operators.length === 0) {
      return res.status(404).json({ error: 'No operators found' });
    }
    console.log(operators);
    res.json(operators);
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
router.get('/OperatorData/:Pays/:collection', async (req, res) => {
  const { Pays, collection } = req.params;
  const { margin } = req.query;

  if (!Pays || !collection || margin === undefined) {
    return res.status(400).json({ error: 'Country, collection name, and margin are required' });
  }

  try {
    const Model = getDynamicModel(collection);

    // Afficher les valeurs pour le débogage
    console.log('Pays:', Pays);
    console.log('Collection:', collection);
    console.log('Margin:', margin);

    // Agréger les données pour chaque opérateur
    let data = await Model.aggregate([
      { $match: { Pays: Pays, marge: parseInt(margin, 10) } },
      {
        $project: {
          operator: "$Opérateur",
          month: "$Mois",
          totalDuration: {
            $cond: {
              if: { $regexMatch: { input: "$durée Minute", regex: /^[0-9,.]+$/ } },
              then: {
                $toDouble: {
                  $replaceAll: {
                    input: "$durée Minute",
                    find: ",",
                    replacement: "."
                  }
                }
              },
              else: 0
            }
          },
          totalDifference: {
            $cond: {
              if: { $regexMatch: { input: "$Difference", regex: /^[0-9,.]+$/ } },
              then: {
                $toDouble: {
                  $replaceAll: {
                    input: "$Difference",
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
          _id: {
            operator: "$operator",
            month: "$month"
          },
          totalDuration: { $sum: "$totalDuration" },
          totalDifference: { $sum: "$totalDifference" }
        }
      },
      {
        $group: {
          _id: "$_id.operator",
          monthlyData: {
            $push: {
              month: "$_id.month",
              totalDuration: "$totalDuration",
              totalDifference: "$totalDifference"
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified country' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching operator data:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


export default router;
