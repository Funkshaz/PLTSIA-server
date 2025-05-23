const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "plantings.json");

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
