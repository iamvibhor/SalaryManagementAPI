// Main Express app configuration
const express = require('express');
const employeesRouter = require('./routes/employees');
const salaryRouter = require('./routes/salary');
const metricsRouter = require('./routes/metrics');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/employees', employeesRouter);
app.use('/salary', salaryRouter);
app.use('/metrics', metricsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
