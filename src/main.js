const express = require('express');
const { routes, PORT } = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.disable('x-powered-by');

app.listen(PORT, () => {
  console.log(`> Greenis Server running on port ${PORT}`);
});
