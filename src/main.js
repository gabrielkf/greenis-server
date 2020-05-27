const express = require('express');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use(routes);
app.disable('x-powered-by');

const PORT = 6379;

app.listen(PORT, () => {
  console.log(`> Greenis Server running on port ${PORT}`);
});
