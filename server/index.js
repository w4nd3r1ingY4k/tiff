require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // If needed

const app = express();
const PORT = 10001;

app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests if your frontend is served elsewhere

let messages = [];

// Root route
app.get('/', (req, res) => {
  res.send('Tiff server is running! Use POST /process-context to send a message, GET /process-context to view messages.');
});

// GET /process-context route to retrieve all messages
app.get('/process-context', (req, res) => {
  res.json({ messages });
});

// POST /process-context route to process and store a new message
app.post('/process-context', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  messages.push(query);
  res.json({ result: query });
});

// GET /messages route to retrieve all messages separately
app.get('/messages', (req, res) => {
  res.json({ messages });
});

app.listen(PORT, () => {
  console.log(`Tiff server is running at http://localhost:${PORT}`);
});