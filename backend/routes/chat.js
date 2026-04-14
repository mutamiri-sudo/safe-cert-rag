const express = require('express');
const { askQuestion } = require('../services/rag');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { question, chatHistory } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await askQuestion(question.trim(), chatHistory || []);
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

module.exports = router;
