var NODE_FS = require("fs");
var NODE_PATH = require("path");
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./utils/db');

const tradeRoutes = require('./routes/trade');
const lotRoutes = require('./routes/lot');

const app = express();

connectDB();  // Connect to MongoDB

// middlewares
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // allowing public access for uploads folder for images/files

// routes middleware
app.use('/api/trade', tradeRoutes);
app.use('/api/lot', lotRoutes);


const port = process.env.MS_TRADE_PORTAL_PORT || 5000;
const host = process.env.MS_TRADE_PORTAL_HOST || "localhost";
const serverURL = `http://${host}:${port}`;
// console.log(`port: `, port, `host: `, host, ` serverURL: `, serverURL);

const config = {
    port: port,
    host: host,
    serverURL: serverURL,
    projectName: `Fundtec Platform`,
    serviceName: `Trade portal`,
    dbURL: process.env.DATABASE
  }
  
  app.listen(port, host, () => {
    console.log('.......................................');
      console.log(`Server Details : `);
      console.log(`serverURL : ${config?.serverURL}`);
      console.log(`Project : ${config?.projectName}`);
      console.log(`Micro-Service : ${config?.serviceName}.`);
      console.log(`Database: ${config?.dbURL}`);
    console.log('.......................................');
  });