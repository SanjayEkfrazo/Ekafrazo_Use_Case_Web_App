# Use Case Management System

A full-stack application to manage enterprise use cases and domain media.

It includes:

- A React + Vite frontend
- An Express backend API
- A SQLite database using Node built-in node:sqlite
- Public and admin access modes

## Key Features

- Use case listing with search, sorting, pagination, and detail view
- Admin-only create, edit, and delete for use cases
- Domain media management (upload, replace, delete)
- Dashboard summary endpoints and admin dashboard pages
- Backend-enforced admin authorization via signed HTTP-only cookie

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Framer Motion |
| Backend | Node.js, Express, Multer, CORS |
| Database | SQLite (node:sqlite) |

## Project Layout

There are two Node projects in this repository:

- frontend (UI app)
- backend (API server)

Dependencies are installed separately inside each folder.

## Prerequisites

- Node.js 20+ recommended
- npm

## Quick Start

### 1) Backend Setup

Windows PowerShell:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cd backend
npm install
cp .env.example .env
```

Edit backend/.env and set secure values:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_PASSCODE=choose-a-strong-passcode
ADMIN_SESSION_SECRET=choose-a-long-random-secret
```

Important:

- ADMIN_PASSCODE cannot be default values like change-me or admin123.
- ADMIN_SESSION_SECRET must be non-default and strong.

Start backend:

```bash
npm start
```

Backend runs at http://localhost:5000

### 2) Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

### 3) Optional Seed Data

```bash
cd backend
npm run seed:reset
```

## Available Scripts

### Backend (backend/package.json)

- npm start: start API server
- npm run dev: start server with nodemon
- npm run seed: seed sample data
- npm run seed:reset: reset and re-seed data

### Frontend (frontend/package.json)

- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview production build

## Authentication and Roles

Default role is public.

Public role can:

- View use case pages
- Read data endpoints

Admin role can:

- Create, update, and delete use cases
- Manage domain media uploads

Admin mode flow:

1. Call unlock endpoint with passcode.
2. Backend issues signed cookie.
3. Protected endpoints require that valid admin cookie.
4. Logout clears admin cookie.

## API Reference

Base URL: http://localhost:5000/api

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /health | API health check |

### Auth

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /auth/me | Return current role |
| POST | /auth/unlock | Unlock admin mode with passcode |
| POST | /auth/logout | Clear admin session |

### Use Cases

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /usecases | List use cases |
| GET | /usecases/summary | Dashboard summary |
| GET | /usecases/domains | Domain filter options |
| GET | /usecases/:id | Get single use case |
| POST | /usecases | Create use case (admin) |
| PUT | /usecases/:id | Update use case (admin) |
| DELETE | /usecases/:id | Delete use case (admin) |
| POST | /usecases/upload-domain-image | Upload domain image (admin) |

### Domain Media

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /domain-media | List domain media |
| POST | /domain-media/upload | Upload domain media images (admin) |
| PUT | /domain-media/:id | Replace one media image (admin) |
| DELETE | /domain-media/:id | Delete media item (admin) |

## Request Flow (High Level)

1. Frontend page triggers a service call.
2. Service calls backend API endpoint.
3. Route forwards to controller.
4. Controller uses service and validation logic.
5. Database module executes SQLite operations.
6. API responds with JSON.
7. UI updates state and feedback messages.

## Storage and Upload Notes

- Database file: backend/usecases.db
- Upload static route: /uploads
- Upload folders:
	- backend/uploads/domain-gallery
	- backend/uploads/domain-images

Repository keeps folder structure and ignores runtime media binaries.

## Troubleshooting

### Frontend cannot call backend

- Check CLIENT_ORIGIN in backend/.env.
- Ensure backend and frontend ports match expected values.

### Admin unlock fails

- Verify ADMIN_PASSCODE is set in backend/.env.
- Restart backend after env changes.

### Backend fails at startup with admin secret/passcode error

- Replace default ADMIN_PASSCODE and ADMIN_SESSION_SECRET values.

## Suggested Reading Order

For quick codebase understanding:

1. backend/src/server.js
2. backend/src/app.js
3. backend/src/routes
4. backend/src/controllers
5. frontend/src/routes/AppRoutes.jsx
6. frontend/src/services
