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

const PORT = 6389;

//* object for storing values
const cache = {
  chave: [
    {
      score: '11',
      member: 'minxo',
    },
    {
      score: '12',
      member: 'catorro',
    },
    {
      score: '13',
      member: 'capeta',
    },
    {
      score: '14',
      member: 'caixa',
    },
    {
      score: '21',
      member: 'cerva',
    },
  ],
};

// ! TEST routes (can be removed)
// ? handshake route
routes.get('/', (req, res) => {
  res.send(`Greenis-server listening on port ${PORT}`);
});

// ? List all values
routes.get('/all', (req, res) => {
  res.json(cache);
});

// CREATE ----------------------------------------------||
//* SET key value
routes.post('/set/:key', (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  cache[key] = String(value);

  return res.status(201).send(`"OK"`);
});

//* SET key value EX seconds
routes.post('/set/EX/:key', (req, res) => {
  const { key } = req.params;
  const { value, seconds } = req.body;

  if (isNaN(seconds)) {
    return res
      .status(400)
      .send('EX must be followed by a number');
  }

  cache[String(key)] = String(value);
  setTimeout(() => delete cache[key], seconds * 1000);

  return res.status(201).send(`"OK"`);
});

//* ZADD key score member
routes.post('/zadd/:key', (req, res) => {
  const { key } = req.params;
  const { score, member } = req.body;

  // returns error if score is not a number
  if (isNaN(score)) {
    return res
      .status(400)
      .send('(error) ERR value is not a valid float');
  }

  const newMember = { score, member };
  const oldZ = cache[key];
  // check if Z set exists and key is not assigned
  if (oldZ === undefined) {
    cache[key] = [newMember];
    return res.status(201).send('(integer) 1');
  }
  if (typeof oldZ !== 'object') {
    return res
      .status(400)
      .send(
        '(error) WRONGTYPE Operation against a key holding the wrong kind of value'
      );
  }

  // runs through the set and adds to newZ[] in correct place
  const newZ = [];
  let inserted = false;
  for (let i = 0; i < oldZ.length; i += 1) {
    if (
      (!inserted && score < oldZ[i].score) ||
      (score === oldZ[i].score &&
        member < oldZ[i].member &&
        !inserted)
    ) {
      inserted = true;
      newZ.push(newMember);
    }
    newZ.push(oldZ[i]);
  }
  if (!inserted) {
    newZ.push(newMember);
  }

  console.log(newZ);
  cache[key] = newZ;

  return res.status(201).send('(integer) 1');
});

// READ -----------------------------------------------||
//* GET key
routes.get('/get/:key', (req, res) => {
  const { key } = req.params;

  if (cache[key]) {
    return res.status(200).send(`"${cache[key]}"`);
  }

  return res.status(404).format({
    'text/plain': function () {
      res.send('(nil)');
    },
  });
});

//* DBSIZE
routes.get('/dbsize', (req, res) => {
  return res
    .status(200)
    .send(String(Object.keys(cache).length));
});

// UPDATE ---------------------------------------------||
//* INCR
routes.put('/incr/:key', (req, res) => {
  const { key } = req.params;

  if (!cache[key]) {
    cache[key] = 1;
    return res.status(201).send(`(integer) ${cache[key]}`);
  }

  if (isNaN(cache[key])) {
    return res
      .status(405)
      .send(
        `(error) ERR value is not an integer or out of range`
      );
  }

  cache[key] += 1;
  return res.status(200).send(`(integer) ${cache[key]}`);
});

module.exports = { routes, PORT };
