// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API server!');
  });

app.post('/web-search', (req, res) => {
  const { query } = req.body;

  console.log("here")

  res.json({ result: 'Web search result' });
});

app.post('/detailed-search', (req, res) => {
  res.json({ result: 'Detailed search result' });
});

app.post('/news-search', (req, res) => {
  res.json({ result: 'News search result' });
});

app.post('/gpt-4o', async (req, res) => {
  const { columnHeader, rowData } = req.body;

  try {
    const prompt = `Topic: ${columnHeader}\nContext: ${rowData.join(', ')}`;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json',
      },
    });

    const gptResponse = response.data.choices[0].message.content;
    res.json({ result: gptResponse });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get response from GPT-4' });
  }
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