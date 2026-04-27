// Salary routes
const express = require('express');
const router = express.Router();
const db = require('../db/database');

function getDeductionRate(country) {
  const normalizedCountry = String(country).trim().toLowerCase();

  if (normalizedCountry === 'india') {
    return 0.10;
  }

  if (normalizedCountry === 'united states' || normalizedCountry === 'usa' || normalizedCountry === 'us') {
    return 0.12;
  }

  return 0;
}

// GET salary by employee ID
router.get('/:id', (req, res) => {
  try {
    // Look up employee by id
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Calculate TDS deduction based on country
    const tds_deduction = employee.salary * getDeductionRate(employee.country);

    // Calculate net salary
    const net_salary = employee.salary - tds_deduction;

    // Return JSON with required fields
    res.json({
      employee_id: employee.id,
      full_name: employee.full_name,
      country: employee.country,
      gross_salary: employee.salary,
      tds_deduction,
      net_salary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create salary record
router.post('/', (req, res) => {
  res.json({ message: 'Create salary record' });
});

// PUT update salary
router.put('/:id', (req, res) => {
  res.json({ message: 'Update salary' });
});

// DELETE salary record
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete salary record' });
});

module.exports = router;
