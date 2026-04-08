# Comprehensive API Specifications for Microfinance Admin Panel

---

## MODULE: Authentication

### 1. CREATE API (Login)
Endpoint: `/api/auth/login`
Method: `POST`

Request Body:
```json
{
  "username": "admin",  // Required: String
  "password": "password123" // Required: String
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "U1",
    "name": "Admin",
    "role": "Manager"
  }
}
```

---

## MODULE: Dashboard

### 1. GET LIST API (Summary Data)
Endpoint: `/api/dashboard/summary`
Method: `GET`

Query Params:
None

Response:
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
        "loans": 125500,
        "savings": 45000
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

### 7. SPECIAL LOGIC (IMPORTANT)
Mention:
- Dashboard currently runs client-side aggregation by fetching all module endpoints in parallel. This API is strictly requested to reduce browser overhead. Back-end must calculate all distributions, sums, and status counts natively querying database relations securely.

---

## MODULE: Customers

### 1. GET LIST API
Endpoint: `/api/customers`
Method: `GET`

Query Params:
- `page` (optional)
- `limit` (optional)
- `search` (Search maps generically to name/phone/id in UI)

Response:
```json
{
  "data": [
    {
      "id": "C001",
      "name": "Ramesh Kumar",
      "phone": "9876543210",
      "email": "ramesh@example.com",
      "status": "active", // Enum: ['active', 'inactive', 'defaulted']
      "joinDate": "2024-01-15T00:00:00.000Z",
      "groupId": "G001",
      "idProof": "Aadhar-1234",
      "groupName": "Sunrise Group" // Derived from relations to prevent n+1 queries in UI
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50
}
```

### 2. GET SINGLE (DETAIL) API
Endpoint: `/api/customers/:id`
Method: `GET`

Response:
```json
{
  "id": "C001",
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "email": "ramesh@example.com",
  "address": "123 Main St, Springfield",
  "status": "active",
  "groupId": "G001",
  "joinedDate": "2024-01-15T00:00:00.000Z"
}
```

### 3. CREATE API
Endpoint: `/api/customers`
Method: `POST`

Request Body:
```json
{
  "name": "Sita Devi",          // Required: String, min 2 chars
  "phone": "9988776655",        // Required: String, min 10 chars
  "email": "sita@example.com",  // Optional: String, strict email match
  "address": "45 Market St",    // Required: String, min 5 chars
  "groupId": "G002",            // Optional: String ID
  "status": "active"            // Required Enum: ['active', 'inactive']
}
```

### 4. UPDATE API
Endpoint: `/api/customers/:id`
Method: `PUT/PATCH`

Request Body:
```json
{
  "name": "Sita Devi",
  "phone": "9988776655",
  "email": "sita@example.com",
  "address": "45 Market St",
  "groupId": "G002",
  "status": "active"
}
```

### 5. DELETE API
Endpoint: `/api/customers/:id`
Method: `DELETE`

### 6. DROPDOWNS / MASTER DATA
- Needs list of Groups `/api/groups/options`
- Expected: `[{ "value": "G001", "label": "Sunrise Group" }]`

### 7. SPECIAL LOGIC (IMPORTANT)
Mention:
- `groupId` must cascade correctly.

---

## MODULE: Groups

### 1. GET LIST API
Endpoint: `/api/groups`
Method: `GET`

Query Params:
- `page`
- `limit`
- `search`

Response:
```json
{
  "data": [
    {
      "id": "G001",
      "name": "Sunrise Women Group",
      "location": "North District",
      "leader": "Anita Devi",
      "leaderPhone": "9876543211",
      "totalLoanExposure": 150000,
      "totalSavings": 45000,
      "formedDate": "2024-05-10T00:00:00.000Z",
      "status": "active",
      "memberCount": 12  // Calculated field
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 50
}
```

### 2. GET SINGLE (DETAIL) API
Endpoint: `/api/groups/:id`
Method: `GET`

Response:
```json
{
  "id": "G001",
  "name": "Sunrise Women Group",
  "location": "North District",
  "status": "active",
  "formedDate": "2024-05-10" 
}
```

### 3. CREATE API
Endpoint: `/api/groups`
Method: `POST`

Request Body:
```json
{
  "name": "Hope Society",       // Required: String, min 3 chars
  "location": "South Zone",     // Required: String, min 3 chars
  "status": "active"            // Required Enum: ['active', 'inactive']
}
```

### 4. UPDATE API
Endpoint: `/api/groups/:id`
Method: `PUT/PATCH`

Request Body:
```json
{
  "name": "Hope Society",
  "location": "South Zone",
  "status": "active"
}
```

### 5. DELETE API
Endpoint: `/api/groups/:id`
Method: `DELETE`

### 7. SPECIAL LOGIC (IMPORTANT)
Mention:
- **`memberCount`**: The GET list API must aggregate and return `memberCount` automatically (Count of `customers` linked via foreign key).

---

## MODULE: Loans

### 1. GET LIST API
Endpoint: `/api/loans`
Method: `GET`

Query Params:
- `page`
- `limit`
- `search`

Response:
```json
{
  "data": [
    {
      "id": "L001",
      "customerId": "C001",
      "groupId": "G001",
      "amount": 50000,
      "interestRate": 12,
      "durationMonths": 12,
      "emiAmount": 4666.67,
      "paidEmis": 2,
      "outstandingAmount": 40000,
      "disbursedDate": "2025-02-01T00:00:00.000Z",
      "dueDate": "2026-02-01T00:00:00.000Z",
      "status": "running" // Enum: ['running', 'completed', 'defaulted']
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 50
}
```

### 2. GET SINGLE (DETAIL) API
Endpoint: `/api/loans/:id`
Method: `GET`

Response:
```json
{
  "id": "L001",
  "customerId": "C001",
  "groupId": "G001",
  "amount": 50000,
  "interestRate": 12,
  "durationMonths": 12,
  "emiAmount": 4666.67,
  "disbursedDate": "2025-02-01T00:00:00.000Z",
  "dueDate": "2026-02-01T00:00:00.000Z",
  "status": "running",
  "purpose": "Small Business",
  "outstandingAmount": 40000,
  "paidEmis": 2
}
```

### 3. CREATE API
Endpoint: `/api/loans`
Method: `POST`

Request Body:
```json
{
  "groupId": "G001",          // Required string
  "customerId": "C002",       // Required string 
  "amount": 20000,            // Required number > 0
  "interestRate": 10,         // Required number > 0
  "durationMonths": 6,        // Required number > 0
  "purpose": "Hardware Buy"   // Required string, min 3 chars
}
```

### 4. UPDATE API
Endpoint: `/api/loans/:id`
Method: `PUT/PATCH`

Request Body:
```json
{
  "groupId": "G001",
  "customerId": "C002",
  "amount": 20000,
  "interestRate": 10,
  "durationMonths": 6,
  "purpose": "Hardware Buy",
  "status": "running"
}
```

### 5. GET EMI SCHEDULE
Endpoint: `/api/loans/:id/schedule`
Method: `GET`

Response:
```json
[
  {
    "emiNumber": 1,
    "dueDate": "2025-03-01T00:00:00.000Z",
    "amount": 4666.67,
    "status": "paid" // Enum: ['paid', 'pending', 'overdue']
  }
]
```

### 6. DROPDOWNS / MASTER DATA
- Groups endpoint: `/api/groups/options`
- Customers endpoint: `/api/customers/options`

### 7. SPECIAL LOGIC (IMPORTANT)
Mention:
- **dependent dropdowns**: During creation, `customerId` choices are strictly filtered to belong to the selected `groupId`.
- **calculated fields**: `emiAmount` MUST be mathematically generated on the backend using `interestRate`, `amount`, and `durationMonths`. `dueDate` is projected based on disbursal date + `durationMonths`.

---

## MODULE: Savings

### 1. GET LIST API
Endpoint: `/api/savings`
Method: `GET`

Query Params:
- `page`
- `limit`
- `groupId` (Filter: Select Group)
- `status` (Filter: Enum ['active', 'frozen'])

Response:
```json
{
  "data": [
    {
      "id": "S001",
      "customerId": "C001",
      "groupId": "G001",
      "balance": 15000,
      "openedDate": "2025-01-20T00:00:00.000Z",
      "lastTransactionDate": "2025-03-15T00:00:00.000Z",
      "status": "active"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 50
}
```

### 3. CREATE API
Endpoint: `/api/savings`
Method: `POST`

Request Body:
```json
{
  "groupId": "G001",     // Required: Selected Group
  "customerId": "C002"   // Required: Selected Customer inside group
}
```

### 6. DROPDOWNS / MASTER DATA
- Groups and Customers list.

### 7. SPECIAL LOGIC (IMPORTANT)
Mention:
- **dependent dropdowns**: Same logic as Loans – creating a savings account requires picking a specific Group to fetch dependent Customers.
- **calculated fields**: `balance` calculates automatically via aggregated database transactions linking to this Saving Account's ID.

---

## MODULE: Transactions

### 1. GET LIST API
Endpoint: `/api/transactions`
Method: `GET`

Query Params:
- `page`
- `limit`
- `groupId`     (Filter dropdown)
- `customerId`  (Filter dependent dropdown based on groupId)
- `type`        (Filter: Enum `['loan_payment', 'savings_deposit', 'savings_withdrawal']`)
- `dateFrom`    (Filter: Date constraint start)
- `dateTo`      (Filter: Date constraint end)

Response:
```json
{
  "data": [
    {
      "id": "TXN_001",
      "customerId": "C001",
      "groupId": "G001",
      "type": "loan_payment", 
      "amount": 4666.67,
      "date": "2025-03-01T10:30:00.000Z",
      "method": "cash", // Or bank transfer
      "note": "EMI 1 paid"
    }
  ],
  "total": 2300,
  "page": 1,
  "limit": 50
}
```

### 7. SPECIAL LOGIC (IMPORTANT)
Mention:
- Transactions are immutable ledgers. There is intentionally NO UPDATE or DELETE endpoint for security.
- Query Parameter relationships: Advanced dual-filtration implies that changing the Group ID query dynamically filters the valid Customer IDs parameter payload on both client states and must be validated contextually on server routes.
