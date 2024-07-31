const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const models = require('./models');
const customerRoutes = require('./routes/customerRoutes');
require('dotenv').config();
const jobQueue = require('./queues/jobQueue');

const app = express();
const port = process.env.PORT || 3000;

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

// Use the customer routes
app.use('/api/v1/customer', customerRoutes);

async function addEmailToQueue() {
  await jobQueue.add('sendEmail');
}

app.post('/send-test-email', async (req, res) => {

  try {
      await addEmailToQueue();
      res.status(200).json({ message: 'Email job added to the queue' });
  } catch (err) {
      console.error('Error adding email job to queue:', err);
      res.status(500).json({ message: 'Failed to add email job to the queue' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const sequelize = new Sequelize(
  process.env.DB_DATABASE_DEVELOPMENT,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DIALECT,
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected!');
    return sequelize.sync();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
