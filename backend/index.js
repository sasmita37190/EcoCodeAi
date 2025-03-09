const express = require('express');
const cors = require('cors');
const axios = require("axios");

const app = express();
const port = 8080;

// Enable CORS and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Store repo_url in a variable that can be updated
let Git_url = null;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// ✅ Fix: Use `let` instead of `const` to allow reassignment
app.post("/api/url", (req, res) => {
  const { repo_url } = req.body;
  Git_url = repo_url; // ✅ Now this works because Git_url is declared with `let`
  
  console.log("Received Repository URL:", Git_url);
  res.json({ message: "URL received successfully", repo_url: Git_url });
});

app.post("/api/status", async (req, res) => {
  try {

    const url1 = "https://github.com/rahulbastia00/demo"
    const url2 = "https://github.com/PRAKASH-14A/Code"

    const response = await axios.post("http://127.0.0.1:8000/extract", {
      repo_url: Git_url
    });

    console.log("API Response:", response.data);
    res.json(response.data); // Send the API response back to the frontend
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
