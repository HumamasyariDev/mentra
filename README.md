# Mentra - Gamified Productivity App

A gamified productivity web application built with Laravel 12 (API) and React + Tailwind CSS.

## Tech Stack

- **Backend**: Laravel 12, Sanctum Auth, MySQL
- **Frontend**: React 19, Tailwind CSS v4, TanStack Query, React Router, Lucide Icons
- **Build**: Vite

## Project Structure

```
mentra/
├── backend/          # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API Controllers
│   │   ├── Models/                  # Eloquent Models
│   │   └── Services/                # Business Logic
│   ├── database/migrations/         # DB Migrations
│   └── routes/api.php               # API Routes
├── frontend/         # React SPA
│   ├── src/
│   │   ├── contexts/    # Auth Context
│   │   ├── layouts/     # App & Auth Layouts
│   │   ├── pages/       # Page Components
│   │   ├── services/    # API Service Layer
│   │   └── hooks/       # Custom Hooks
│   └── vite.config.js
└── context-engineering/ # Project context docs
```

## Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL

### Backend Setup

```bash
cd backend

# Copy env and configure database
cp .env.example .env
# Edit .env → set DB_DATABASE=mentra, DB_USERNAME, DB_PASSWORD

# Generate app key
php artisan key:generate

# Create database
mysql -u root -e "CREATE DATABASE mentra;"

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

## MVP Features

1. **Authentication** - Register, Login, Logout (Sanctum tokens)
2. **Task Management** - CRUD, complete tasks, earn EXP
3. **Pomodoro Focus Timer** - Start/Pause/Stop, session history, earn EXP
4. **Schedule System** - Daily/Weekly/Monthly routines, earn EXP
5. **Mood Tracking** - Daily mood + energy level + notes
6. **EXP & Streak System** - Level up, track streaks, gamification

## API Endpoints

### Auth
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

### Dashboard
- `GET /api/dashboard`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `POST /api/tasks/{id}/complete`

### Pomodoro
- `GET /api/pomodoro`
- `GET /api/pomodoro/stats`
- `POST /api/pomodoro/start`
- `POST /api/pomodoro/{id}/pause`
- `POST /api/pomodoro/{id}/resume`
- `POST /api/pomodoro/{id}/complete`
- `POST /api/pomodoro/{id}/cancel`

### Schedules
- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/{id}`
- `PUT /api/schedules/{id}`
- `DELETE /api/schedules/{id}`
- `POST /api/schedules/{id}/complete`

### Moods
- `GET /api/moods`
- `POST /api/moods`
- `GET /api/moods/today`
- `GET /api/moods/weekly`
- `GET /api/moods/{id}`
