# MediCore ERP

> **Enterprise Pharmacy & Medical Store Management System**
> Monorepo — Electron Desktop · NestJS Backend · Next.js Admin Panel · Flutter Mobile

---

## Architecture Overview

```
MediCore-ERP/
├── backend/          # NestJS REST API + SQLite/PostgreSQL (Port 3001)
├── desktop/          # Electron + React + TypeScript POS app
├── admin-panel/      # Next.js System Administrator Dashboard (Port 3000)
├── mobile/           # Flutter iOS/Android app
└── shared/           # Common TypeScript types (User, Store, License, etc.)
```

---

## Quick Start

### 1. Install all dependencies
```bash
npm install           # installs root + all workspaces
```

### 2. Start the Backend (required first)
```bash
cd backend
npm run start:dev
```
The API runs at **http://localhost:3001/api**

On first startup, the admin account is **auto-generated** and credentials are printed to the console and saved to `setup.log` in the project root.

> ⚠️ **First Login:** The generated password is temporary. You will be forced to change it on first login.

### 3. Start the Admin Panel
```bash
cd admin-panel
npm run dev
```
Accessible at **http://localhost:3000**

### 4. Start the Desktop App
```bash
cd desktop
npm run start
```

---

## Backend API Reference

All routes are prefixed with `/api`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | Public | Login with username + password |
| `POST` | `/api/auth/change-password` | Public (tempToken) | Mandatory first-login password change |
| `GET` | `/api/stores` | Admin | List all registered stores |
| `POST` | `/api/stores` | Admin | Register a new client store |
| `GET` | `/api/stores/:id` | Admin | Get store details + license |
| `POST` | `/api/stores/:id/suspend` | Admin | Suspend a store |
| `POST` | `/api/stores/:id/activate` | Admin | Activate a store |
| `PUT` | `/api/stores/:id/renew` | Admin | Renew/extend subscription |
| `GET` | `/api/license/:storeId` | Any Auth | Desktop license check |
| `GET` | `/api/users/store/:storeId` | Admin | List store users |
| `POST` | `/api/users` | Admin | Create a store user |
| `PATCH` | `/api/users/:id/deactivate` | Admin | Deactivate a user |

---

## License & Subscription System

- Each store gets a **Basic 30-day license** on registration.
- The **Desktop app checks** license on startup via `GET /api/license/:storeId`.
- If the server is **unreachable**, a **7-day offline grace period** is applied (counted from last successful check).
- After grace period expires, the desktop locks with a **"SOFTWARE LOCKED"** screen.

---

## User Roles

| Role | Access |
|------|--------|
| `Admin` | System administrator (MYMN SAAB) — full cluster control via admin panel |
| `Owner` | Full access to their store's desktop app |
| `Manager` | Store management (no billing settings) |
| `Cashier` | POS sales only |
| `Accountant` | Reports and financial data |

---

## Database

The backend uses **SQLite** by default for local development (zero config).  
Switch to **PostgreSQL** for production by setting `DB_TYPE=postgres` in `backend/.env`.

---

## Environment Variables

### `backend/.env`
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `JWT_SECRET` | *(change this!)* | JWT signing secret |
| `JWT_EXPIRATION` | `24h` | Token expiry |
| `DB_TYPE` | `sqlite` | `sqlite` or `postgres` |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_DATABASE` | `medicore_erp` | PostgreSQL database name |

### `admin-panel/.env.local`
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API URL |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 36 + React 19 + TypeScript |
| Backend | NestJS 11 + TypeORM + bcrypt + JWT |
| Admin Panel | Next.js 15 + Vanilla CSS |
| Mobile | Flutter (Dart) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Shared | TypeScript interfaces |

---

*MediCore ERP – Built for Pakistani pharmacies and medical stores.*
