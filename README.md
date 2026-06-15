# TaskFlow — Full-Stack Task Management Application

A modern, full-stack task management application built with **Next.js** (frontend) and **Node.js + Express** (backend), featuring real-time updates, role-based access control, file attachments, and a polished dark-mode UI.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, CSS Modules |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | JWT (HTTP-only cookies), bcrypt |
| **File Storage** | Cloudinary |
| **Real-time** | Server-Sent Events (SSE) |
| **Containerization** | Docker, Docker Compose |

## 📁 Project Structure

```
Rival/
├── backend/               # Express API server
│   ├── src/
│   │   ├── config/        # Environment configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── lib/           # Prisma client singleton
│   │   ├── middleware/     # Auth, validation, error handling, rate limiting
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic layer
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # JWT, password, cookie, API response helpers
│   │   ├── validators/    # Zod validation schemas
│   │   └── index.ts       # App entry point
│   ├── prisma/            # Schema, migrations, seed
│   ├── tests/             # Jest unit tests
│   └── Dockerfile
├── frontend/              # Next.js UI
│   ├── src/
│   │   ├── app/           # App Router pages & layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth, Theme, Toast providers
│   │   ├── hooks/         # Custom hooks (useTasks, useSSE, useDebounce)
│   │   ├── lib/           # API client, utility functions
│   │   └── types/         # TypeScript interfaces
│   └── public/
└── docker-compose.yml     # Full-stack Docker setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Neon / Docker)
- Cloudinary account (for file uploads)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Rival

# Backend
cd backend
npm install
cp .env.example .env    # Edit with your credentials

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="your-secret-key-at-least-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev    # Run migrations
npm run seed              # Seed sample data
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev               # http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev               # http://localhost:3000
```

### 5. Docker (Alternative)

```bash
# From project root
docker-compose up --build
# Backend: http://localhost:5000
# Frontend: Run separately (npm run dev in frontend/)
```

## 🔑 Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | password123 |
| User | user@test.com | password123 |

## ✨ Features

### Core
- ✅ Full CRUD for tasks (create, read, update, delete)
- ✅ Status management (Todo → In Progress → Done)
- ✅ Priority levels (Low, Medium, High)
- ✅ Due date tracking with validation
- ✅ Pagination, search by title, sort by multiple fields
- ✅ Status filtering with combined search + sort + filter

### Authentication & Security
- ✅ JWT auth via HTTP-only cookies (XSS-safe)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Rate limiting on auth endpoints
- ✅ Helmet security headers
- ✅ Input validation on all endpoints (Zod)
- ✅ Role-based access control (User / Admin)

### UI/UX
- ✅ Responsive design (mobile-first, 320px+)
- ✅ Dark/Light mode with persisted preference
- ✅ Optimistic UI updates (no loading flicker)
- ✅ List + Grid view toggle
- ✅ Toast notifications
- ✅ Glassmorphism design with animated landing page

### Advanced
- ✅ Real-time updates via SSE (Server-Sent Events)
- ✅ File attachments via Cloudinary
- ✅ Activity log / audit trail per task
- ✅ Admin dashboard (view all users' tasks)
- ✅ Error boundaries for crash recovery

## 🧪 Running Tests

```bash
cd backend
npm test
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, sets cookie |
| POST | `/api/auth/logout` | Yes | Clears cookie |
| GET | `/api/auth/me` | Yes | Current user info |
| GET | `/api/tasks` | Yes | List tasks (paginated, filterable) |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/:id` | Yes | Get task detail |
| PATCH | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| POST | `/api/tasks/:id/attachments` | Yes | Upload file |
| DELETE | `/api/tasks/:id/attachments/:aid` | Yes | Delete file |
| GET | `/api/tasks/:id/activity` | Yes | Get activity log |
| GET | `/api/events` | Yes | SSE stream |
| GET | `/api/admin/tasks` | Admin | All users' tasks |
| GET | `/api/health` | No | Health check + DB status |

## 📄 License

ISC
