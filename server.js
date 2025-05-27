require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let plantingsCollection;

async function startServer() {
  try {
    await client.connect();
    const db = client.db('pltsia');
    plantingsCollection = db.collection('plantings');

    console.log('Connected to MongoDB');

    // POST /plant — Add a new seed
    app.post('/plant', async (req, res) => {
      const seed = req.body;
      if (!seed || !seed.type || !seed.plantedAt) {
        return res.status(400).send('Invalid seed data');
      }

      await plantingsCollection.insertOne(seed);
      res.status(201).send('Seed planted!');
    });

    // GET /plantings — Return all seeds
    app.get('/plantings', async (req, res) => {
      const seeds = await plantingsCollection.find().toArray();
      res.json(seeds);
    });

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

startServer();

