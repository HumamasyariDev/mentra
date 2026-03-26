# Mentra - Product Specification Document

**Version:** 1.0.0
**Last Updated:** March 26, 2026
**Domain:** https://mentra.page
**Repository:** https://github.com/HumamasyariDev/mentra (branch: `dev`)

---

## 1. Product Overview

Mentra is a gamified productivity web application that transforms everyday task management into an engaging experience. Users complete tasks, earn XP, level up, maintain streaks, and grow a virtual forest — creating a self-reinforcing loop that turns discipline into a visible, rewarding journey.

The core philosophy is the **Productivity Loop**: Check off tasks → Earn XP → Level up → Grow your forest.

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 7.3 | Build tool / dev server |
| React Router DOM | 7.13 | Client-side routing |
| TanStack React Query | 5.90 | Server state management |
| GSAP | 3.14 | Animations (scroll-triggered, page transitions) |
| Axios | 1.13 | HTTP client |
| i18next / react-i18next | 25.10 / 16.6 | Internationalization (EN/ID) |
| Lucide React | 0.563 | Icon library |
| React Hook Form | 7.71 | Form handling |
| React Markdown + remark-gfm | 10.1 | Markdown rendering in chat/forum |
| pdfjs-dist | 5.5 | PDF parsing (sandbox file uploads) |
| Mammoth | 1.12 | DOCX parsing (sandbox file uploads) |
| JSZip | 3.10 | ZIP file handling |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| PHP | 8.2+ | Runtime |
| Laravel | 12.0 | Framework |
| Laravel Sanctum | 4.3 | API token authentication |
| Laravel Socialite | 5.25 | Social OAuth (Google) |
| MySQL | - | Primary database |

### AI
| Provider | Model | Purpose |
|---|---|---|
| NVIDIA API | `meta/llama-3.1-8b-instruct` | All AI features (chat, agent, quiz generation, journal insights, sandbox, mind maps) |

### Infrastructure
| Component | Detail |
|---|---|
| VPS | Custom server |
| Web Server | Apache (XAMPP) |
| Domain | https://mentra.page |
| Build Output | `frontend/dist/` served as SPA |

---

## 3. Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                   │
│  React SPA → Lazy-loaded routes → Vite-built chunks  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS (Axios)
                        ▼
┌─────────────────────────────────────────────────────┐
│              Laravel API (Sanctum Auth)               │
│  Controllers → Services → Models → MySQL              │
│                    │                                  │
│                    ▼                                  │
│          NvidiaAIService → NVIDIA API                 │
│          (meta/llama-3.1-8b-instruct)                │
└─────────────────────────────────────────────────────┘
```

### 3.2 Frontend Architecture

```
src/
├── agents/               # AI Agent (LangChain-style tool use)
├── components/
│   ├── dashboard/        # Map viewport, floating UI, sidebar
│   ├── landing/          # Landing page sections (lazy-loaded)
│   └── TransitionWrapper # Page transition overlay
├── contexts/             # React contexts (7 providers)
│   ├── AuthContext        # JWT auth state + user data
│   ├── ThemeContext        # Dark/light mode
│   ├── ToastContext        # Global toast notification system
│   ├── DashboardUIContext  # Dashboard mode (map vs simplified)
│   └── PageTransitionContext # Route transition animations
├── hooks/                # Custom hooks (6)
├── i18n/                 # EN + ID translations (18 namespaces)
├── layouts/              # AuthLayout, AppLayout, ForestLayout
├── pages/                # 20 page components (all lazy-loaded)
├── services/             # API client (Axios + interceptors)
└── styles/               # CSS modules (theme system, no Tailwind runtime)
```

### 3.3 Code Splitting Strategy

All pages are lazy-loaded via `React.lazy()` at the route level. The landing page further lazy-loads below-the-fold sections (GamificationLoop, FeatureShowcase, ForestShowcase, TechStack, FAQ, CTAFooter, Footer). The dashboard map component (`MapViewport`) is also lazy-loaded.

**Bundle split result:**
- Core bundle: ~70 KB (router + shared libs)
- Vendor chunk: ~454 KB (React, GSAP, etc. — cached)
- Per-page chunks: 3–53 KB each (loaded on demand)

### 3.4 Theme System

CSS custom properties defined in `theme.css` with two modes:
- `:root` — Dark mode (default)
- `[data-theme="light"]` — Light mode

Key design tokens:
- `--accent: #6366f1` (Indigo primary)
- `--accent-light: #818cf8`
- `--accent-dark: #4f46e5`
- Semantic: `--success`, `--danger`, `--warning`, `--info`, `--purple`, `--orange`

### 3.5 Internationalization

Dual-language support via i18next:
- **English (en)** — Default
- **Indonesian (id)** — User's primary language

18 translation namespaces covering all pages and features.

---

## 4. Data Models

### 4.1 Entity Relationship Summary

```
User (1)─────(*)  Task
  │                 ├── type: daily | weekly | monthly | one-time
  │                 ├── priority: low | medium | high
  │                 ├── status: pending | in_progress | completed
  │                 ├── exp_reward: int
  │                 └──(1) Quiz ──(*) QuizAttempt
  │
  ├───(*)  PomodoroSession
  │          ├── duration_minutes, break_minutes
  │          ├── status: active | paused | completed | cancelled
  │          └── exp_reward: int
  │
  ├───(*)  Schedule
  │          ├── type: daily | weekly | monthly
  │          ├── days_of_week: json array
  │          ├── start_time, end_time
  │          └──(*) ScheduleCompletion
  │
  ├───(*)  Journal
  │          ├── date: date
  │          └── content: text
  │
  ├───(*)  Mood (legacy)
  │
  ├───(1)  Streak
  │          ├── current_streak: int
  │          ├── longest_streak: int
  │          └── last_activity_date: date
  │
  ├───(*)  Tree
  │          ├── tree_type_id → TreeType
  │          ├── stage: 1-5
  │          ├── water_progress: int
  │          ├── is_active / is_withered / is_permanent: bool
  │          ├── last_watered_at, next_water_at: datetime
  │          └── archive_waterings: int
  │
  ├───(*)  Sandbox ──(*) SandboxMessage
  │
  ├───(*)  ForumMessage
  │          ├── title, content
  │          ├── reply_to_id (self-referencing)
  │          └── is_edited: bool
  │
  ├───(*)  ChatSession ──(*) AgentMessage
  │
  ├───(*)  ExpLog (polymorphic: sourceable)
  │          ├── amount: int
  │          ├── source: string
  │          └── sourceable_type/id → Task | PomodoroSession | Schedule
  │
  └───(*)  KnowledgeBase
             ├── content: text
             ├── metadata: json
             ├── source: string
             └── embedding: vector (pgvector)
```

### 4.2 User Model

| Field | Type | Description |
|---|---|---|
| name | string | Display name |
| email | string | Unique, used for login |
| password | string (hashed) | Bcrypt via Laravel |
| provider / provider_id | string | OAuth provider (Google) |
| level | int | Current level (starts at 1) |
| total_exp | int | Lifetime XP earned |
| current_exp | int | XP in current level |
| watering_cans | int | Currency for forest watering |
| avatar | string | Avatar URL |
| is_admin | bool | Admin flag |

**Leveling formula:** `exp_to_next_level = level * 100`

### 4.3 Tree Model

| Field | Type | Description |
|---|---|---|
| stage | int (1-5) | Growth stage (5 = final) |
| water_progress | int | Waterings applied at current stage |
| is_active | bool | Currently growing (only 1 at a time) |
| is_withered | bool | Died from neglect |
| is_permanent | bool | Cannot wither |
| last_watered_at | datetime | For wither calculation |
| next_water_at | datetime | Cooldown timer |

**Wither rules:**
- Active trees wither after **48 hours** without watering
- Archived trees wither after **7 days** (168 hours)
- 24-hour rescue window after withering
- Permanent trees never wither

**TreeType** defines cost per stage via `stage_costs` JSON array (e.g., `[5, 10, 15, 20, 25]`).

---

## 5. Feature Specifications

### 5.1 Authentication

| Feature | Detail |
|---|---|
| Registration | Email + password with OTP verification |
| Login | Email/password via Laravel Sanctum (token-based) |
| OAuth | Google login via Laravel Socialite |
| Password Reset | OTP-based forgot password flow |
| Profile Management | Update name (via sidebar panel) |
| Account Deletion | Hard delete with confirmation |
| Session | Bearer token stored in localStorage |

**API Endpoints:**
- `POST /api/register` — Register new user
- `POST /api/login` — Login, returns Sanctum token
- `POST /api/auth/send-otp` — Send email OTP
- `POST /api/auth/verify-otp` — Verify OTP
- `POST /api/auth/forgot-password` — Initiate password reset
- `POST /api/auth/reset-password` — Complete password reset
- `POST /api/logout` — Revoke token
- `GET /api/me` — Get authenticated user
- `PUT /api/user/profile` — Update profile
- `DELETE /api/user/account` — Delete account

### 5.2 Dashboard

Two display modes (desktop only; mobile always uses simplified):

**Map Mode (Interactive Galaxy)**
- Full-screen cosmic map with planet-shaped navigation nodes
- Each planet represents a feature: Tasks, Pomodoro, Forest, Schedule, AI Chat, Forum
- GSAP-powered zoom-in animation on planet click → page transition
- Floating UI overlay: level, XP bar, streak counter, daily tasks completed
- Lazy-loaded `MapViewport` component (code-split)

**Simplified Mode**
- Card-based dashboard with stats overview
- Task summary, Pomodoro stats, streak info, today's schedule
- Profile card with dynamic forest tree visualization

**API:** `GET /api/dashboard` — Returns aggregated user stats, task counts, pomodoro stats, streak, today's mood/journal, recent XP, today's schedules.

### 5.3 Task Management

Full-featured task system with multiple views and AI-powered quizzes.

| Feature | Detail |
|---|---|
| CRUD | Create, read, update, delete tasks |
| Types | daily, weekly, monthly, one-time |
| Priority | low, medium, high (color-coded) |
| Status | pending, in_progress, completed |
| Due Date | Date picker with overdue indicators |
| Completion | Marks as completed, awards XP, updates streak |
| Views | List, Calendar, Board (Kanban) |
| XP Rewards | Based on task type and priority |

**AI Quiz System:**
- Attach study material to a task
- AI generates multiple-choice quiz questions from the material
- Users attempt quizzes, earn bonus XP for correct answers
- Key point extraction from study material

**API Endpoints:**
- `GET/POST /api/tasks` — List / create
- `GET/PUT/DELETE /api/tasks/{id}` — Show / update / delete
- `POST /api/tasks/{id}/complete` — Complete task (awards XP)
- `POST /api/tasks/{id}/uncomplete` — Revert completion
- `GET /api/tasks/{id}/quiz` — Get quiz for task
- `POST /api/tasks/{id}/quiz` — Generate quiz
- `POST /api/tasks/{id}/quiz/attempt` — Submit quiz attempt

### 5.4 Pomodoro Timer

Focus session timer with break cycles and XP rewards.

| Feature | Detail |
|---|---|
| Timer | Customizable duration (default 25 min) |
| Breaks | Configurable break duration |
| Controls | Start, pause, resume, complete, cancel |
| Link to Task | Optional task association |
| XP Reward | Earned on session completion |
| Watering Can | Earned on completion (used for forest) |
| Stats | Today's sessions, minutes, total sessions |

**API Endpoints:**
- `GET /api/pomodoro` — List sessions
- `GET /api/pomodoro/stats` — Session statistics
- `POST /api/pomodoro/start` — Start session
- `POST /api/pomodoro/{id}/pause` — Pause
- `POST /api/pomodoro/{id}/resume` — Resume
- `POST /api/pomodoro/{id}/complete` — Complete (awards XP + watering can)
- `POST /api/pomodoro/{id}/cancel` — Cancel

### 5.5 Schedule Management

Recurring schedule system with completion tracking.

| Feature | Detail |
|---|---|
| Types | daily, weekly, monthly |
| Time Range | start_time, end_time |
| Recurrence | days_of_week (JSON array), day_of_month |
| Active Toggle | Enable/disable schedules |
| Completion | Per-date completion tracking |
| XP Reward | Earned on schedule completion |

**API Endpoints:**
- `GET/POST /api/schedules` — List / create
- `GET/PUT/DELETE /api/schedules/{id}` — Show / update / delete
- `POST /api/schedules/{id}/complete` — Mark complete for today
- `POST /api/schedules/{id}/uncomplete` — Revert

### 5.6 Journal + AI Insights

Daily journal with AI-powered mood analysis.

| Feature | Detail |
|---|---|
| Daily Entry | One journal entry per date |
| Date Picker | Navigate to any date for writing/reading |
| AI Insights | AI analyzes journal entries for mood patterns |
| Recent Entries | View past journal entries |

**API Endpoints:**
- `GET /api/journals` — List all journals
- `POST /api/journals` — Create/update entry
- `GET /api/journals/today` — Today's entry
- `GET /api/journals/by-date?date=YYYY-MM-DD` — Entry by date
- `GET /api/journals/recent` — Recent entries
- `GET /api/journals/insights` — AI mood insights

### 5.7 Forest (Tree Care)

Virtual forest that grows through Pomodoro-earned watering cans.

| Feature | Detail |
|---|---|
| Plant | Start a new tree (costs watering cans) |
| Water | Use watering cans to advance tree stages |
| Growth Stages | 5 stages: seed → sprout → young → mature → final |
| Tree Types | Different species with different stage costs |
| Active Tree | Only one tree can be actively growing |
| Archive | Completed trees become forest decorations |
| Wither | Trees die without regular watering |
| Rescue | 24-hour window to revive withered trees |
| Permanent | Special trees that never wither |
| Background | Archived trees render as background forest |

**Stage cost example** (pine_purple): `[5, 10, 15, 20, 25]` watering cans per stage.

**API Endpoints:**
- `GET /api/forest` — Get forest state (active tree + archived trees)
- `POST /api/forest/plant` — Plant new tree
- `POST /api/forest/water/{tree}` — Water a tree
- `GET /api/forest/tree-types` — Available tree types

### 5.8 AI Agent (Mentra AI)

Conversational AI assistant with tool-use capabilities.

| Feature | Detail |
|---|---|
| Chat | Natural conversation in Indonesian/English |
| Task Creation | Agent parses intent → creates tasks via API |
| Knowledge Search | Vector similarity search on knowledge base |
| Session Management | Multiple chat sessions, persistent history |
| Action Parsing | Detects JSON action blocks in AI responses |

**Agent Actions:**
1. `create_task` — Parses user intent (title, deadline, difficulty) and creates a task
2. `search_knowledge` — Embeds query and searches knowledge base via cosine similarity

**API Endpoints:**
- `POST /api/ai/agent` — Agent chat with history
- `POST /api/agent/tasks` — Create task via agent
- `POST /api/agent/vector-search` — Knowledge base search
- `POST /api/agent/knowledge` — Add to knowledge base
- `GET/POST /api/chat-sessions` — Session CRUD
- `GET/POST /api/chat-sessions/{id}/messages` — Message CRUD

### 5.9 Sandbox (AI Brainstorming)

Open-ended AI chat rooms for brainstorming and learning.

| Feature | Detail |
|---|---|
| Multiple Rooms | Create named sandbox sessions |
| Chat | Free-form AI conversation |
| File Upload | Upload PDF, DOCX files for AI analysis |
| Mind Map | AI generates visual mind maps from conversations |
| Key Points | Extract key points from uploaded material |

**API Endpoints:**
- `GET/POST /api/sandboxes` — List / create sandbox
- `GET/PUT/DELETE /api/sandboxes/{id}` — Show / update / delete
- `POST /api/sandboxes/{id}/messages` — Send message
- `POST /api/ai/sandbox` — AI sandbox chat
- `POST /api/ai/mindmap` — Generate mind map
- `POST /api/ai/extract-key-points` — Extract key points

### 5.10 Forum

Community discussion board.

| Feature | Detail |
|---|---|
| Posts | Create posts with title and content |
| Replies | Threaded replies (self-referencing `reply_to_id`) |
| Edit/Delete | Edit own posts, mark as edited |
| Markdown | Content rendered as Markdown |

**API Endpoints:**
- `GET /api/posts` — List posts
- `POST /api/posts` — Create post
- `PUT /api/posts/{id}` — Update post
- `DELETE /api/posts/{id}` — Delete post

### 5.11 Gamification System

Cross-cutting progression system.

| Component | Detail |
|---|---|
| XP (Experience) | Earned from tasks, pomodoro, schedules, quizzes |
| Levels | `exp_to_next_level = level * 100` |
| Streaks | Consecutive days of activity (current + longest) |
| Watering Cans | Currency earned from Pomodoro, spent in Forest |
| ExpLog | Polymorphic audit trail of all XP earnings |

**XP Sources:**
- Task completion (based on priority/type)
- Pomodoro session completion
- Schedule completion
- Quiz correct answers

### 5.12 Toast Notification System

Global notification system available across all pages.

| Feature | Detail |
|---|---|
| Variants | success, error, warning, info |
| Placement | Top-right corner |
| Auto-dismiss | Configurable duration |
| API | `useToast()` hook from `ToastContext` |

---

## 6. AI Integration

All AI calls route through the backend `NvidiaAIService` to keep the API key server-side.

### 6.1 Endpoints

| Endpoint | Purpose | Temperature |
|---|---|---|
| `POST /api/ai/chat` | Simple single-message chat | 0.7 |
| `POST /api/ai/agent` | Agent chat with history + action parsing | 0.7 |
| `POST /api/ai/sandbox` | Sandbox brainstorming chat | 0.8 |
| `POST /api/ai/quiz/generate` | Generate quiz from study material | 0.5 |
| `POST /api/ai/extract-key-points` | Extract key learning points | 0.7 |
| `POST /api/ai/mindmap` | Generate mind map structure | 0.6 |

### 6.2 System Prompts

- **Default Chat:** Mentra AI as productivity assistant, bilingual (ID/EN)
- **Agent:** Structured prompt with JSON action formats, date conversion rules (besok, lusa, minggu depan), difficulty mapping (mudah→Easy, sedang→Medium, sulit→Hard)
- **Quiz Generator:** Outputs JSON array of MCQ questions
- **Mind Map:** Outputs JSON with nodes (id, label, x, y) and edges (source, target)

---

## 7. Page Map

| Route | Page | Auth | Layout |
|---|---|---|---|
| `/` | Landing Page | No | None (standalone) |
| `/login` | Login | No | AuthLayout |
| `/register` | Register | No | Standalone |
| `/reset-password` | Reset Password | No | AuthLayout |
| `/auth/callback` | OAuth Callback | No | None |
| `/terms-of-service` | Terms of Service | No | Standalone |
| `/privacy-policy` | Privacy Policy | No | Standalone |
| `/dashboard` | Dashboard | Yes | AppLayout |
| `/tasks` | Task Management | Yes | AppLayout |
| `/pomodoro` | Pomodoro Timer | Yes | AppLayout |
| `/schedules` | Schedule Manager | Yes | AppLayout |
| `/journal` | Journal + AI Insights | Yes | AppLayout |
| `/mood` | Mood Tracker (legacy) | Yes | AppLayout |
| `/forest` | Forest Tree Care | Yes | ForestLayout |
| `/agent` | AI Agent Chat | Yes | AppLayout |
| `/sandbox` | Sandbox List | Yes | AppLayout |
| `/sandbox/:id` | Sandbox Chat | Yes | AppLayout |
| `/forum` | Community Forum | Yes | AppLayout |
| `/settings` | Settings | Yes | AppLayout |

---

## 8. Landing Page Sections

| Section | Component | Description |
|---|---|---|
| Cosmic Background | LandingPage.jsx | Fixed parallax stars, shooting stars, orbital rings, planet decorations |
| Navbar | Navbar.jsx | Sticky nav with logo, language switcher, CTA |
| Hero | Hero.jsx | Word-by-word GSAP title reveal, CTA buttons, scroll indicator |
| How It Works | GamificationLoop.jsx | Vertical timeline with alternating cards, GSAP scroll animations |
| Feature Showcase | FeatureShowcase.jsx | Stacked card scroll animation showing app screenshots |
| Forest Showcase | ForestShowcase.jsx | Animated forest scene with swaying trees |
| Tech Stack | TechStack.jsx | Marquee of technology logos |
| FAQ | FAQ.jsx | Accordion FAQ section |
| CTA Footer | CTAFooter.jsx | Final call-to-action with gradient button |
| Footer | Footer.jsx | Minimal footer with legal links |

All sections below Hero are lazy-loaded via `React.lazy()`.

---

## 9. Design System

### 9.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#6366f1` | Primary buttons, active states, links |
| `--accent-light` | `#818cf8` | Hover states, secondary accents |
| `--accent-dark` | `#4f46e5` | Pressed states |
| `--success` | `#10b981` | Success states, forest growth |
| `--danger` | `#ef4444` | Errors, delete actions |
| `--warning` | `#f59e0b` | Warnings, medium priority |
| `--info` | `#3b82f6` | Info states |
| `--purple` | `#8b5cf6` | Quiz/special features |
| `--orange` | `#f97316` | Pomodoro theme |

### 9.2 Landing Page Gradients

| Usage | Gradient |
|---|---|
| CTA Buttons | `linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)` |
| Sidebar Active | `linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)` |
| Section Headings | `linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)` |
| Timeline Line | `linear-gradient(180deg, #a78bfa, #7c3aed, #6d28d9, #4f46e5)` |
| Loop Card Icons | `linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)` |

### 9.3 Typography

- Font: System font stack (no custom fonts loaded)
- Glass-morphism: `backdrop-filter: blur(12px)` on cards
- Letter spacing: Tight (`-0.02em` to `-0.06em`) for headings

### 9.4 Animation

- **Engine:** GSAP 3.14 with ScrollTrigger plugin
- **Pattern:** `useGSAP` hook scoped to component refs
- **Scroll animations:** `toggleActions: 'play none none none'` (play once)
- **Performance:** No `filter: blur()` on scrubbed scroll animations
- **Reduced motion:** Respected via `useReducedMotion()` hook

---

## 10. Security

| Concern | Implementation |
|---|---|
| Authentication | Laravel Sanctum token-based auth |
| API Key Protection | NVIDIA API key stored server-side only, never exposed to frontend |
| CSRF | Sanctum handles CSRF for SPA |
| Input Validation | Laravel form request validation on all endpoints |
| Password Hashing | Bcrypt via Laravel `hashed` cast |
| XSS | React's built-in escaping + Markdown sanitization |
| Authorization | All protected routes behind `auth:sanctum` middleware |
| Account Deletion | Hard delete with confirmation flow |

---

## 11. Performance Optimizations

| Optimization | Detail |
|---|---|
| Code Splitting | All 20 pages lazy-loaded via `React.lazy()` |
| Landing Lazy Sections | Below-fold components lazy-loaded separately |
| Map Lazy Load | `MapViewport` component lazy-loaded |
| Image Loading | `loading="lazy" decoding="async"` on all images |
| CSS Splitting | Per-page CSS chunks (Vite automatic) |
| GSAP Optimization | No `filter: blur()` on scroll-scrubbed animations |
| Memoization | `useMemo` for star elements, planet lists |
| Reduced Motion | Animations disabled for `prefers-reduced-motion` |
| React Query | Server-state caching, deduplication, background refetch |

---

## 12. Deployment

```bash
# Build frontend
cd frontend && npm run build

# Laravel serves API from /api/*
# Vite build output in frontend/dist/ served as SPA
# Apache configured to route all non-API requests to index.html
```

**Server path:** `/var/www/mentra`
**Branch:** `dev`
**Build command:** `npm run build` (in `frontend/`)

---

## 13. Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | `mentra` |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `NVIDIA_API_KEY` | NVIDIA API key for AI features |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | `meta/llama-3.1-8b-instruct` |

---

## 14. Future Considerations

- Social login providers beyond Google
- Push notifications for streak reminders and wither warnings
- Real-time forum updates (WebSocket)
- Mobile app (React Native) sharing the same API
- Additional tree types and forest biomes
- Team/group productivity features
- Calendar integration (Google Calendar, iCal)
- Export functionality (task reports, journal exports)
