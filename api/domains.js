module.exports = (req, res) => {
  res.json([
    { name: 'Introducing SAFe', weight: '6-12%' },
    { name: 'Forming Agile Teams as Trains', weight: '15-21%' },
    { name: 'Connect to the Customer', weight: '9-14%' },
    { name: 'Plan the Work', weight: '21-25%' },
    { name: 'Deliver Value', weight: '13-18%' },
    { name: 'Get Feedback', weight: '6-12%' },
    { name: 'Improve Relentlessly', weight: '13-18%' },
  ]);
};
