// Employees routes
const express = require('express');
const router = express.Router();
const db = require('../db/database');

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function isInvalidSalary(value) {
  return typeof value !== 'number' || Number.isNaN(value) || value <= 0;
}

// GET all employees
router.get('/', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees').all();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET employee by ID
router.get('/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create employee
router.post('/', (req, res) => {
  try {
    const { full_name, job_title, country, salary } = req.body;

    // Validate all required fields
    if (
      isBlank(full_name) ||
      isBlank(job_title) ||
      isBlank(country) ||
      salary === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields: full_name, job_title, country, salary' });
    }

    if (isInvalidSalary(salary)) {
      return res.status(400).json({ error: 'Salary must be a positive number' });
    }

    // Insert employee into database
    const result = db.prepare(`
      INSERT INTO employees (full_name, job_title, country, salary)
      VALUES (?, ?, ?, ?)
    `).run(full_name.trim(), job_title.trim(), country.trim(), salary);

    // Retrieve and return created employee
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update employee
router.put('/:id', (req, res) => {
  try {
    // Get existing employee
    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Merge existing record with body fields
    const full_name = req.body.full_name !== undefined ? req.body.full_name : existing.full_name;
    const job_title = req.body.job_title !== undefined ? req.body.job_title : existing.job_title;
    const country = req.body.country !== undefined ? req.body.country : existing.country;
    const salary = req.body.salary !== undefined ? req.body.salary : existing.salary;

    if (isBlank(full_name) || isBlank(job_title) || isBlank(country)) {
      return res.status(400).json({ error: 'full_name, job_title, and country must be non-empty strings' });
    }

    if (isInvalidSalary(salary)) {
      return res.status(400).json({ error: 'Salary must be a positive number' });
    }

    // Update employee
    db.prepare(`
      UPDATE employees
      SET full_name = ?, job_title = ?, country = ?, salary = ?
      WHERE id = ?
    `).run(full_name.trim(), job_title.trim(), country.trim(), salary, req.params.id);

    // Retrieve and return updated employee
    const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE employee
router.delete('/:id', (req, res) => {
  try {
    // Check if employee exists
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee
    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
