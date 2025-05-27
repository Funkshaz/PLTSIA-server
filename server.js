require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new MongoClient(process.env.MONGO_URI);
let plantingsCollection;

async function startServer() {
    try {
        await client.connect();
        const db = client.db("pltsia");
        plantingsCollection = db.collection("plantings");
        console.log("Connected to MongoDB");

        app.post("/plant", async (req, res) => {
            const { tileId, type, plantedAt } = req.body;
            if (!tileId || !type || !plantedAt)
                return res.status(400).send("Missing seed data");

            const existing = await plantingsCollection.findOne({ tileId });
            if (existing) return res.status(409).send("Tile already planted");

            await plantingsCollection.insertOne({ tileId, type, plantedAt });
            res.status(201).send("Seed planted");
        });

        app.get("/plantings", async (req, res) => {
            const seeds = await plantingsCollection.find().toArray();
            res.json(seeds);
        });

        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "public", "index.html"));
        });

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
}

startServer();
