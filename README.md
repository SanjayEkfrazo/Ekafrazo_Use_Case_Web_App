# Use Case Management System

A full-stack app to manage business use cases with a clean, easy-to-follow architecture.

The project focuses on one thing: showing how a real CRUD flow moves from UI to API to database and back.

## What This Application Does

1. Stores business use cases in SQLite.
2. Lets users browse, search, and view details.
3. Allows admins to create, edit, and delete use cases.
4. Keeps frontend and backend responsibilities clearly separated.

## User Roles

### Public User (default)

1. Can open dashboard.
2. Can view use case list and details.
3. Cannot create, edit, or delete.

### Admin User

1. Starts as Public.
2. Clicks Unlock Admin in the top-right header.
3. Enters the admin passcode.
4. Gets admin mode and can create, edit, and delete.
5. Can click Logout Admin to return to Public mode.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | SQLite (node:sqlite) |

## Project Structure

```
usecase-management-system/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── utils/
└── .gitignore
```

## Quick Start

### Prerequisites

1. Node.js 18+
2. npm

### 1. Run Backend

```bash
cd backend
npm install
copy .env.example .env
npm start
```

If you are on macOS/Linux, use:

```bash
cp .env.example .env
```

Backend URL: http://localhost:5000

### 2. Configure Backend Environment

Open backend/.env and set secure values:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_PASSCODE=your-admin-passcode
ADMIN_SESSION_SECRET=your-long-random-secret
```

Meaning:

1. ADMIN_PASSCODE is what you enter in Unlock Admin popup.
2. ADMIN_SESSION_SECRET signs the admin session cookie.
3. CLIENT_ORIGIN is allowed frontend URL for CORS.

### 3. Run Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

### 4. Seed Optional Sample Data

```bash
cd backend
npm run seed:reset
```

## How Request Flow Works

Example: create use case

1. User submits form in frontend.
2. Frontend service sends POST /api/usecases.
3. Express route receives request.
4. Controller calls service layer.
5. Service validates and applies business logic.
6. Database layer executes SQL insert.
7. Response returns to frontend.
8. UI shows toast and refreshes list.

## API Reference

Base URL: http://localhost:5000/api

### Auth and Role

| Method | Endpoint | Description |
|---|---|---|
| GET | /auth/me | Get current role (public or admin) |
| POST | /auth/unlock | Unlock admin mode with passcode |
| POST | /auth/logout | Lock admin mode |

### Use Cases

| Method | Endpoint | Description |
|---|---|---|
| GET | /usecases | List use cases with search, sort, pagination |
| GET | /usecases/summary | Dashboard summary |
| GET | /usecases/:id | Get one use case |
| POST | /usecases | Create use case (admin only) |
| PUT | /usecases/:id | Update use case (admin only) |
| DELETE | /usecases/:id | Delete use case (admin only) |

## Main Features

1. Dashboard summary and recently updated list.
2. Search, sorting, and pagination.
3. Details page for each use case.
4. Shared create/edit form.
5. Client-side and server-side validation.
6. Confirm dialog for delete.
7. Toast feedback for success and errors.
8. Public and Admin mode with backend-protected write APIs.

## Security and Git Hygiene

1. One root .gitignore is used for the whole repository.
2. .env files are ignored.
3. .env.example files are tracked.
4. Local database files are ignored.

## Learning Notes

1. SQL is isolated in backend/src/database.
2. Business logic is isolated in backend/src/services.
3. Controllers stay thin.
4. Frontend API calls are centralized in frontend/src/services/api.js.

Start reading from backend/src/server.js and frontend/src/main.jsx to understand the full flow quickly.
