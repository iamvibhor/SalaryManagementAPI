// Metrics tests
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/database');

describe('Metrics API', () => {
  beforeEach(() => {
    // Clear employees table
    db.exec('DELETE FROM employees');

    // Seed test data
    db.prepare(`
      INSERT INTO employees (full_name, job_title, country, salary)
      VALUES (?, ?, ?, ?)
    `).run('Alice', 'Engineer', 'India', 60000);

    db.prepare(`
      INSERT INTO employees (full_name, job_title, country, salary)
      VALUES (?, ?, ?, ?)
    `).run('Bob', 'Engineer', 'India', 80000);

    db.prepare(`
      INSERT INTO employees (full_name, job_title, country, salary)
      VALUES (?, ?, ?, ?)
    `).run('Carol', 'Designer', 'India', 50000);

    db.prepare(`
      INSERT INTO employees (full_name, job_title, country, salary)
      VALUES (?, ?, ?, ?)
    `).run('Dave', 'Engineer', 'United States', 120000);
  });

  describe('GET /metrics/country/:country', () => {
    it('should return salary metrics for India', async () => {
      const res = await request(app).get('/metrics/country/India');

      expect(res.status).toBe(200);
      expect(res.body.country).toBe('India');
      expect(res.body.min_salary).toBe(50000);
      expect(res.body.max_salary).toBe(80000);
      expect(res.body.avg_salary).toBeCloseTo(63333.33, 1);
    });

    it('should return 404 for non-existent country', async () => {
      const res = await request(app).get('/metrics/country/Antarctica');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /metrics/job-title/:jobTitle', () => {
    it('should return salary metrics for Engineer job title', async () => {
      const res = await request(app).get('/metrics/job-title/Engineer');

      expect(res.status).toBe(200);
      expect(res.body.job_title).toBe('Engineer');
      expect(res.body.avg_salary).toBeCloseTo(86666.67, 1);
    });

    it('should return 404 for non-existent job title', async () => {
      const res = await request(app).get('/metrics/job-title/Astronaut');

      expect(res.status).toBe(404);
    });
  });
});
