import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Importer le middleware CORS

import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import ExcelJS from 'exceljs';



const app = express();
app.use(express.json());
app.use(cors()); // Utiliser le middleware CORS

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/trafic')
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur de connexion MongoDB:', err));




// Import routes using ES modules
import DataRoutes from './routes/Data.routes.js';
import RoamingRoutes from './routes/Roaming.routes.js';
import TraficRoutes from './routes/trafic.routes.js';
import MappingRoutes from './routes/Mapping.routes.js';
import LoginRoutes from './routes/login.routes.js';
app.use("/data", DataRoutes);
app.use("/trafic", TraficRoutes);
app.use("/Roaming", RoamingRoutes);
app.use("/Mapping" ,MappingRoutes);
app.use("/Login" ,LoginRoutes);
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
