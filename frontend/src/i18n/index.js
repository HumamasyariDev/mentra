import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── Locale imports: common ──
import idCommon from './locales/id/common.json';
import enCommon from './locales/en/common.json';

// ── Locale imports: dashboard ──
import idDashboard from './locales/id/dashboard.json';
import enDashboard from './locales/en/dashboard.json';

// ── Locale imports: auth ──
import idAuth from './locales/id/auth.json';
import enAuth from './locales/en/auth.json';

// ── Locale imports: tasks ──
import idTasks from './locales/id/tasks.json';
import enTasks from './locales/en/tasks.json';

// ── Locale imports: pomodoro ──
import idPomodoro from './locales/id/pomodoro.json';
import enPomodoro from './locales/en/pomodoro.json';

// ── Locale imports: forest ──
import idForest from './locales/id/forest.json';
import enForest from './locales/en/forest.json';

// ── Locale imports: schedules ──
import idSchedules from './locales/id/schedules.json';
import enSchedules from './locales/en/schedules.json';

// ── Locale imports: chat ──
import idChat from './locales/id/chat.json';
import enChat from './locales/en/chat.json';

// ── Locale imports: agent ──
import idAgent from './locales/id/agent.json';
import enAgent from './locales/en/agent.json';

// ── Locale imports: sandbox ──
import idSandbox from './locales/id/sandbox.json';
import enSandbox from './locales/en/sandbox.json';

// ── Locale imports: forum ──
import idForum from './locales/id/forum.json';
import enForum from './locales/en/forum.json';

// ── Locale imports: mood ──
import idMood from './locales/id/mood.json';
import enMood from './locales/en/mood.json';

// ── Locale imports: journal ──
import idJournal from './locales/id/journal.json';
import enJournal from './locales/en/journal.json';

// ── Locale imports: settings ──
import idSettings from './locales/id/settings.json';
import enSettings from './locales/en/settings.json';

// ── Locale imports: landing ──
import idLanding from './locales/id/landing.json';
import enLanding from './locales/en/landing.json';

// ── Locale imports: legal ──
import idLegal from './locales/id/legal.json';
import enLegal from './locales/en/legal.json';

const resources = {
  id: {
    common: idCommon,
    dashboard: idDashboard,
    auth: idAuth,
    tasks: idTasks,
    pomodoro: idPomodoro,
    forest: idForest,
    schedules: idSchedules,
    chat: idChat,
    agent: idAgent,
    sandbox: idSandbox,
    forum: idForum,
    mood: idMood,
    journal: idJournal,
    settings: idSettings,
    landing: idLanding,
    legal: idLegal,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    tasks: enTasks,
    pomodoro: enPomodoro,
    forest: enForest,
    schedules: enSchedules,
    chat: enChat,
    agent: enAgent,
    sandbox: enSandbox,
    forum: enForum,
    mood: enMood,
    journal: enJournal,
    settings: enSettings,
    landing: enLanding,
    legal: enLegal,
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
