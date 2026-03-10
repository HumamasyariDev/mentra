/**
 * MentraTools.js
 *
 * Direct API executors for Manual Tool Calling.
 * Called by MentraAgent.jsx when Puter.js returns a JSON action.
 *
 * Uses the same axios instance as the rest of the app (includes
 * Authorization: Bearer <token> interceptor automatically).
 */

import { taskApi, agentApi, taskApi as tApi } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────────────────
// Tool: create_task
//
// Called when Puter returns: { "action": "create_task", "payload": {...} }
// Uses POST /api/tasks — the exact endpoint Tasks page uses (proven to work).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ title: string, deadline?: string, difficulty?: string, priority?: string, description?: string }} payload
 * @returns {Promise<{ success: boolean, task?: object, error?: string }>}
 */
export async function createTaskTool(payload) {
    const { title, deadline, difficulty, priority, description, exp_reward } = payload;

    if (!title || String(title).trim().length < 2) {
        return { success: false, error: 'Judul task tidak boleh kosong.' };
    }

    // Map difficulty → priority if priority not set
    const resolvedPriority = normalizePriority(priority ?? difficulty);

    // Map difficulty → exp_reward if not set
    const resolvedExp = exp_reward
        ? parseInt(exp_reward, 10)
        : difficultyToExp(difficulty);

    // Normalize deadline to YYYY-MM-DD (strip time component if present)
    const resolvedDate = normalizeDate(deadline);

    const taskData = {
        title:      String(title).trim().slice(0, 255),
        priority:   resolvedPriority,
        exp_reward: resolvedExp,
    };
    if (description)   taskData.description = description;
    if (resolvedDate)  taskData.due_date     = resolvedDate;

    console.debug('[createTaskTool] POST /api/tasks payload:', taskData);

    try {
        const response = await taskApi.create(taskData);
        const task = response.data;

        console.debug('[createTaskTool] Created task:', task);

        // Notify Tasks page (React Query invalidation)
        window.dispatchEvent(new CustomEvent('mentra:task-created', { detail: task }));

        return { success: true, task };
    } catch (err) {
        const status  = err.response?.status;
        const message = err.response?.data?.message ?? err.message;
        const errors  = err.response?.data?.errors;

        console.error('[createTaskTool] Error:', { status, message, errors });

        if (status === 401)  return { success: false, error: 'Sesi kamu sudah habis. Silakan login ulang.' };
        if (status === 422) {
            const detail = errors
                ? Object.entries(errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')
                : message;
            return { success: false, error: `Validasi gagal:\n${detail}` };
        }
        return { success: false, error: `Gagal menyimpan task: ${message}` };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool: search_knowledge
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} query
 * @returns {Promise<{ success: boolean, context?: string, error?: string }>}
 */
export async function searchKnowledgeTool(query) {
    try {
        const response = await agentApi.vectorSearch(String(query).trim(), 3);
        const { context, note } = response.data;
        return {
            success: true,
            context: note ? `${context}\n\n[Note: ${note}]` : (context || 'Tidak ada informasi relevan.'),
        };
    } catch (err) {
        return { success: false, error: err.response?.data?.message ?? err.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizePriority(val) {
    if (!val) return 'medium';
    const v = String(val).toLowerCase().trim();
    if (['hard', 'high', 'urgent', 'tinggi', 'sulit', 'susah'].includes(v))  return 'high';
    if (['easy', 'low', 'rendah', 'mudah', 'santai', 'gampang'].includes(v)) return 'low';
    return 'medium';
}

function difficultyToExp(difficulty) {
    const d = String(difficulty ?? '').toLowerCase().trim();
    if (['hard', 'high', 'sulit'].includes(d))  return 30;
    if (['easy', 'low',  'mudah'].includes(d))  return 10;
    return 20; // medium default
}

/**
 * Normalize date to YYYY-MM-DD.
 * Accepts: ISO string, "2026-03-09T00:00:00.000Z", plain "2026-03-09", null.
 */
function normalizeDate(val) {
    if (!val) return null;
    const s = String(val).trim();
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // ISO datetime — extract date part
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    // Try Date parse
    try {
        const d = new Date(s);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch { /* ignore */ }
    return null;
}
