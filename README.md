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

## 📌 Assumptions

1. **Single-user sessions** — Each user is expected to be logged in from one device/browser at a time. The JWT-based auth does not track or invalidate sessions across multiple devices.
2. **Low-to-moderate traffic** — The application is designed for small-to-medium teams. The in-memory SSE client map and single-server architecture assume fewer than ~1,000 concurrent users.
3. **Neon serverless PostgreSQL** — The database is hosted on Neon. Cold starts may cause the first request after inactivity to be slightly slower (~1-2s). This is a known Neon characteristic, not a bug.
4. **Cloudinary for file storage** — File uploads go directly to Cloudinary. The system assumes a valid Cloudinary account is configured. Without it, all other features still work — only file attachments will fail.
5. **Modern browser support** — The frontend targets modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions). No polyfills are provided for IE11 or legacy browsers.
6. **Due date validation** — Due dates cannot be set in the past (must be today or later). This is by design to prevent backdating tasks.
7. **Admin role is seeded** — The admin user is created via the seed script. There is no self-service admin registration — admin accounts must be created via the database seed or direct DB manipulation.
8. **No email verification** — Signup does not require email verification. This was scoped out to focus on core task management functionality.

## ⚖️ Trade-offs

| Decision | What we chose | Alternative | Why |
|----------|--------------|-------------|-----|
| **Auth storage** | HTTP-only cookies | localStorage / sessionStorage | Cookies are immune to XSS token theft. The trade-off is added CORS complexity (`credentials: true`, `sameSite` settings) and inability to read the token in client-side JS. Security outweighs convenience. |
| **Real-time updates** | Server-Sent Events (SSE) | WebSockets | SSE is simpler, works over HTTP/1.1, requires no special server setup, and is sufficient for one-way server→client notifications. WebSockets would be overkill for "task updated" events since the client never pushes real-time data to the server. |
| **In-memory SSE store** | `Map<string, SSEClient>` | Redis Pub/Sub | An in-memory map is simple and zero-dependency. The trade-off is that it only works on a single server instance. If horizontal scaling is needed, Redis Pub/Sub would be required. For the current scope, single-server is sufficient. |
| **Express 5 type casts** | `as any` with comments | Downgrade to Express 4 / custom type wrappers | Express 5 has stricter middleware types that community packages haven't fully adopted. We used documented `as any` casts rather than writing complex generic wrappers. The runtime behavior is correct — only the TypeScript types are mismatched. |
| **Prisma with Neon adapter** | `@prisma/adapter-pg` | Direct Prisma connection string | Neon's serverless architecture requires the adapter pattern for connection pooling. This adds a constructor cast (`as any`) but is Prisma's own recommended approach for serverless databases. |
| **CSS Modules** | Scoped CSS Modules | Tailwind CSS / styled-components | CSS Modules provide scoped styles without a runtime cost and keep full CSS flexibility. The trade-off is more verbose class definitions compared to utility-first approaches like Tailwind. |
| **No pagination caching** | Refetch on every filter/page change | React Query / SWR caching | Keeps the codebase simpler with fewer dependencies. The trade-off is redundant API calls when revisiting previously loaded pages. For small datasets this is negligible. |
| **Single monorepo** | One Git repo for frontend + backend | Separate repos | Simpler to manage, deploy, and review for a project of this size. The trade-off is tighter coupling and larger clone size. Separate repos would make sense at enterprise scale. |
| **Rate limiting (in-memory)** | `express-rate-limit` default store | Redis-backed store | The default in-memory store works on a single server and resets on restart. For multi-instance deployments, a Redis store would be needed to share rate limit counters. |
| **No refresh tokens** | Single JWT with 7-day expiry | Access + refresh token rotation | Simplifies auth flow. The trade-off is that token revocation requires waiting for expiry (no instant logout from all devices). Refresh token rotation would add security but significantly increase complexity. |

## 📄 License

ISC
