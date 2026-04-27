// Employees tests
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/database');

describe('Employees API', () => {
  beforeEach(() => {
    // Clear employees table before each test
    db.exec('DELETE FROM employees');
  });

  describe('POST /employees', () => {
    it('should create employee with all required fields and return 201 with id', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          full_name: 'John Doe',
          job_title: 'Software Engineer',
          country: 'USA',
          salary: 120000
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.full_name).toBe('John Doe');
      expect(res.body.job_title).toBe('Software Engineer');
      expect(res.body.country).toBe('USA');
      expect(res.body.salary).toBe(120000);
    });

    it('should return 400 if full_name is missing', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          job_title: 'Software Engineer',
          country: 'USA',
          salary: 120000
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if job_title is missing', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          full_name: 'John Doe',
          country: 'USA',
          salary: 120000
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if country is missing', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          full_name: 'John Doe',
          job_title: 'Software Engineer',
          salary: 120000
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if salary is missing', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          full_name: 'John Doe',
          job_title: 'Software Engineer',
          country: 'USA'
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if salary is not a positive number', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          full_name: 'John Doe',
          job_title: 'Software Engineer',
          country: 'USA',
          salary: -1
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if required text fields are blank', async () => {
      const res = await request(app)
        .post('/employees')
        .send({
          full_name: '   ',
          job_title: 'Software Engineer',
          country: 'USA',
          salary: 120000
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /employees', () => {
    it('should return array of all employees', async () => {
      // Create some test employees
      db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Doe', 'Software Engineer', 'USA', 120000);

      db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('Jane Smith', 'Product Manager', 'UK', 110000);

      const res = await request(app).get('/employees');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('full_name');
      expect(res.body[0]).toHaveProperty('job_title');
      expect(res.body[0]).toHaveProperty('country');
      expect(res.body[0]).toHaveProperty('salary');
    });
  });

  describe('GET /employees/:id', () => {
    it('should return a single employee by id with 200', async () => {
      // Insert test employee
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Doe', 'Software Engineer', 'USA', 120000);

      const res = await request(app).get(`/employees/${result.lastInsertRowid}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(result.lastInsertRowid);
      expect(res.body.full_name).toBe('John Doe');
      expect(res.body.job_title).toBe('Software Engineer');
      expect(res.body.country).toBe('USA');
      expect(res.body.salary).toBe(120000);
    });

    it('should return 404 if employee not found', async () => {
      const res = await request(app).get('/employees/9999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /employees/:id', () => {
    it('should update employee fields and return 200 with updated data', async () => {
      // Insert test employee
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Doe', 'Software Engineer', 'USA', 120000);

      const res = await request(app)
        .put(`/employees/${result.lastInsertRowid}`)
        .send({
          full_name: 'John Updated',
          job_title: 'Senior Engineer',
          country: 'Canada',
          salary: 130000
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(result.lastInsertRowid);
      expect(res.body.full_name).toBe('John Updated');
      expect(res.body.job_title).toBe('Senior Engineer');
      expect(res.body.country).toBe('Canada');
      expect(res.body.salary).toBe(130000);
    });

    it('should return 400 when updating salary to an invalid value', async () => {
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Doe', 'Software Engineer', 'USA', 120000);

      const res = await request(app)
        .put(`/employees/${result.lastInsertRowid}`)
        .send({
          salary: 0
        });

      expect(res.status).toBe(400);
    });

    it('should return 404 when updating a missing employee', async () => {
      const res = await request(app)
        .put('/employees/9999')
        .send({
          full_name: 'Missing Person'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete employee and return 200', async () => {
      // Insert test employee
      const result = db.prepare(`
        INSERT INTO employees (full_name, job_title, country, salary)
        VALUES (?, ?, ?, ?)
      `).run('John Doe', 'Software Engineer', 'USA', 120000);

      const deleteRes = await request(app).delete(`/employees/${result.lastInsertRowid}`);

      expect(deleteRes.status).toBe(200);

      // Verify it's deleted by attempting to GET it
      const getRes = await request(app).get(`/employees/${result.lastInsertRowid}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting a missing employee', async () => {
      const res = await request(app).delete('/employees/9999');

      expect(res.status).toBe(404);
    });
  });
});
