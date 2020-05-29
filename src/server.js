const app = require('./main');

// exposed port
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`> Greenis Server running on port ${PORT}`);
});
