require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const profileTypesRouter = require('./profileTypes/profileTypes-router');
const regionsRouter = require('./regions/regions-router');
const profilesRouter = require('./profiles/profiles-router');

const app = express();

const morganSetting = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

app.use('/api/profiles', profilesRouter);

app.use('/api/regions', regionsRouter);

app.use('/api/profileTypes', profileTypesRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Fashion Fits API!');
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
