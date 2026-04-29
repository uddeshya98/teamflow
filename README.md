# TaskFlow — Team Task Manager

A full-stack task management application built for teams. Supports role-based access control (Admin/Member), project management, task assignment, and real-time dashboard analytics.

## Live Demo

- **Frontend**: [Vercel URL — TBD after deployment]
- **Backend API**: [Railway URL — TBD after deployment]

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS v4
- Axios (HTTP client)
- React Router DOM v6
- React Context API (state management)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT authentication
- bcryptjs (password hashing)
- helmet, cors, express-rate-limit (security)
- morgan (logging)

## Features

- **Authentication** — Register and login with JWT-based auth
- **Role-Based Access** — Admin and Member roles with different permissions
- **Project Management** — Create, update, delete projects (Admin)
- **Team Management** — Add/remove members to projects (Admin)
- **Task Management** — Create, assign, update, delete tasks
- **Status Tracking** — Todo / In Progress / Done workflow
- **Overdue Detection** — Automatic overdue flagging for past-due tasks
- **Dashboard** — Real-time stats (total, completed, pending, overdue)
- **Responsive UI** — Dark theme with glassmorphism, works on mobile

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login | Public |
| GET | `/me` | Get current user | Protected |

### Users (`/api/users`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | List all users | Admin |
| GET | `/:id` | Get user by ID | Admin |

### Projects (`/api/projects`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| POST | `/` | Create project | Admin |
| GET | `/` | List projects | Protected |
| GET | `/:id` | Get project | Protected |
| PUT | `/:id` | Update project | Admin |
| DELETE | `/:id` | Delete project | Admin |
| POST | `/:id/members` | Add member | Admin |
| DELETE | `/:id/members/:userId` | Remove member | Admin |

### Tasks (`/api/tasks`)
| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| POST | `/` | Create task | Admin |
| GET | `/` | List tasks (with filters) | Protected |
| GET | `/dashboard` | Dashboard stats | Protected |
| GET | `/:id` | Get task | Protected |
| PUT | `/:id` | Update task | Protected* |
| DELETE | `/:id` | Delete task | Admin |

*Members can only update the `status` field of tasks assigned to them.

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | password123 |
| Member | member@test.com | password123 |

## Deployment

### Backend (Railway)
1. Push code to GitHub
2. Connect repo to Railway
3. Set root directory to `/backend`
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV=production`, `CLIENT_URL`
5. Deploy

### Frontend (Vercel)
1. Connect repo to Vercel
2. Set root directory to `/frontend`
3. Set build command: `npm run build`, output: `dist`
4. Add environment variable: `VITE_API_URL=<your-railway-url>/api`
5. Deploy
