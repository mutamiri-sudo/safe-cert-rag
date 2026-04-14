require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SAFe Practitioner 6.0 RAG Assistant',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/domains', (req, res) => {
  res.json([
    { name: 'Introducing SAFe', weight: '6-12%' },
    { name: 'Forming Agile Teams as Trains', weight: '15-21%' },
    { name: 'Connect to the Customer', weight: '9-14%' },
    { name: 'Plan the Work', weight: '21-25%' },
    { name: 'Deliver Value', weight: '13-18%' },
    { name: 'Get Feedback', weight: '6-12%' },
    { name: 'Improve Relentlessly', weight: '13-18%' },
  ]);
});

app.listen(PORT, () => {
  console.log(`SAFe RAG server running on http://localhost:${PORT}`);
});
