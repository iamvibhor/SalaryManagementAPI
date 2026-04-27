# Salary Management API

A small Node.js/Express API for managing employees, calculating take-home salary, and exposing a couple of salary metrics. The project is backed by SQLite and was built in small TDD-friendly steps.

## What It Does

- **Manage employees** - Create, read, update, and delete employee records
- **Calculate salaries** - Return gross salary, deductions, and net salary by employee ID
- **View analytics** - Expose salary statistics by country and by job title

## Tech Stack

- Node.js, Express.js v5
- SQLite 3 with better-sqlite3
- Jest + Supertest for tests
- In-memory DB for tests, file-based for production

## Quick Start

### Install

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Start Server

```bash
npm start
```

The server runs on `http://localhost:3000`.

## API Endpoints

### Employees

```
POST /employees              # Create employee
GET /employees              # List all
GET /employees/:id          # Get one
PUT /employees/:id          # Update
DELETE /employees/:id       # Delete
```

**Required fields:** `full_name`, `job_title`, `country`, `salary`

### Salary

```
GET /salary/:id             # Get net salary with deductions
```

Deduction rules:
- India: 10%
- United States: 12%
- Other: 0%

**Response:**
```json
{
  "employee_id": 1,
  "full_name": "John Doe",
  "country": "India",
  "gross_salary": 100000,
  "tds_deduction": 10000,
  "net_salary": 90000
}
```

### Metrics

```
GET /metrics/country/:country           # Min, max, avg salary in country
GET /metrics/job-title/:jobTitle        # Avg salary for job title
```

## Examples

Create an employee:
```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Raj Kumar",
    "job_title": "Developer",
    "country": "India",
    "salary": 120000
  }'
```

Get salary details:
```bash
curl http://localhost:3000/salary/1
```

Get country metrics:
```bash
curl http://localhost:3000/metrics/country/India
```

## Project Structure

```
src/
├── app.js                   # Express app setup
├── server.js                # Server entry
├── db/
│   └── database.js          # SQLite setup
└── routes/
    ├── employees.js         # CRUD endpoints
    ├── salary.js            # Salary calculation
    └── metrics.js           # Analytics endpoints

tests/
├── employees.test.js
├── salary.test.js
└── metrics.test.js
```

## How It Was Built

This kata was developed with a straightforward red -> green -> refactor workflow:

1. **RED** - Write failing tests first
2. **GREEN** - Implement minimal code to pass
3. **REFACTOR** - Clean up and improve

Each feature was added in a small commit sequence so the git history shows how the solution evolved.

## Test Coverage

**Employee CRUD and validation (12 tests)**
- Create with required fields
- Validate missing, blank, and invalid input
- List all
- Get by ID
- Update existing records
- Return 404 for missing records
- Delete records safely

**Salary calculation (5 tests)**
- India 10% deduction
- United States and USA 12% deduction
- Other countries 0% deduction
- 404 for missing employee

**Salary metrics (4 tests)**
- Country stats (min, max, average)
- 404 for no data
- Job title average
- 404 for no data

Current test count: `24 passing`.

## Database Schema

```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  country TEXT NOT NULL,
  salary REAL NOT NULL
)
```

## Error Handling

- **201**: Created
- **200**: Success
- **400**: Bad request
- **404**: Not found
- **500**: Server error

## Notes

- SQLite runs in memory during tests and uses `salary.db` locally when the app starts normally.
- Inputs are validated so blank text fields and non-positive salaries are rejected with `400 Bad Request`.

## Possible Next Steps

- Add auth
- Pagination for employee lists
- Logging
- Rate limiting
- More detailed tax rules

## License

ISC
