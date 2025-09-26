require('dotenv').config();
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/tasks');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await require('./config/db').end(); // Close MySQL pool
  process.exit(0);
});