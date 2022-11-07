const express = require('express');
const cors = require('cors');
require('colors');
const app = express();

const port = process.env.PORT || 5000;

//* Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Nurturing Minds Server Running');
});

app.listen(port, () => {
  console.log('Server up and running'.cyan.bold);
});
