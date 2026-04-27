// Metrics routes
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET salary metrics by country
router.get('/country/:country', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        MIN(salary) as min_salary,
        MAX(salary) as max_salary,
        AVG(salary) as avg_salary
      FROM employees
      WHERE country = ?
    `).get(req.params.country);

    // Check if any employees found for this country
    if (!stats || stats.min_salary === null) {
      return res.status(404).json({ error: 'No employees found for this country' });
    }

    res.json({
      country: req.params.country,
      min_salary: stats.min_salary,
      max_salary: stats.max_salary,
      avg_salary: stats.avg_salary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET salary metrics by job title
router.get('/job-title/:title', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        AVG(salary) as avg_salary
      FROM employees
      WHERE job_title = ?
    `).get(req.params.title);

    // Check if any employees found for this job title
    if (!stats || stats.avg_salary === null) {
      return res.status(404).json({ error: 'No employees found for this job title' });
    }

    res.json({
      job_title: req.params.title,
      avg_salary: stats.avg_salary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
