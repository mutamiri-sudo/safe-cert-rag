module.exports = (req, res) => {
  res.json({
    status: 'ok',
    service: 'SAFe Practitioner 6.0 RAG Assistant',
    timestamp: new Date().toISOString(),
  });
};
