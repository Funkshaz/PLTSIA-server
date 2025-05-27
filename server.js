require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret123",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

const client = new MongoClient(process.env.MONGO_URI);
let usersCollection;
let plantingsCollection;

// Middleware to restrict access to logged-in users
function requireLogin(req, res, next) {
    if (!req.session.userId) return res.status(401).send("Login required");
    next();
}

// Register
app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).send("Email and password required");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) return res.status(409).send("User already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await usersCollection.insertOne({ email, passwordHash });

    req.session.userId = result.insertedId;
    res.status(201).send("User registered");
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).send("Email and password required.");

    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(401).send("Invalid email.");

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return res.status(401).send("Invalid password.");

    req.session.userId = user._id;
    res.status(200).send("Logged in.");
});

// Logout
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.send("Logged out.");
    });
});

// Get user-specific plantings
app.get("/plantings", requireLogin, async (req, res) => {
    const seeds = await plantingsCollection
        .find({ userId: req.session.userId })
        .toArray();
    res.json(seeds);
});

// Plant a seed (per-user)
app.post("/plant", requireLogin, async (req, res) => {
    const { tileId, type, plantedAt } = req.body;

    const existing = await plantingsCollection.findOne({
        tileId,
        userId: req.session.userId,
    });

    if (existing) return res.status(409).send("Already planted.");

    await plantingsCollection.insertOne({
        tileId,
        type,
        plantedAt,
        userId: req.session.userId,
    });

    res.status(201).send("Planted.");
});

async function startServer() {
    try {
        await client.connect();
        const db = client.db("pltsia");
        usersCollection = db.collection("users");
        plantingsCollection = db.collection("plantings");
        console.log("Connected to MongoDB");

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
}

startServer();
