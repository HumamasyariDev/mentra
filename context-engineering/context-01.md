# PROJECT CONTEXT — PRODUCTIVITY GAMIFIED WEB APP (MVP)

---

## 1. PROJECT PURPOSE

This project is a **Gamified Productivity Web Application** designed to help users manage daily productivity using task management, scheduling, focus sessions (Pomodoro), mood tracking, and gamification elements such as EXP and streak systems.

The system will also include **AI-powered contextual assistance** that can analyze user behavior patterns and provide personalized productivity recommendations.

This project is currently in **MVP Stage**, meaning:
- Focus on core functionality first
- Prioritize stability and usability
- Avoid overengineering
- AI integration should be modular and scalable

---

## 2. CORE PRODUCT PRINCIPLES

The product must be:

- Simple on the surface
- Smart in the background
- Fast and responsive
- Clean UI with minimal visual noise
- User-first productivity, not feature overload

AI must assist — not dominate user experience.

---

## 3. TECHNOLOGY STACK

### Backend
- Laravel 12
- REST API Architecture
- Laravel Sanctum (Authentication)
- Queue System (for async AI processing if needed)

### Frontend
- React
- Tailwind CSS
- Component-based architecture
- Clean UI with minimal animation

### Database
- MySQL

### Hosting (Flexible / TBD)
- VPS / Cloud Hosting
- Must support public access (required by competition)

---

## 4. CORE MVP FEATURES (MANDATORY)

### 4.1 Authentication System
- Register
- Login
- Logout
- Secure session handling

---

### 4.2 Task Management
User must be able to:
- Create task
- Edit task
- Delete task
- Mark task as completed
- Assign priority (optional MVP+)

EXP is awarded when task is completed.

---

### 4.3 Pomodoro Focus Timer
Must include:
- Start session
- Pause session
- Stop session
- Session history log

EXP is awarded per completed session.

---

### 4.4 Schedule System
Must support:
- Daily schedule
- Weekly schedule
- Monthly schedule (MVP can be simplified calendar view)

EXP awarded when schedule item is completed.

---

### 4.5 Mood Tracking
User can log:
- Daily mood (simple selection system)
- Optional short note

Used later for AI correlation analysis.

---

### 4.6 Gamification System

#### EXP System
EXP earned from:
- Completing tasks
- Completing pomodoro sessions
- Completing scheduled items

#### Streak System
Tracks:
- Daily productivity consistency
- Reset logic if user inactive

---

## 5. AI INTEGRATION (MVP LEVEL)

AI must act as **Context-Aware Productivity Assistant**.

AI should be able to read context from:
- Tasks
- Schedule
- Pomodoro history
- Mood history
- Completion patterns
- Streak history

---

### 5.1 AI Core Functions

#### Behavior Pattern Detection
AI identifies:
- Best focus time
- Low performance time
- Task completion patterns

#### Productivity Recommendation Chat
AI can:
- Suggest schedule adjustments
- Suggest focus time optimization
- Suggest workload balancing

#### Periodic Auto Analysis
Generate:
- Daily summary
- Weekly summary
- Monthly summary

---

## 6. FUTURE AI (NOT REQUIRED FOR MVP BUT MUST BE SUPPORTED IN ARCHITECTURE)

- Burnout Risk Prediction
- Adaptive Gamification Adjustment
- Cognitive Load Estimation
- Long-term Habit Intelligence

---

## 7. INTEGRATION POSSIBILITY

The system must be designed to support external integrations such as:

### Possible Automation Tools
- n8n
- Zapier (optional future)
- Webhook-based integrations

### Possible AI Processing Layer
- External AI API
- Background worker processing
- Context summarization service

System must be modular for future expansion.

---

## 8. UI / DESIGN RULES

### Design Style
- Clean
- Modern
- Minimalist
- Productivity-focused

### Color Rules
- DO NOT use excessive gradients
- Prefer flat colors
- Neutral base colors
- Soft accent colors only

### UX Rules
- No clutter dashboard
- Clear hierarchy
- Fast navigation
- Mobile responsive

---

## 9. PERFORMANCE RULES

- Fast loading is critical
- Avoid heavy unnecessary animation
- Optimize database queries
- Lazy load heavy components if needed

---

## 10. SECURITY BASELINE

- Secure authentication
- Input validation required
- Prevent common web vulnerabilities
- Proper API authorization

---

## 11. DEVELOPMENT RULES FOR AI AGENT

AI Agent must:

- Follow MVP scope first
- Avoid adding unrequested features
- Keep architecture clean and modular
- Prioritize maintainability

---

## 12. TESTING POLICY (IMPORTANT)

🚨 VERY IMPORTANT RULE 🚨

The AI agent MUST NOT:
- Create automatic tests
- Add unit tests automatically
- Add integration tests automatically
- Add testing frameworks unless explicitly requested later

Testing will be done manually by the project owner.

---

## 13. DEVELOPMENT PRIORITY ORDER

1️⃣ Authentication  
2️⃣ Task Management  
3️⃣ Pomodoro Timer  
4️⃣ Schedule System  
5️⃣ Mood Tracking  
6️⃣ EXP + Streak System  
7️⃣ Basic AI Context Chat  

---

## 14. NON-GOALS (FOR MVP)

Do NOT implement yet:
- Complex AI prediction models
- Social features
- Marketplace
- Multi-tenant system
- Overly complex analytics dashboard

---

## 15. FINAL MVP SUCCESS CRITERIA

The MVP is successful if:

- User can manage productivity daily using core tools
- Gamification system is functional
- AI can give basic contextual recommendation
- System is stable and responsive
- UI is clean and usable

---

## 16. APPROVED LIBRARIES & FRONTEND UTILITIES

The project may use modern and relevant frontend libraries to improve user experience, performance, and development efficiency.

However, libraries must be:
- Lightweight
- Well maintained
- Production proven
- Performance aware

Avoid unnecessary heavy dependencies.

---

### 16.1 Animation Library

#### GSAP (GreenSock Animation Platform)
GSAP is allowed and recommended for smooth, high performance animations.

GSAP should be used for:
- Micro interactions
- Page transition animations
- Dashboard element entrance animations
- Progress bar / EXP animation
- Gamification feedback animations

GSAP must NOT be used for:
- Continuous heavy background animation
- Large timeline animation on dashboard load
- Anything that affects core app performance

Animation must feel:
- Fast
- Smooth
- Professional
- Subtle (not flashy)

---

### 16.2 UI / Utility Libraries (Allowed)

AI Agent may use if needed:

- Headless UI (accessible components)
- Radix UI (optional advanced UI primitives)
- Framer Motion (ONLY if GSAP is not suitable for specific case)
- React Query / TanStack Query (for server state management)

---

### 16.3 Chart / Data Visualization

If analytics visualization is required:

Preferred:
- Recharts
- Chart.js (light usage)

Avoid:
- Heavy enterprise dashboard libraries

---

### 16.4 Form Handling

Allowed:
- React Hook Form

Avoid:
- Over complex form frameworks

---

## 17. ANIMATION DESIGN PRINCIPLES

Mentra design philosophy:

- Smooth over flashy
- Functional over decorative
- Micro feedback > macro animation

Examples of GOOD animation:
- Button press feedback
- Task completion subtle celebration
- EXP gain micro animation
- Card hover elevation
- Smooth modal open/close

Examples of BAD animation:
- Constant floating elements
- Heavy gradient animated backgrounds
- Long intro animations
- Animation blocking user interaction

---

## 18. PERFORMANCE SAFE RULES

Animations must:
- Never block user input
- Never delay page usability
- Respect reduced motion preferences
- Be disabled or reduced on low performance devices if needed

Lazy load animation libraries when possible.

---

## 19. DEVELOPMENT RULE FOR AI AGENT (LIBRARY USAGE)

AI Agent MUST:
- Prefer built-in React + Tailwind first
- Only add library if clear benefit exists
- Avoid duplicate libraries with same function
- Avoid installing animation libraries without real UI need

---

END OF ADDITION
