# Use Case Management System

A full-stack CRUD application for managing business use cases. Built as a learning project to demonstrate a clean, traceable full-stack architecture — **React** on the frontend, **Express** on the backend, and **SQLite** for storage.

There is no authentication, notifications, or analytics here on purpose. The whole point of this project is to make one thing very clear: **how a Create, Read, Update, and Delete flow travels through a real application, end to end.**

---

## Tech Stack

| Layer     | Technology              |
|-----------|--------------------------|
| Frontend  | React (Vite) + Tailwind CSS + React Router |
| Backend   | Node.js + Express        |
| Database  | SQLite (via better-sqlite3) |

---

## Project Structure

```
usecase-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & app configuration
│   │   ├── database/       # DB connection + raw SQL queries
│   │   ├── models/         # Field definitions & allowed values
│   │   ├── services/       # Business logic (search, sort, pagination, validation)
│   │   ├── controllers/    # Request/response handling
│   │   ├── routes/         # Express route definitions
│   │   ├── middlewares/    # Error handling
│   │   ├── utils/          # Validators
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI building blocks
    │   ├── pages/           # Dashboard, Use Cases, Create, Edit
    │   ├── layouts/          # MainLayout (sidebar + content)
    │   ├── routes/           # Route definitions
    │   ├── services/         # API calls (fetch wrapper)
    │   ├── hooks/             # useToast (toast notifications)
    │   └── utils/             # Constants & client-side validation
    └── package.json
```

---

## How a Request Flows (the whole point of this project)

Example: **saving a new use case**

```
User clicks "Create Use Case"
   ↓
UseCaseForm (React component)
   ↓
useCaseService.js  →  createUseCase()
   ↓
api.js  →  fetch("POST /api/usecases")
   ↓
Express route  (routes/usecase.routes.js)
   ↓
Controller      (controllers/usecase.controller.js)
   ↓
Service         (services/usecase.service.js)  → validation
   ↓
Database layer  (database/usecase.database.js) → SQL INSERT
   ↓
SQLite file (usecases.db)
   ↓
Response flows back up through the same layers
   ↓
React state updates → toast shown → table refreshes
```

Every layer has exactly one job. If something breaks, you always know which file to open.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### 1. Install and run the backend

```bash
cd backend
npm install
npm start
```

The API will start on **http://localhost:5000**. A `usecases.db` SQLite file is created automatically on first run — no manual database setup required.

Optional: load realistic test data

```bash
cd backend
npm run seed:reset
```

This inserts 20 real-world sample use cases across domains like Retail, Banking, Healthcare, Logistics, and Manufacturing.

### 2. Install and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will start on **http://localhost:5173**.

### 3. Open the app

Visit **http://localhost:5173** in your browser. The backend must be running for the frontend to load any data.

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                | Description                          |
|--------|--------------------------|---------------------------------------|
| GET    | `/usecases`              | List use cases (supports `search`, `sortBy`, `sortOrder`, `page`, `limit`) |
| GET    | `/usecases/summary`      | Dashboard summary (total count + recently updated) |
| GET    | `/usecases/:id`          | Get a single use case                |
| POST   | `/usecases`               | Create a new use case                |
| PUT    | `/usecases/:id`          | Update an existing use case          |
| DELETE | `/usecases/:id`          | Delete a use case                    |

### Use Case Fields

`title`, `description`, `domain`, `category`, `status`, `priority`, `business_problem`, `proposed_solution`, `technology_stack`, `created_at`, `updated_at`

---

## Features

- Full CRUD (Create, Read, Update, Delete)
- Search across title, domain, and category
- Sortable table columns
- Pagination
- Client-side and server-side validation with friendly error messages
- Confirmation dialog before delete
- Toast notifications for success/error feedback
- Loading skeletons and empty states
- Fully responsive (desktop, tablet, mobile)

---

## Notes for Learners

- **SQL lives only in `backend/src/database/`.** Nowhere else in the backend writes raw SQL.
- **Business rules live only in `backend/src/services/`.** Controllers never contain logic beyond calling a service and shaping the HTTP response.
- **The frontend never calls `fetch()` directly** outside of `src/services/api.js` — every page goes through the service layer.
- **`UseCaseForm.jsx`** is shared between the Create and Edit pages, so you only need to look in one place to understand the form itself.

Read the code top to bottom starting from `backend/src/server.js` and `frontend/src/main.jsx` — everything branches out from those two files.
