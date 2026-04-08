# Microfinance Admin Panel

A modern, scalable, and highly user-friendly React-based admin panel built for microfinance organizations to easily manage customers, loans, savings, groups, and transactions.

## Features

- **Dashboard**: High-level KPIs, group-level drill-downs, and dynamic charts (Recharts) for loan distributions and savings trends.
- **Customers**: Complete CRUD operations for customer details with status tracking.
- **Groups**: Management of Self Help Groups with drill-down views of group members.
- **Loans**: Loan tracking including EMI schedules, disbursal details, and outstanding balances.
- **Savings**: Aggregated savings tracking, individual deposit/withdrawal functionalities.
- **Transactions**: Configurable ledger with dependent grouping and filtering mechanics.
- **Authentication**: Pre-configured static authentication layer with protected routes.
- **Dark Mode & Responsiveness**: Mobile-first architecture with an integrated Light/Dark toggle in the header.

## Tech Stack

- **Frontend**: React (Latest), Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **State Management**: Zustand
- **Data Fetching/Caching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts

## Setup and Installation

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed on your specific environment.

### 1. Clone the repository

```bash
git clone https://github.com/neelabja321/MFPanel.git
cd MFPanel
```

### 2. Install Dependencies

```bash
npm install
```

*(Note: Use `--legacy-peer-deps` flag if you experience any peer dependency resolution issues on specific node versions)*

### 3. Start Development Server

```bash
npm run dev
```

The application will start typically on [http://localhost:5173/](http://localhost:5173/).

## Authentication Instructions

By default, the application is wrapped behind a static authentication layer for immediate frontend-only usage. Use the following credentials to access the panel:

- **Username**: `admin`
- **Password**: `admin123`

## Implementation Overview

This project was built adhering to modern (2026) frontend architectures, separating `features`, `components`, `services`, and `store` logic for clean scalability. The service layer (`src/services/`) currently mocks API delays with mock data (`src/mock-data/`), effectively keeping the UI components abstracted. For integrating a real backend, simply substitute the mock Promise-returns with actual `fetch` or `axios` HTTP calls inside the individual service classes.

## License

This project is licensed under the MIT License.
