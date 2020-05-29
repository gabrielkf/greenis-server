/*
 * The commands are defined in the route
 * The arguments are defined in the route parameters
 *
 * With the exception of DEL, all commands are either
 * PUT or GET requests:
 * - PUT for insertions of updates: SET, INCR, ZADD
 * - GET for reads: ALL, PING, GET, ZCARD, ZRANK, ZRANGE, DBSIZE
 * - DELETE for  DEL
 */

const routes = require('express').Router();
const cache = require('./cache');

//* GLOBAL MIDDLEWARE
// checks if command is in query parameters
routes.use('/', (req, res, next) => {
  if (!Object.keys(req.query).length) {
    if (req.url === '/') {
      return res
        .status(400)
        .send('ERR No command was input');
    }
    if (req.url === '/dbsize') {
      const [response, status] = cache.dbsize();
      return res.status(status).send(response);
    }
    return next();
  }

  if (!req.query.cmd) {
    return res.status(400).send('ERR Invalid syntax');
  }

  const instruction = req.query.cmd.split(' ');
  const cmd = String(instruction.slice(0, 1)).toLowerCase();
  const args = instruction.slice(1);

  if (!cache.cmdIsValid(cmd)) {
    return res.status(405).send('ERR invalid command');
  }

  const [response, status] = cache[cmd](...args);

  return res.status(status).send(response);
});

// ADD -------------------------------------------------||
//* SET key value [EX seconds]
routes.put('/set/:key', (req, res) => {
  const { key } = req.params;
  const { value, EX, seconds } = req.body;

  const [response, status] = cache.set(
    key,
    value,
    EX,
    seconds
  );

  return res.status(status).send(response);
});

//* ZADD key score member
routes.put('/zadd/:key', (req, res) => {
  const { key } = req.params;
  const { score, member } = req.body;

  const [response, status] = cache.zadd(key, score, member);

  return res.status(status).send(response);
});

// READ -----------------------------------------------||
//* PING
routes.get('/ping', (req, res) => {
  const [response, status] = cache.ping();
  return res.status(status).send(response);
});

//* ALL
routes.get('/all', (req, res) => {
  const [response, status] = cache.all();
  return res.status(status).json(response);
});

//* GET key
routes.get('/get/:key', (req, res) => {
  const { key } = req.params;

  const [response, status] = cache.get(key);

  return res.status(status).send(response);
});

//* ZCARD key
routes.get('/zcard/:key', (req, res) => {
  const { key } = req.params;

  const [response, status] = cache.zcard(key);

  return res.status(status).send(String(response));
});

//* ZRANK
routes.get('/zrank/:key', (req, res) => {
  const { key } = req.params;
  const { member } = req.body;

  const [response, status] = cache.zrank(key, member);

  res.status(status).send(String(response));
});

//* ZRANGE key start stop
routes.get('/zrange/:key', (req, res) => {
  const { key } = req.params;
  const { start, stop } = req.body;

  const [response, status] = cache.zrange(
    String(key),
    start,
    stop
  );

  return res.status(status).send(response);
});

// UPDATE ---------------------------------------------||
//* INCR key
routes.put('/incr/:key', (req, res) => {
  const { key } = req.params;

  const [response, status] = cache.incr(key);

  return res.status(status).format({
    'text/plain': function () {
      res.send(response);
    },
  });
});

// DELETE ---------------------------------------------||
routes.delete('/del/:key', (req, res) => {
  const { key } = req.params;

  const [response, status] = cache.del(key);

  return res.status(status).send(response);
});

module.exports = routes;
