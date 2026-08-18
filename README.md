# Use Case Management System

Manage enterprise use cases and domain media with a simple full-stack app.

## What This Project Includes

- UI app built with React + Vite
- Backend API built with Node.js + Express
- SQLite database (using Node built-in `node:sqlite`)
- Public mode and Admin mode

## Main Features

- View use cases with search, sort, pagination, and details
- Admin can create, edit, and delete use cases
- Admin can upload and manage domain media
- Dashboard pages with summary insights

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Framer Motion |
| Backend | Node.js, Express, Multer, CORS |
| Database | SQLite (`node:sqlite`) |

### Version Details

#### Frontend

| Package | Version |
|---|---|
| react | 18.3.1 |
| react-dom | 18.3.1 |
| vite | 5.4.8 |
| @vitejs/plugin-react | 4.3.1 |
| tailwindcss | 3.4.13 |
| postcss | 8.4.47 |
| autoprefixer | 10.4.20 |
| react-router-dom | 6.26.2 |
| framer-motion | 13.1.0 |
| lucide-react | 1.29.0 |
| react-select | 5.10.2 |

#### Backend

| Package | Version |
|---|---|
| node.js | 20+ recommended |
| express | 4.21.0 |
| cors | 2.8.5 |
| dotenv | 17.2.1 |
| multer | 2.2.0 |
| nodemon (dev) | 3.1.4 |

#### Database

| Component | Details |
|---|---|
| sqlite engine | Node built-in `node:sqlite` |
| external sqlite npm package | Not required |

## Folder Structure (Simple View)

- `frontend/` -> React app
- `backend/` -> API server

Both folders have their own dependencies. Install each one separately.

## Prerequisites

- Node.js 20+
- npm

## Quick Setup (Local Development)

### 1) Setup Backend

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

Now edit `backend/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_PASSCODE=choose-a-strong-passcode
ADMIN_SESSION_SECRET=choose-a-long-random-secret
```

Important security notes:

- Do not use weak passcodes like `admin123`
- Use a long random value for `ADMIN_SESSION_SECRET`

Start backend:

```bash
npm start
```

Backend URL: `http://localhost:5000`

### 2) Setup Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

### 3) (Optional) Add Seed Data

```bash
cd backend
npm run seed:reset
```

## After Deployment: Start and Test (Beginner Friendly)

Use these steps on your server/VM after code is deployed.

### Step 1: Go to project root

```bash
cd usecase-management-system
```

### Step 2: Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### Step 3: Configure backend env

Create and edit `backend/.env` with real values:

```env
PORT=5000
CLIENT_ORIGIN=https://your-frontend-domain.com
ADMIN_PASSCODE=your-strong-passcode
ADMIN_SESSION_SECRET=your-long-random-secret
```

Create and edit `frontend/.env`:

```env
VITE_API_ORIGIN=https://your-api-domain.com
VITE_API_PATH=/api
# Optional override (full URL):
# VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Step 4: Start backend

```bash
npm --prefix backend start
```

### Step 5: Build frontend

```bash
npm --prefix frontend run build
```

### Step 6: Start frontend preview

```bash
npm --prefix frontend run preview
```

## How To Test the App (Step by Step)

### 1. Check backend health

Open in browser:

`https://your-api-domain.com/api/health`

Expected: JSON response with success/health message.

### 2. Check frontend loads

Open your frontend URL.

Expected: Home page/dashboard opens without crash.

### 3. Check public data

Open use case list page.

Expected: Use cases are visible.

### 4. Check admin unlock

Login/unlock admin mode using `ADMIN_PASSCODE`.

Expected: Admin-only actions become available.

### 5. Check create/edit/delete

Create one test use case, edit it, then delete it.

Expected: All 3 operations succeed.

### 6. Check media upload

Upload one domain image and one gallery image.

Expected: Files appear in UI and backend upload folders.

### 7. Check logout and permissions

Logout admin and try to edit/create again.

Expected: Request is blocked for public user.

## Icons Legend (Quick Understanding)

- 🚀 Start command
- 🛠 Setup step
- 🧪 Testing step
- 🔐 Security setting
- 📁 Folder/location
- ✅ Expected successful result
- ❌ Something failed, check troubleshooting

## Useful Scripts

### Backend (`backend/package.json`)

- `npm start` -> start API server
- `npm run dev` -> start with nodemon
- `npm run seed` -> seed sample data
- `npm run seed:reset` -> reset + seed

### Frontend (`frontend/package.json`)

- `npm run dev` -> start Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview built frontend

## Authentication Basics

### Public user can

- View use cases and details

### Admin user can

- Create, edit, delete use cases
- Upload and manage media

Admin flow:

1. Send passcode to unlock endpoint
2. Backend sets signed HTTP-only cookie
3. Protected APIs allow access with valid cookie
4. Logout clears cookie

## API Base URL

`http://localhost:5000/api`

### Core Endpoints

- `GET /health`
- `GET /auth/me`
- `POST /auth/unlock`
- `POST /auth/logout`
- `GET /usecases`
- `GET /usecases/:id`
- `POST /usecases` (admin)
- `PUT /usecases/:id` (admin)
- `DELETE /usecases/:id` (admin)
- `GET /domain-media`
- `POST /domain-media/upload` (admin)

## Storage Notes

- Database file: `backend/usecases.db`
- Upload route: `/uploads`
- Upload folders:
  - `backend/uploads/domain-gallery`
  - `backend/uploads/domain-images`

## Troubleshooting

### Frontend cannot call backend

- Check `CLIENT_ORIGIN` in `backend/.env`
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Check backend and frontend ports for local development

### Admin unlock fails

- Verify `ADMIN_PASSCODE` in `backend/.env`
- Restart backend after env changes

### Backend fails on startup with secret/passcode error

- Replace weak/default values in env

## Beginner Tip: Read Code in This Order

1. `backend/src/server.js`
2. `backend/src/app.js`
3. `backend/src/routes`
4. `backend/src/controllers`
5. `frontend/src/routes/AppRoutes.jsx`
6. `frontend/src/services`
