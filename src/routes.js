/*
 * The commands are defined in the route
 * The arguments are defined in the route parameters
 *
 * The requests are defined by the command nature (CRUD)
 * POST for creations: SET, ZADD
 * GET for reads: GET, ZCARD, ZRANK, DBSIZE
 * POST for updates: INCR
 * DELETE for deletions: DEL
 */

const routes = require('express').Router();

//* object for storing values
const cache = {};

// ? test route (can be removed)
routes.get('/', (req, res) => {
  res.send('Greenis up and running');
});

// ? List all values
routes.get('/all', (req, res) => {
  res.json(cache);
});

// CREATE ----------------------------------------------||
routes.post('/set/:key/:value', (req, res) => {
  const { key, value } = req.params;
  cache[key] = String(value);

  return res.status(201).send(`"OK"`);
});

routes.post('/set/:key/:value/:time', (req, res) => {
  const { key, value, time } = req.params;

  if (isNaN(time)) {
    return res
      .status(400)
      .send('EX must be followed by a number');
  }

  cache[String(key)] = String(value);
  setTimeout(() => delete cache[key], time * 1000);

  return res.status(201).send(`"OK"`);
});

// READ -----------------------------------------------||
routes.get('/get/:key', (req, res) => {
  const { key } = req.params;

  if (cache[key]) {
    return res.status(200).send(`"${cache[key]}"`);
  }

  return res.status(204).send('(nil)');
});

module.exports = routes;
