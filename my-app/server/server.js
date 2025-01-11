// server.js
const express = require('express');
const app = express();
const port = 3100;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API server!');
  });

app.post('/web-search', (req, res) => {
  res.json({ result: 'Web search result' });
});

app.post('/detailed-search', (req, res) => {
  res.json({ result: 'Detailed search result' });
});

app.post('/news-search', (req, res) => {
  res.json({ result: 'News search result' });
});

app.post('/gpt-4o', (req, res) => {
  res.json({ result: 'GPT-4o result' });
});

app.post('/get-people-info', (req, res) => {
  res.json({ result: 'People info result' });
});

app.post('/get-email-address', (req, res) => {
  res.json({ result: 'Email address result' });
});

app.post('/verify-email', (req, res) => {
  res.json({ result: 'Email verification result' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});