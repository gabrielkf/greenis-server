const { Router } = require('express');
const mongoose = require('mongoose');

mongoose
  .connect('mongo://mongo:27017/sample', {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const Sample = require('./database/Schemas/sampleData');

const routes = new Router();

routes.get('/', (req, res) => {
  res.send('working alright');
});

routes.post('/db', async (req, res) => {
  const { id, sample } = req.body;

  const sentData = new Sample({
    id,
    sample,
  });

  sentData
    .save(sample)
    .then(savedData => res.send(savedData))
    .catch(err => res.send(err));

  return res.json(sentData);
});

module.exports = routes;
