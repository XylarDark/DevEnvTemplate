const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// TEMPLATE-ONLY:START
// This block should be removed by cleanup
console.log('This is template-only code');
function templateOnlyFunction() {
  return 'This should not exist in production';
}
// TEMPLATE-ONLY:END

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/data', (req, res) => {
  res.json({ data: 'sample data' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

