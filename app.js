const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const models = require('./models'); // Ensure models are imported
const customerRoutes = require('./routes/customerRoutes');
require('dotenv').config();
require('./scheduler/reports_scheduler');
require('./scheduler/aramex_update_scheduler');
const jobQueue = require('./queues/jobQueue');
const app = express();
const port = process.env.PORT;

const allowedOrigins = [
  'http://localhost:3000',
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

app.use('/api/v1/customer', customerRoutes);

app.post('/track-shipments', async (req, res) => {
  const { trackingNumbers } = req.body;
  if (!trackingNumbers || !Array.isArray(trackingNumbers)) {
      return res.status(400).json({ error: 'Invalid tracking numbers' });
  }
  try {
      await jobQueue.add('trackShipments', { trackingNumbers });
      res.status(200).json({ message: 'Tracking job added to queue' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});
app.post('/process-tamara-request', async (req, res) => {
  const { refund_record_id } = req.body;

  if (!refund_record_id) {
    return res.status(400).json({ error: 'refund_record_id is required' });
  }

  try {
    // Check if the RefundRequest record exists
    const refundRequest = await models.RefundRequest.findByPk(refund_record_id, {
      include: [{
        model: models.Order, // Include associated Order model
        as: 'order'         // Ensure this alias matches the one defined in the model
      }]
    });

    if (!refundRequest) {
      return res.status(404).json({ error: 'Refund record not found' });
    }

    // Add the job to the queue
    await jobQueue.add('processTamaraRequest', { refund_record: refundRequest });

    res.status(200).json({ message: 'Tamara request job added to the queue' });
  } catch (error) {
    console.error('Error processing Tamara request:', error.message);
    res.status(500).json({ error: 'Failed to add job to the queue' });
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
