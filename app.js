const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const models = require('./models');

const app = express();
const port = 3000;

const allowedOrigins = [
    '*',
  ];

const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));

app.use(express.json());

app.get('/', async (req, res) => {
  res.json({'text': "welcome"})
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
