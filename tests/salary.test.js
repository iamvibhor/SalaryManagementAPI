// Salary tests
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/database');

describe('Salary API', () => {
  beforeEach(() => {
    // Clear employees table before each test
    db.exec('DELETE FROM employees');
  });

  describe('GET /salary/:id', () => {
    it('should calculate salary for India with 10% TDS deduction', async () => {
      // Insert employee in India
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('Raj Kumar', 'Developer', 'India', 100000);

      const res = await request(app).get(`/salary/${result.lastInsertRowid}`);

      expect(res.status).toBe(200);
      expect(res.body.gross_salary).toBe(100000);
      expect(res.body.tds_deduction).toBe(10000);
      expect(res.body.net_salary).toBe(90000);
    });

    it('should calculate salary for United States with 12% TDS deduction', async () => {
      // Insert employee in United States
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Smith', 'Engineer', 'United States', 100000);

      const res = await request(app).get(`/salary/${result.lastInsertRowid}`);

      expect(res.status).toBe(200);
      expect(res.body.gross_salary).toBe(100000);
      expect(res.body.tds_deduction).toBe(12000);
      expect(res.body.net_salary).toBe(88000);
    });

    it('should calculate salary for USA with 12% TDS deduction', async () => {
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Smith', 'Engineer', 'USA', 100000);

      const res = await request(app).get(`/salary/${result.lastInsertRowid}`);

      expect(res.status).toBe(200);
      expect(res.body.gross_salary).toBe(100000);
      expect(res.body.tds_deduction).toBe(12000);
      expect(res.body.net_salary).toBe(88000);
    });

    it('should calculate salary for Germany with 0% TDS deduction', async () => {
      // Insert employee in Germany
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('Hans Mueller', 'Manager', 'Germany', 100000);

      const res = await request(app).get(`/salary/${result.lastInsertRowid}`);

      expect(res.status).toBe(200);
      expect(res.body.gross_salary).toBe(100000);
      expect(res.body.tds_deduction).toBe(0);
      expect(res.body.net_salary).toBe(100000);
    });

    it('should return 404 for non-existent employee', async () => {
      const res = await request(app).get('/salary/9999');

      expect(res.status).toBe(404);
    });
  });
});
