const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const PORT = process.env.POST || 3000;

require("dotenv").config();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let plantingsCollection;

async function connectToDB() {
    try {
        await client.connect();
        const database = client.db("pltsia");
        plantingsCollection = database.collection("plantings");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

connectToDB();

app.use(express.json());

app.post('/plant', async (req, res) => {
    const seed = req.body;
    try {
        await plantingsCollection.insertOne(seed);
        res.status(201).send('Seed planted!');
    } catch (error) {
        res.status(500).send('Error planting seed.');
    }
});

app.get('/plantings', async (req, res) => {
    try {
        const plantings = await plantingsCollection.find().toArray();
        res.json(plantings);
    } catch {
        res.status(500).send('Error retrieving plantings');
    }
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
/*
app.use(express.static("public"));
app.use(express.json());

app.get("/timestamp", (req, res) => {
    res.json({ timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/plant", (req, res) => {
    let data = [];
    if (fs.existsSync(DATA_FILE)) {
        data = JSON.parse(fs.readFileSync(DATA_FILE));
    }
    data.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ status: "saved" });
});

app.get("/plants", (req, res) => {
    const data = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE) : "[]";
    res.json(JSON.parse(data));
});
*/
