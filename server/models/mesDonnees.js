// models/ModelLoader.js
import mongoose from 'mongoose';

// Define and register models dynamically
export const getDynamicModel = (collectionName) => {
  try {
    // Check if the model is already registered
    if (mongoose.modelNames().includes(collectionName)) {
      return mongoose.model(collectionName);
    }

    // Define the schema
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
      retail_price: Number,
      prix_unitaireTN: Number,
      Difference: Number,
      marge: Number
    });

    // Register the model
    return mongoose.model(collectionName, schema);
  } catch (error) {
    console.error('Erreur lors de la définition du modèle:', error);
    throw error;
  }
};
