# i18n Implementation Plan (Indonesian Default, English Alternate)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full internationalization to the Mentra frontend with Indonesian (`id`) as the default language and English (`en`) as the alternate, covering ~500 translatable strings across ~40 files.

**Architecture:** Use `react-i18next` + `i18next` with JSON translation files organized by namespace (one per feature area). The i18n provider wraps the app at the `main.jsx` level. All hardcoded strings are replaced with `t('key')` calls. A language switcher is added to Settings. Legal pages (Privacy Policy, Terms of Service) use dedicated namespaces since they're already fully in Indonesian.

**Tech Stack:** react-i18next, i18next, i18next-browser-languagedetector (for localStorage persistence), React 19, Vite

---

## Namespace Strategy

Organize translations into feature-based namespaces to keep files manageable:

| Namespace | Covers | Est. Keys |
|-----------|--------|-----------|
| `common` | Shared labels (Cancel, Save, Delete, Loading, etc.), nav items, day/month names | ~50 |
| `auth` | Login, Register, ResetPassword, AuthCallback | ~80 |
| `dashboard` | Dashboard, SimplifiedDashboard, FloatingHUD, TopBar, DashboardCards | ~40 |
| `tasks` | Tasks page, TaskCreateForm, TaskItem, QuizModal, TaskListView, TaskBoardView, TaskCalendarView | ~65 |
| `pomodoro` | Pomodoro page (plant/watering theme) | ~30 |
| `forest` | Forest page, ForestTreeCard | ~30 |
| `schedules` | Schedules page, ScheduleCreateForm, ScheduleEditModal, ScheduleItem, ScheduleListView, ScheduleCalendarView, ScheduleBoardView | ~30 |
| `chat` | Chat page | ~15 |
| `agent` | MentraAgentWithSessions (note: system prompts stay in Indonesian) | ~25 |
| `sandbox` | Sandbox, SandboxChat | ~25 |
| `forum` | Forum page, CreatePostModal, EditPostModal, DeleteConfirmModal | ~40 |
| `mood` | Mood page | ~20 |
| `settings` | Settings page | ~15 |
| `landing` | LandingPage, Hero, Navbar, FAQ, FeatureShowcase, GamificationLoop, CTAFooter, Footer | ~80 |
| `legal` | PrivacyPolicy, TermsOfService (full document text) | ~100+ |
| `sidebar` | Sidebar, DashboardSidebar, FloatingSidebar | ~25 |

---

## File Structure for Translations

```
frontend/src/
├── i18n/
│   ├── index.js                    # i18n configuration
│   └── locales/
│       ├── id/                     # Indonesian (default)
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   ├── tasks.json
│       │   ├── pomodoro.json
│       │   ├── forest.json
│       │   ├── schedules.json
│       │   ├── chat.json
│       │   ├── agent.json
│       │   ├── sandbox.json
│       │   ├── forum.json
│       │   ├── mood.json
│       │   ├── settings.json
│       │   ├── landing.json
│       │   ├── legal.json
│       │   └── sidebar.json
│       └── en/                     # English (alternate)
│           ├── common.json
│           ├── auth.json
│           ├── dashboard.json
│           ├── tasks.json
│           ├── pomodoro.json
│           ├── forest.json
│           ├── schedules.json
│           ├── chat.json
│           ├── agent.json
│           ├── sandbox.json
│           ├── forum.json
│           ├── mood.json
│           ├── settings.json
│           ├── landing.json
│           ├── legal.json
│           └── sidebar.json
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `frontend/package.json`

**Step 1: Install i18n packages**

Run:
```bash
cd frontend && npm install react-i18next i18next i18next-browser-languagedetector
```

Expected: 3 packages added to dependencies.

**Step 2: Verify installation**

Run: `cat frontend/package.json | grep i18next`
Expected: `react-i18next`, `i18next`, and `i18next-browser-languagedetector` listed.

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: install react-i18next and i18next for i18n support"
```

---

### Task 2: Create i18n Configuration and Common Namespace

**Files:**
- Create: `frontend/src/i18n/index.js`
- Create: `frontend/src/i18n/locales/id/common.json`
- Create: `frontend/src/i18n/locales/en/common.json`

**Step 1: Create the i18n config**

```js
// frontend/src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale files
import idCommon from './locales/id/common.json';
import enCommon from './locales/en/common.json';

const resources = {
  id: {
    common: idCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'mentra_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
```

**Step 2: Create Indonesian common namespace**

```json
// frontend/src/i18n/locales/id/common.json
{
  "cancel": "Batal",
  "save": "Simpan",
  "saving": "Menyimpan...",
  "delete": "Hapus",
  "deleting": "Menghapus...",
  "edit": "Ubah",
  "create": "Buat",
  "loading": "Memuat...",
  "back": "Kembali",
  "next": "Selanjutnya",
  "prev": "Sebelumnya",
  "continue": "Lanjutkan",
  "confirm": "Konfirmasi",
  "close": "Tutup",
  "or": "atau",
  "search": "Cari",
  "noResults": "Tidak ada hasil",
  "error": "Terjadi kesalahan",
  "retry": "Coba lagi",
  "today": "Hari ini",
  "page": "Halaman",
  "of": "dari",
  "all": "Semua",
  "level": "Level",
  "xp": "XP",
  "exp": "EXP",

  "days": {
    "mon": "Sen",
    "tue": "Sel",
    "wed": "Rab",
    "thu": "Kam",
    "fri": "Jum",
    "sat": "Sab",
    "sun": "Min",
    "monday": "Senin",
    "tuesday": "Selasa",
    "wednesday": "Rabu",
    "thursday": "Kamis",
    "friday": "Jumat",
    "saturday": "Sabtu",
    "sunday": "Minggu"
  },

  "time": {
    "justNow": "Baru saja",
    "minutesAgo": "{{count}}m yang lalu",
    "hoursAgo": "{{count}}j yang lalu",
    "daysAgo": "{{count}}h yang lalu"
  },

  "priority": {
    "low": "Rendah",
    "medium": "Sedang",
    "high": "Tinggi"
  },

  "status": {
    "pending": "Tertunda",
    "inProgress": "Sedang Dikerjakan",
    "completed": "Selesai",
    "active": "Aktif",
    "paused": "Dijeda"
  },

  "nav": {
    "dashboard": "Dashboard",
    "tasks": "Tugas",
    "pomodoro": "Pomodoro",
    "forest": "Hutan",
    "schedules": "Jadwal",
    "mood": "Suasana Hati",
    "chat": "Chat",
    "agent": "Agen",
    "sandbox": "Sandbox",
    "forum": "Forum",
    "settings": "Pengaturan"
  },

  "sections": {
    "productivity": "Produktivitas",
    "aiChat": "AI & Chat",
    "community": "Komunitas",
    "settings": "Pengaturan",
    "account": "Akun"
  },

  "greeting": {
    "morning": "Selamat pagi",
    "afternoon": "Selamat siang",
    "evening": "Selamat malam"
  },

  "account": {
    "displayName": "Nama Tampilan",
    "memberSince": "Anggota sejak",
    "logout": "Keluar",
    "deleteAccount": "Hapus Akun",
    "deleteConfirmText": "Ketik <strong>DELETE</strong> untuk menghapus akun Anda secara permanen.",
    "typeDelete": "Ketik DELETE",
    "yourName": "Nama Anda",
    "user": "Pengguna",
    "failedUpdateName": "Gagal memperbarui nama",
    "failedDeleteAccount": "Gagal menghapus akun",
    "profile": "Profil",
    "notifications": "Notifikasi",
    "noNotifications": "Belum ada notifikasi"
  }
}
```

**Step 3: Create English common namespace**

```json
// frontend/src/i18n/locales/en/common.json
{
  "cancel": "Cancel",
  "save": "Save",
  "saving": "Saving...",
  "delete": "Delete",
  "deleting": "Deleting...",
  "edit": "Edit",
  "create": "Create",
  "loading": "Loading...",
  "back": "Back",
  "next": "Next",
  "prev": "Prev",
  "continue": "Continue",
  "confirm": "Confirm",
  "close": "Close",
  "or": "or",
  "search": "Search",
  "noResults": "No results found",
  "error": "Something went wrong",
  "retry": "Try again",
  "today": "Today",
  "page": "Page",
  "of": "of",
  "all": "All",
  "level": "Level",
  "xp": "XP",
  "exp": "EXP",

  "days": {
    "mon": "Mon",
    "tue": "Tue",
    "wed": "Wed",
    "thu": "Thu",
    "fri": "Fri",
    "sat": "Sat",
    "sun": "Sun",
    "monday": "Monday",
    "tuesday": "Tuesday",
    "wednesday": "Wednesday",
    "thursday": "Thursday",
    "friday": "Friday",
    "saturday": "Saturday",
    "sunday": "Sunday"
  },

  "time": {
    "justNow": "Just now",
    "minutesAgo": "{{count}}m ago",
    "hoursAgo": "{{count}}h ago",
    "daysAgo": "{{count}}d ago"
  },

  "priority": {
    "low": "Low",
    "medium": "Medium",
    "high": "High"
  },

  "status": {
    "pending": "Pending",
    "inProgress": "In Progress",
    "completed": "Completed",
    "active": "Active",
    "paused": "Paused"
  },

  "nav": {
    "dashboard": "Dashboard",
    "tasks": "Tasks",
    "pomodoro": "Pomodoro",
    "forest": "Forest",
    "schedules": "Schedules",
    "mood": "Mood",
    "chat": "Chat",
    "agent": "Agent",
    "sandbox": "Sandbox",
    "forum": "Forum",
    "settings": "Settings"
  },

  "sections": {
    "productivity": "Productivity",
    "aiChat": "AI & Chat",
    "community": "Community",
    "settings": "Settings",
    "account": "Account"
  },

  "greeting": {
    "morning": "Good morning",
    "afternoon": "Good afternoon",
    "evening": "Good evening"
  },

  "account": {
    "displayName": "Display Name",
    "memberSince": "Member since",
    "logout": "Logout",
    "deleteAccount": "Delete Account",
    "deleteConfirmText": "Type <strong>DELETE</strong> to permanently remove your account.",
    "typeDelete": "Type DELETE",
    "yourName": "Your name",
    "user": "User",
    "failedUpdateName": "Failed to update name",
    "failedDeleteAccount": "Failed to delete account",
    "profile": "Profile",
    "notifications": "Notifications",
    "noNotifications": "No notifications yet"
  }
}
```

**Step 4: Commit**

```bash
git add frontend/src/i18n/
git commit -m "feat: add i18n config with common namespace (id/en)"
```

---

### Task 3: Wire i18n Provider into the App

**Files:**
- Modify: `frontend/src/main.jsx`

**Step 1: Import i18n config in main.jsx**

Add this import at the top of `main.jsx` (after the React imports, before App):

```js
import './i18n'
```

The full file becomes:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import './i18n'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

**Step 2: Verify the dev server still starts**

Run: `cd frontend && npm run dev`
Expected: No errors, app loads normally (no visible changes yet since no `t()` calls).

**Step 3: Commit**

```bash
git add frontend/src/main.jsx
git commit -m "feat: wire i18n provider into app entry point"
```

---

### Task 4: Create Sidebar Namespace and Translate Sidebar + DashboardSidebar + FloatingSidebar

**Files:**
- Create: `frontend/src/i18n/locales/id/sidebar.json`
- Create: `frontend/src/i18n/locales/en/sidebar.json`
- Modify: `frontend/src/i18n/index.js` (add sidebar namespace imports)
- Modify: `frontend/src/components/Sidebar.jsx`
- Modify: `frontend/src/components/dashboard/DashboardSidebar.jsx`
- Modify: `frontend/src/components/dashboard/FloatingSidebar.jsx`

**Step 1: Create sidebar translation files**

Indonesian (`id/sidebar.json`) — sidebar section titles are already in Indonesian, keep them:
```json
{
  "menuTitle": "Menu",
  "closeMenu": "Tutup menu",
  "toggleMenu": "Buka menu"
}
```

English (`en/sidebar.json`):
```json
{
  "menuTitle": "Menu",
  "closeMenu": "Close menu",
  "toggleMenu": "Toggle menu"
}
```

Note: Most sidebar strings (nav labels, section titles, account panel) come from the `common` namespace. The `sidebar` namespace only holds sidebar-specific strings not covered by `common`.

**Step 2: Update i18n/index.js to import sidebar namespace**

Add the imports and register under resources.

**Step 3: Update Sidebar.jsx**

Add `import { useTranslation } from 'react-i18next';` at top.
Add `const { t } = useTranslation(['common', 'sidebar']);` inside the component.
Replace hardcoded strings:
- Section titles: `"Produktivitas"` → `{t('sections.productivity')}`, etc.
- Nav labels: `"Dashboard"` → `{t('nav.dashboard')}`, `"Tasks"` → `{t('nav.tasks')}`, etc.
- Account panel: `"Display Name"` → `{t('account.displayName')}`, `"Logout"` → `{t('account.logout')}`, etc.
- `"User"` → `{t('account.user')}`, `"Level"` → `{t('level')}`, etc.

**Step 4: Update DashboardSidebar.jsx** — same pattern as Sidebar.

**Step 5: Update FloatingSidebar.jsx** — replace `"Menu"`, `"Dashboard"`, `"Tasks"`, etc.

**Step 6: Verify** — Run dev server, check sidebar renders correctly in Indonesian by default.

**Step 7: Commit**

```bash
git add frontend/src/i18n/ frontend/src/components/Sidebar.jsx frontend/src/components/dashboard/DashboardSidebar.jsx frontend/src/components/dashboard/FloatingSidebar.jsx
git commit -m "feat(i18n): translate Sidebar, DashboardSidebar, FloatingSidebar"
```

---

### Task 5: Create Auth Namespace and Translate Login, Register, ResetPassword, AuthCallback

**Files:**
- Create: `frontend/src/i18n/locales/id/auth.json`
- Create: `frontend/src/i18n/locales/en/auth.json`
- Modify: `frontend/src/i18n/index.js` (add auth namespace imports)
- Modify: `frontend/src/pages/Login.jsx`
- Modify: `frontend/src/pages/Register.jsx`
- Modify: `frontend/src/pages/ResetPassword.jsx`
- Modify: `frontend/src/pages/AuthCallback.jsx`

**Step 1: Create auth translation files**

Indonesian (`id/auth.json`) — keys for all auth screens:
```json
{
  "login": {
    "title": "Masuk",
    "email": "Email",
    "password": "Kata Sandi",
    "emailPlaceholder": "Masukkan alamat email Anda",
    "passwordPlaceholder": "Masukkan kata sandi Anda",
    "forgotPassword": "Lupa kata sandi?",
    "sendResetCode": "Kirim kode reset",
    "sending": "Mengirim...",
    "loginWithGoogle": "Masuk dengan Google",
    "loginWithFacebook": "Masuk dengan Facebook",
    "noAccount": "Belum punya akun?",
    "signUp": "Daftar",
    "emailSent": "Email terkirim untuk mereset kata sandi Anda",
    "backToLogin": "Kembali ke login"
  },
  "register": {
    "title": "Buat akun Anda",
    "haveAccount": "Sudah punya akun?",
    "logIn": "Masuk",
    "firstName": "Nama depan",
    "lastName": "Nama belakang",
    "signUpWithGoogle": "Daftar dengan Google",
    "signUpWithFacebook": "Daftar dengan Facebook",
    "otherOptions": "Opsi pendaftaran lain",
    "passwordRequirements": "Kata sandi Anda harus mengandung:",
    "passwordLength": "Antara 8 dan 64 karakter",
    "passwordLetterNumber": "Minimal 1 huruf dan 1 angka",
    "checkEmail": "Cek email Anda",
    "otpSent": "Kami mengirim kode 6 digit ke",
    "verifyCreate": "Verifikasi & Buat Akun",
    "noCode": "Belum menerima kode?",
    "resendCode": "Kirim ulang kode",
    "backToPrevious": "Kembali ke langkah sebelumnya",
    "agreeTerms": "Saya menyetujui",
    "termsOfService": "Ketentuan Layanan",
    "and": "dan",
    "privacyPolicy": "Kebijakan Privasi",
    "testimonialQuote": "\"Mentra mengubah cara saya mengatur produktivitas. Gamifikasi membuatnya menyenangkan!\""
  },
  "resetPassword": {
    "title": "Reset kata sandi Anda",
    "invalidLink": "Tautan reset tidak valid",
    "success": "Kata sandi berhasil direset",
    "newPassword": "Kata sandi baru",
    "confirmPassword": "Konfirmasi kata sandi baru",
    "enterNewPassword": "Masukkan kata sandi baru",
    "resetButton": "Reset Kata Sandi",
    "resetting": "Mereset..."
  },
  "callback": {
    "processing": "Memproses login...",
    "redirecting": "Mengalihkan ke halaman login...",
    "failedLoad": "Gagal memuat data user."
  },
  "errors": {
    "emailNotFound": "Email tidak ditemukan",
    "wrongPassword": "Kata sandi salah",
    "socialOnlyAccount": "Akun ini menggunakan login sosial",
    "emailTaken": "Email sudah digunakan",
    "invalidOtp": "Kode OTP tidak valid",
    "expiredOtp": "Kode OTP sudah kedaluwarsa",
    "genericError": "Terjadi kesalahan. Silakan coba lagi."
  }
}
```

English (`en/auth.json`):
```json
{
  "login": {
    "title": "Log in",
    "email": "Email",
    "password": "Password",
    "emailPlaceholder": "Enter your email address",
    "passwordPlaceholder": "Enter your password",
    "forgotPassword": "Forgot password?",
    "sendResetCode": "Send reset code",
    "sending": "Sending...",
    "loginWithGoogle": "Log in with Google",
    "loginWithFacebook": "Log in with Facebook",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up",
    "emailSent": "Email sent to reset your password",
    "backToLogin": "Back to login"
  },
  "register": {
    "title": "Let's create your account",
    "haveAccount": "Already have an account?",
    "logIn": "Log in",
    "firstName": "First name",
    "lastName": "Last name",
    "signUpWithGoogle": "Sign up with Google",
    "signUpWithFacebook": "Sign up with Facebook",
    "otherOptions": "Other Sign up options",
    "passwordRequirements": "Your password must contain:",
    "passwordLength": "Between 8 and 64 characters",
    "passwordLetterNumber": "At least 1 letter and 1 number",
    "checkEmail": "Check your email",
    "otpSent": "We sent a 6-digit code to",
    "verifyCreate": "Verify & Create Account",
    "noCode": "Didn't receive the code?",
    "resendCode": "Resend code",
    "backToPrevious": "Back to previous step",
    "agreeTerms": "I agree to the",
    "termsOfService": "Terms of Service",
    "and": "and",
    "privacyPolicy": "Privacy Policy",
    "testimonialQuote": "\"Mentra changed how I manage my productivity. The gamification makes it fun!\""
  },
  "resetPassword": {
    "title": "Reset your password",
    "invalidLink": "Invalid reset link",
    "success": "Password reset successful",
    "newPassword": "New password",
    "confirmPassword": "Confirm new password",
    "enterNewPassword": "Enter new password",
    "resetButton": "Reset Password",
    "resetting": "Resetting..."
  },
  "callback": {
    "processing": "Processing login...",
    "redirecting": "Redirecting to login page...",
    "failedLoad": "Failed to load user data."
  },
  "errors": {
    "emailNotFound": "Email not found",
    "wrongPassword": "Wrong password",
    "socialOnlyAccount": "This account uses social login",
    "emailTaken": "Email already taken",
    "invalidOtp": "Invalid OTP code",
    "expiredOtp": "OTP code has expired",
    "genericError": "Something went wrong. Please try again."
  }
}
```

**Step 2: Update i18n/index.js** — add auth imports and register.

**Step 3: Update Login.jsx** — `useTranslation(['auth', 'common'])`, replace all strings.

**Step 4: Update Register.jsx** — same pattern. Multi-step form, replace all strings.

**Step 5: Update ResetPassword.jsx** — replace all strings.

**Step 6: Update AuthCallback.jsx** — replace the Indonesian strings with `t()` calls.

**Step 7: Verify** — test login/register/reset flows.

**Step 8: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/pages/ResetPassword.jsx frontend/src/pages/AuthCallback.jsx
git commit -m "feat(i18n): translate auth pages (Login, Register, ResetPassword, AuthCallback)"
```

---

### Task 6: Create Dashboard Namespace and Translate Dashboard Components

**Files:**
- Create: `frontend/src/i18n/locales/id/dashboard.json`
- Create: `frontend/src/i18n/locales/en/dashboard.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Dashboard.jsx`
- Modify: `frontend/src/components/dashboard/SimplifiedDashboard.jsx`
- Modify: `frontend/src/components/dashboard/DashboardFloatingUI.jsx`
- Modify: `frontend/src/components/dashboard/SimplifiedDashboardCards.jsx`
- Modify: `frontend/src/components/dashboard/FloatingHUD.jsx`
- Modify: `frontend/src/components/dashboard/TopBar.jsx`

**Step 1: Create dashboard translation files** with keys for: greetings, stats labels ("Day Streak", "Focus Session", "Sessions Today", "Start Focus", "Up Next", "Today's Schedule", etc.), card titles, empty states.

**Step 2: Update all dashboard components** to use `useTranslation(['dashboard', 'common'])`.

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Dashboard.jsx frontend/src/components/dashboard/
git commit -m "feat(i18n): translate Dashboard page and all dashboard components"
```

---

### Task 7: Create Tasks Namespace and Translate Tasks Ecosystem

**Files:**
- Create: `frontend/src/i18n/locales/id/tasks.json`
- Create: `frontend/src/i18n/locales/en/tasks.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Tasks.jsx`
- Modify: `frontend/src/components/tasks/TaskCreateForm.jsx`
- Modify: `frontend/src/components/tasks/TaskItem.jsx`
- Modify: `frontend/src/components/tasks/QuizModal.jsx`
- Modify: `frontend/src/components/tasks/TaskListView.jsx`
- Modify: `frontend/src/components/tasks/TaskBoardView.jsx`
- Modify: `frontend/src/components/tasks/TaskCalendarView.jsx`

**Step 1: Create tasks translation files** with keys for: page title/subtitle, form labels, quiz strings (Challenge Quiz, Flashcards, question counters, results messages), view strings (All, Pending, In Progress, Completed, No tasks, Prev/Next, Page X of Y, Drop here, No tasks), file reading states.

**Step 2: Update all tasks components.**

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Tasks.jsx frontend/src/components/tasks/
git commit -m "feat(i18n): translate Tasks page and all task components"
```

---

### Task 8: Create Pomodoro Namespace and Translate Pomodoro Page

**Files:**
- Create: `frontend/src/i18n/locales/id/pomodoro.json`
- Create: `frontend/src/i18n/locales/en/pomodoro.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Pomodoro.jsx`

**Step 1: Create pomodoro translation files** with keys for: plant mood strings, timer states, button labels, stats labels, theme labels.

**Step 2: Update Pomodoro.jsx.**

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Pomodoro.jsx
git commit -m "feat(i18n): translate Pomodoro page"
```

---

### Task 9: Create Forest Namespace and Translate Forest Page + ForestTreeCard

**Files:**
- Create: `frontend/src/i18n/locales/id/forest.json`
- Create: `frontend/src/i18n/locales/en/forest.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Forest.jsx`
- Modify: `frontend/src/components/ForestTreeCard.jsx`

**Step 1: Create forest translation files** with keys for: stage names, loading/error states, action buttons, status messages.

**Step 2: Update Forest.jsx and ForestTreeCard.jsx.**

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Forest.jsx frontend/src/components/ForestTreeCard.jsx
git commit -m "feat(i18n): translate Forest page and ForestTreeCard"
```

---

### Task 10: Create Schedules Namespace and Translate Schedules Ecosystem

**Files:**
- Create: `frontend/src/i18n/locales/id/schedules.json`
- Create: `frontend/src/i18n/locales/en/schedules.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Schedules.jsx`
- Modify: `frontend/src/components/schedules/ScheduleCreateForm.jsx`
- Modify: `frontend/src/components/schedules/ScheduleEditModal.jsx`
- Modify: `frontend/src/components/schedules/ScheduleItem.jsx`
- Modify: `frontend/src/components/schedules/ScheduleListView.jsx`
- Modify: `frontend/src/components/schedules/ScheduleCalendarView.jsx`
- Modify: `frontend/src/components/schedules/ScheduleBoardView.jsx`

**Step 1: Create schedules translation files** with keys for: page title/subtitle, form labels, type labels (Daily/Weekly/Monthly), day names, time group labels (Morning/Afternoon/Evening/Anytime), empty states, legend labels.

**Step 2: Update all schedules components.**

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Schedules.jsx frontend/src/components/schedules/
git commit -m "feat(i18n): translate Schedules page and all schedule components"
```

---

### Task 11: Create Chat + Agent + Sandbox Namespaces and Translate AI Pages

**Files:**
- Create: `frontend/src/i18n/locales/id/chat.json`
- Create: `frontend/src/i18n/locales/en/chat.json`
- Create: `frontend/src/i18n/locales/id/agent.json`
- Create: `frontend/src/i18n/locales/en/agent.json`
- Create: `frontend/src/i18n/locales/id/sandbox.json`
- Create: `frontend/src/i18n/locales/en/sandbox.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Chat.jsx`
- Modify: `frontend/src/agents/MentraAgentWithSessions.jsx`
- Modify: `frontend/src/pages/Sandbox.jsx`
- Modify: `frontend/src/pages/SandboxChat.jsx`

**Important notes:**
- `Chat.jsx` already has Indonesian strings — these become the `id` translation values.
- `MentraAgentWithSessions.jsx` has a system prompt in Indonesian — leave the system prompt as-is (it's an AI instruction, not user-facing UI). Only translate the UI chrome: sidebar title, button labels, status messages, placeholders, quick prompt labels, empty states, etc.
- `Sandbox.jsx` and `SandboxChat.jsx` have a mix — normalize.

**Step 1: Create all three namespace translation files.**

**Step 2: Update Chat.jsx, MentraAgentWithSessions.jsx, Sandbox.jsx, SandboxChat.jsx.**

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Chat.jsx frontend/src/agents/MentraAgentWithSessions.jsx frontend/src/pages/Sandbox.jsx frontend/src/pages/SandboxChat.jsx
git commit -m "feat(i18n): translate Chat, Agent, Sandbox pages"
```

---

### Task 12: Create Forum + Mood Namespaces and Translate Those Pages

**Files:**
- Create: `frontend/src/i18n/locales/id/forum.json`
- Create: `frontend/src/i18n/locales/en/forum.json`
- Create: `frontend/src/i18n/locales/id/mood.json`
- Create: `frontend/src/i18n/locales/en/mood.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Forum.jsx`
- Modify: `frontend/src/components/forum/CreatePostModal.jsx`
- Modify: `frontend/src/components/forum/EditPostModal.jsx`
- Modify: `frontend/src/components/forum/DeleteConfirmModal.jsx`
- Modify: `frontend/src/pages/Mood.jsx`

**Step 1: Create forum and mood translation files.**

**Step 2: Update all forum and mood components.**

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Forum.jsx frontend/src/components/forum/ frontend/src/pages/Mood.jsx
git commit -m "feat(i18n): translate Forum and Mood pages"
```

---

### Task 13: Create Settings Namespace and Translate Settings Page

**Files:**
- Create: `frontend/src/i18n/locales/id/settings.json`
- Create: `frontend/src/i18n/locales/en/settings.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/Settings.jsx`

**Step 1: Create settings translation files.** Include keys for: dashboard display options, appearance, dark mode, language selector, about section.

**Step 2: Add language switcher to Settings.jsx.** This is a new UI section:

```jsx
// New section in Settings.jsx
<div className="settings-section">
  <h3>{t('settings:language')}</h3>
  <p className="settings-description">{t('settings:languageDesc')}</p>
  <div className="settings-language-options">
    <button
      className={`settings-option ${i18n.language === 'id' ? 'active' : ''}`}
      onClick={() => i18n.changeLanguage('id')}
    >
      🇮🇩 Bahasa Indonesia
    </button>
    <button
      className={`settings-option ${i18n.language === 'en' ? 'active' : ''}`}
      onClick={() => i18n.changeLanguage('en')}
    >
      🇬🇧 English
    </button>
  </div>
</div>
```

The `i18next-browser-languagedetector` with `caches: ['localStorage']` will persist the choice.

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/Settings.jsx
git commit -m "feat(i18n): translate Settings page and add language switcher"
```

---

### Task 14: Create Landing Namespace and Translate Landing Page Components

**Files:**
- Create: `frontend/src/i18n/locales/id/landing.json`
- Create: `frontend/src/i18n/locales/en/landing.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/LandingPage.jsx`
- Modify: `frontend/src/components/landing/Hero.jsx`
- Modify: `frontend/src/components/landing/Navbar.jsx`
- Modify: `frontend/src/components/landing/FAQ.jsx`
- Modify: `frontend/src/components/landing/FeatureShowcase.jsx`
- Modify: `frontend/src/components/landing/GamificationLoop.jsx`
- Modify: `frontend/src/components/landing/CTAFooter.jsx`
- Modify: `frontend/src/components/landing/Footer.jsx`

**Step 1: Create landing translation files.** This is the largest namespace (~80 keys): hero text, nav links, feature titles/descriptions, FAQ Q&As, gamification steps, CTA text, footer links.

**Step 2: Add a language toggle to the landing page Navbar** (small flag/text toggle for visitors who haven't logged in yet).

**Step 3: Update all landing components.**

**Step 4: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/LandingPage.jsx frontend/src/components/landing/
git commit -m "feat(i18n): translate Landing page and all landing components"
```

---

### Task 15: Create Legal Namespace and Translate Privacy Policy + Terms of Service

**Files:**
- Create: `frontend/src/i18n/locales/id/legal.json`
- Create: `frontend/src/i18n/locales/en/legal.json`
- Modify: `frontend/src/i18n/index.js`
- Modify: `frontend/src/pages/PrivacyPolicy.jsx`
- Modify: `frontend/src/pages/TermsOfService.jsx`

**Step 1: Create legal translation files.** Since these are full documents, structure them as sections with title + content arrays to keep the JSON manageable. The Indonesian versions already exist in the JSX — extract them. The English versions need to be written as translations.

**Step 2: Update PrivacyPolicy.jsx and TermsOfService.jsx** to render from translation keys.

**Step 3: Commit**

```bash
git add frontend/src/i18n/ frontend/src/pages/PrivacyPolicy.jsx frontend/src/pages/TermsOfService.jsx
git commit -m "feat(i18n): translate Privacy Policy and Terms of Service"
```

---

### Task 16: Update Date/Time Locale Handling

**Files:**
- Modify: `frontend/src/components/tasks/TaskCalendarView.jsx`
- Modify: `frontend/src/components/schedules/ScheduleCalendarView.jsx`
- Modify: `frontend/src/components/dashboard/DashboardSidebar.jsx`

**Step 1: Update `toLocaleDateString` calls** throughout the codebase.

Currently many components use `'en-US'` hardcoded locale:
```js
currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
```

Change these to use the current i18n language:
```js
import { useTranslation } from 'react-i18next';
// ...
const { i18n } = useTranslation();
const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
```

This affects:
- `TaskCalendarView.jsx` — month labels, selected date labels
- `ScheduleCalendarView.jsx` — month labels, selected date labels
- `DashboardSidebar.jsx` — "Member since" date

**Step 2: Commit**

```bash
git add frontend/src/components/tasks/TaskCalendarView.jsx frontend/src/components/schedules/ScheduleCalendarView.jsx frontend/src/components/dashboard/DashboardSidebar.jsx
git commit -m "fix(i18n): use locale-aware date formatting in calendars and member-since"
```

---

### Task 17: Final Review and Smoke Test

**Step 1: Run the build**

```bash
cd frontend && npm run build
```

Expected: Clean build, no errors.

**Step 2: Manual smoke test checklist**

- [ ] App loads in Indonesian by default
- [ ] Navigate to Settings → Language → switch to English
- [ ] All pages show English text after switching
- [ ] Switch back to Indonesian — all pages show Indonesian
- [ ] Refresh browser — language persists (stored in localStorage as `mentra_language`)
- [ ] Auth pages (login, register, reset) display correctly in both languages
- [ ] Dashboard greetings change by language
- [ ] Calendar month names are locale-appropriate
- [ ] Landing page has a language toggle and switches correctly
- [ ] Legal pages render full documents in both languages

**Step 3: Fix any issues found during smoke test**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(i18n): complete i18n implementation with Indonesian default and English alternate"
```

---

## Post-Implementation Notes

### Backend i18n (deferred)
Backend API error messages are currently hardcoded in English in Laravel controllers. These are displayed to users on the frontend. Options:
1. **Frontend mapping** (recommended for now): Map backend error codes/messages to translation keys on the frontend (already partially done via `auth.errors` namespace).
2. **Laravel localization** (future): Set up proper Laravel lang files for `id` and `en`, pass `Accept-Language` header from frontend.

### Testing
No test infrastructure exists in this project, so there are no tests to add. If tests are added later, i18n should be mocked in test setup.

### Adding New Strings
When adding new UI text in the future:
1. Add the key to both `id` and `en` JSON files in the appropriate namespace
2. Use `t('namespace:key')` in the component
3. Import the namespace in `i18n/index.js` if it's a new namespace
