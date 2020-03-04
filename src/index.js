const path = require('path');
const express = require('express');
const app = express();

// Setup static directory to serve
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

app.get('/', (req, res) => {
  res.render('index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
