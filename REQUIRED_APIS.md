# Required APIs for Microfinance Admin Panel

To transition this application from mock data to a real backend database, you will need to implement the following REST API endpoints. All endpoints should ideally be protected via JWT authentication (`Authorization: Bearer <token>`).

---

## 1. Authentication

### `POST /api/auth/login`
Validates user credentials and returns an authentication token and user profile.

**Request Payload:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...",
  "user": {
    "id": "U1001",
    "name": "Admin",
    "role": "Manager"
  }
}
```

---

## 2. Dashboard

### `GET /api/dashboard/summary`
In the current frontend implementation, the dashboard aggregates data client-side by calling all the core endpoints (`/api/customers`, `/api/loans`, etc.) simultaneously. However, for a production backend, it is highly recommended to implement this dedicated endpoint so the server calculates the aggregations to minimize data transfer overhead.

**Response:**
```json
{
  "kpis": {
    "totalCustomers": 150,
    "activeCustomers": 142,
    "activeLoansCount": 85,
    "totalLoanPortfolio": 1500000,
    "totalSavingsPool": 450000,
    "defaultedLoans": 2
  },
  "charts": {
    "loanVsSavingsByGroup": [
      {
        "name": "Sunrise",
        "loans": 125.5,
        "savings": 45.0
      }
    ],
    "loanStatusDistribution": [
      { "name": "Running", "value": 85 },
      { "name": "Completed", "value": 20 },
      { "name": "Defaulted", "value": 2 }
    ],
    "savingsTrend6Months": [
      { "month": "Oct", "amount": 415000 },
      { "month": "Nov", "amount": 450000 }
    ]
  }
}
```

---

## 3. Customers

### `GET /api/customers`
Retrieves a list of all customers.

**Response:**
```json
[
  {
    "id": "C001",
    "name": "Ramesh Kumar",
    "phone": "9876543210",
    "email": "ramesh@example.com",
    "address": "123 Main St, Springfield",
    "status": "active",
    "joinedDate": "2025-01-15T00:00:00.000Z",
    "groupId": "G001"
  }
]
```

### `GET /api/customers/:id`
Retrieves a single customer by ID.

### `POST /api/customers`
Creates a new customer.

**Request Payload:**
```json
{
  "name": "Sita Devi",
  "phone": "9988776655",
  "email": "sita@example.com",
  "address": "45 Market St",
  "groupId": "G002"
}
```

### `PUT /api/customers/:id`
Updates an existing customer.

---

## 3. Groups (Self Help Groups)

### `GET /api/groups`
Retrieves a list of all groups.

**Response:**
```json
[
  {
    "id": "G001",
    "name": "Sunrise Women Group",
    "location": "North District",
    "formedDate": "2024-05-10T00:00:00.000Z",
    "status": "active",
    "memberCount": 12
  }
]
```

### `GET /api/groups/:id`
Retrieves a single group by ID.

### `POST /api/groups`
Creates a new group.

### `PUT /api/groups/:id`
Updates an existing group.

---

## 4. Loans

### `GET /api/loans`
Retrieves a list of all loans.

**Response:**
```json
[
  {
    "id": "L001",
    "customerId": "C001",
    "groupId": "G001",
    "amount": 50000,
    "interestRate": 12,
    "durationMonths": 12,
    "disbursedDate": "2025-02-01T00:00:00.000Z",
    "dueDate": "2026-02-01T00:00:00.000Z",
    "status": "running",
    "purpose": "Small Business",
    "outstandingAmount": 40000,
    "paidEmis": 2,
    "emiAmount": 4666.67
  }
]
```

### `GET /api/loans/:id/schedule`
Retrieves the EMI schedule for a specific loan.

**Response:**
```json
[
  {
    "emiNumber": 1,
    "dueDate": "2025-03-01T00:00:00.000Z",
    "amount": 4666.67,
    "status": "paid"
  },
  {
    "emiNumber": 2,
    "dueDate": "2025-04-01T00:00:00.000Z",
    "amount": 4666.67,
    "status": "pending"
  }
]
```

### `POST /api/loans`
Creates and disburses a new loan.

**Request Payload:**
```json
{
  "customerId": "C002",
  "groupId": "G001",
  "amount": 20000,
  "interestRate": 10,
  "durationMonths": 6,
  "purpose": "Agriculture"
}
```

### `PUT /api/loans/:id`
Updates an existing loan details.

---

## 5. Savings

### `GET /api/savings`
Retrieves all savings accounts. Supports query parameters `?groupId=G001&status=active`.

**Response:**
```json
[
  {
    "id": "S001",
    "customerId": "C001",
    "groupId": "G001",
    "balance": 15000,
    "openedDate": "2025-01-20T00:00:00.000Z",
    "lastTransactionDate": "2025-03-15T00:00:00.000Z",
    "status": "active"
  }
]
```

### `POST /api/savings`
Opens a new savings account for a valid customer.

**Request Payload:**
```json
{
  "customerId": "C002",
  "groupId": "G001"
}
```

---

## 6. Transactions

### `GET /api/transactions`
Retrieves a general transaction ledger. Must support multiple query filters: `?groupId=...&customerId=...&type=...&dateFrom=...&dateTo=...`

**Response:**
```json
[
  {
    "id": "TXN_001",
    "customerId": "C001",
    "groupId": "G001",
    "type": "loan_payment", 
    "amount": 4666.67,
    "date": "2025-03-01T10:30:00.000Z",
    "method": "cash",
    "note": "EMI 1 paid"
  },
  {
    "id": "TXN_002",
    "customerId": "C001",
    "groupId": "G001",
    "type": "savings_deposit",
    "amount": 500,
    "date": "2025-03-10T14:15:00.000Z",
    "method": "bank_transfer",
    "note": "Monthly deposit"
  }
]
```
*(Note: Valid types strictly include `"loan_payment"`, `"savings_deposit"`, and `"savings_withdrawal"`).*
