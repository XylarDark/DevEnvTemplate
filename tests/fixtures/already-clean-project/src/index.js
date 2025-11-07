const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Standard application code without any template markers
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the clean API' });
});

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Clean server running on port ${PORT}`);
  });
}

module.exports = app;

