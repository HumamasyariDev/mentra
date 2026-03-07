/**
 * MentraTools.js
 *
 * LangChain DynamicTool definitions for the Mentra AI Agent.
 *
 * Each tool corresponds to a backend API endpoint.
 * The ReAct loop calls tool.invoke(input) where input is a string
 * — all func() implementations handle JSON parsing internally.
 *
 * Tool Roster:
 *  1. search_knowledge  — Semantic vector search over knowledge base
 *  2. create_task       — Create a new task
 *  3. add_knowledge     — Save a note to knowledge base
 *  4. list_tasks        — List user's current tasks with optional filters
 *  5. get_user_stats    — Get user's level, streak, EXP, and daily progress
 *  6. complete_task     — Mark a task as completed and award XP
 *
 * Compatible with: @langchain/core@1.x
 */

import { DynamicTool, DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { agentApi, taskApi, dashboardApi } from '../services/api.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper
// ─────────────────────────────────────────────────────────────────────────────

/** Parse input that may be a plain string or a JSON string */
function parseInput(input, fallbackKey = null) {
    if (typeof input !== 'string') return input;
    try {
        return JSON.parse(input);
    } catch {
        // If it's a plain string and we have a fallbackKey, wrap it
        if (fallbackKey) return { [fallbackKey]: input };
        return input;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 1: search_knowledge
// ─────────────────────────────────────────────────────────────────────────────

export const searchKnowledgeTool = new DynamicTool({
    name: 'search_knowledge',
    description:
        'Search the knowledge base for relevant information about productivity, learning, ' +
        'focus techniques, habits, or any topic. Returns the most relevant context. ' +
        'Input: plain text query string. ' +
        'Example: "pomodoro technique" | "how to study effectively" | "SMART goals"',

    func: async (query) => {
        try {
            const response = await agentApi.vectorSearch(String(query).trim(), 3);
            const { context, note } = response.data;

            if (!context || context === 'No relevant knowledge found.') {
                return 'No relevant knowledge found in the knowledge base for this query.';
            }

            return note ? `${context}\n\n[Note: ${note}]` : context;
        } catch (error) {
            return `Error searching knowledge base: ${error.response?.data?.message ?? error.message}`;
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool 2: create_task
// ─────────────────────────────────────────────────────────────────────────────

export const createTaskTool = new DynamicStructuredTool({
    name: 'create_task',
    description:
        'Create a new task for the user in the database. ' +
        'Use when the user asks to add, schedule, or create a task or to-do item. ' +
        'Required: title. Optional: description, priority (low/medium/high), due_date (YYYY-MM-DD), exp_reward (1-100). ' +
        'Example: {"title": "Learn LangChain", "priority": "high", "exp_reward": 30}',

    schema: z.object({
        title: z.string()
            .describe('Task title (required)'),
        description: z.string().optional()
            .describe('Detailed description of what to do'),
        priority: z.enum(['low', 'medium', 'high']).optional()
            .describe('Task importance level. Default: medium'),
        due_date: z.string().optional()
            .describe('Deadline in YYYY-MM-DD format'),
        exp_reward: z.number().int().min(1).max(100).optional()
            .describe('XP reward on completion (1-100). Default: 10'),
    }),

    func: async (input) => {
        const data = parseInput(input, 'title');
        const { title, description, priority, due_date, exp_reward } = typeof data === 'object' ? data : { title: data };

        if (!title) return 'Error: title is required to create a task.';

        try {
            const response = await agentApi.createTask({ title, description, priority, due_date, exp_reward });
            const { task, message } = response.data;

            // Notify Tasks page to invalidate its React Query cache
            window.dispatchEvent(new CustomEvent('mentra:task-created', { detail: task }));

            return `${message} (Task ID: ${task.id}, Priority: ${task.priority})`;
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) return `Failed to create task: ${Object.values(errors).flat().join(', ')}`;
            return `Error creating task: ${error.response?.data?.message ?? error.message}`;
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool 3: add_knowledge
// ─────────────────────────────────────────────────────────────────────────────

export const addKnowledgeTool = new DynamicStructuredTool({
    name: 'add_knowledge',
    description:
        'Save a piece of information or note to the knowledge base for future AI search. ' +
        'Use when the user explicitly wants to save a note, tip, learning, or reminder. ' +
        'Required: content. Optional: source label (default: "user_note"). ' +
        'Example: {"content": "Best time to exercise is morning", "source": "user_note"}',

    schema: z.object({
        content: z.string()
            .describe('The text content to save'),
        source: z.string().optional()
            .describe('Source label: "user_note", "learning", "task_description". Default: user_note'),
    }),

    func: async (input) => {
        const data = parseInput(input, 'content');
        const { content, source = 'user_note' } = typeof data === 'object' ? data : { content: data };

        if (!content) return 'Error: content is required.';

        try {
            const response = await agentApi.addKnowledge(content, source);
            const { id, message, embedding_ready } = response.data;
            return `${message} (ID: ${id}, Searchable: ${embedding_ready ? 'Yes' : 'No'})`;
        } catch (error) {
            return `Error saving to knowledge base: ${error.response?.data?.message ?? error.message}`;
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool 4: list_tasks
// ─────────────────────────────────────────────────────────────────────────────

export const listTasksTool = new DynamicStructuredTool({
    name: 'list_tasks',
    description:
        'Get the user\'s current task list from the database. ' +
        'Use when the user asks "what are my tasks?", "show my pending tasks", or "do I have any overdue tasks?". ' +
        'Optional filters: status (pending/in_progress/completed), priority (low/medium/high). ' +
        'Examples: {} | {"status": "pending"} | {"priority": "high"} | {"status": "in_progress"}',

    schema: z.object({
        status: z.enum(['pending', 'in_progress', 'completed']).optional()
            .describe('Filter by task status. Omit to get all tasks.'),
        priority: z.enum(['low', 'medium', 'high']).optional()
            .describe('Filter by priority level. Omit for all priorities.'),
        limit: z.number().int().min(1).max(20).optional()
            .describe('Maximum number of tasks to return. Default: 10'),
    }),

    func: async (input) => {
        const data = parseInput(input);
        const params = typeof data === 'object' ? data : {};

        try {
            const response = await taskApi.list({
                status: params.status,
                priority: params.priority,
                per_page: params.limit ?? 10,
            });

            const tasks = response.data?.data ?? response.data ?? [];

            if (!Array.isArray(tasks) || tasks.length === 0) {
                const filter = params.status ? ` with status "${params.status}"` : '';
                return `No tasks found${filter}.`;
            }

            const formatted = tasks.map((t, i) => {
                const due = t.due_date ? ` | Due: ${t.due_date}` : '';
                const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
                    ? ' ⚠️ OVERDUE'
                    : '';
                return `${i + 1}. [ID:${t.id}] ${t.title} — ${t.priority?.toUpperCase()} priority | Status: ${t.status}${due}${overdue} | +${t.exp_reward} XP`;
            });

            return `Found ${tasks.length} task(s):\n${formatted.join('\n')}`;
        } catch (error) {
            return `Error fetching tasks: ${error.response?.data?.message ?? error.message}`;
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool 5: get_user_stats
// ─────────────────────────────────────────────────────────────────────────────

export const getUserStatsTool = new DynamicTool({
    name: 'get_user_stats',
    description:
        'Get the current user\'s gamification stats: level, XP, streak, tasks completed today, and mood. ' +
        'Use when the user asks about their progress, level, streak, or daily summary. ' +
        'Input: leave empty or write any string (it is ignored, no input needed). ' +
        'Example input: "" | "stats" | "my progress"',

    func: async (_input) => {
        try {
            const response = await dashboardApi.get();
            const d = response.data;

            const user = d.user ?? d;
            const streak = d.streak ?? user.streak ?? {};
            const today = d.today ?? {};
            const mood = d.mood ?? null;

            const lines = [
                `👤 ${user.name ?? 'User'} — Level ${user.level ?? '?'}`,
                `⚡ EXP: ${user.current_exp ?? 0} / ${user.exp_to_next_level ?? 100} (Total: ${user.total_exp ?? 0})`,
                `🔥 Streak: ${streak.current_streak ?? 0} days (Best: ${streak.longest_streak ?? 0})`,
            ];

            if (today.tasks_completed !== undefined) {
                lines.push(`✅ Tasks completed today: ${today.tasks_completed}`);
            }
            if (today.tasks_pending !== undefined) {
                lines.push(`📋 Pending tasks: ${today.tasks_pending}`);
            }
            if (mood) {
                lines.push(`😊 Today's mood: ${mood.mood} (Energy: ${mood.energy_level}/10)`);
            }

            return lines.join('\n');
        } catch (error) {
            // Fallback: try to get user from localStorage if API fails
            try {
                const raw = localStorage.getItem('mentra_user');
                if (raw) {
                    const u = JSON.parse(raw);
                    return `Level ${u.level} | ${u.current_exp}/${u.exp_to_next_level} EXP | Total: ${u.total_exp} EXP`;
                }
            } catch { /* ignore */ }
            return `Error getting user stats: ${error.response?.data?.message ?? error.message}`;
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tool 6: complete_task
// ─────────────────────────────────────────────────────────────────────────────

export const completeTaskTool = new DynamicStructuredTool({
    name: 'complete_task',
    description:
        'Mark a task as completed. The user will receive the XP reward for completing it. ' +
        'Use when the user says "I finished task X", "mark task X as done", or "complete task ID 5". ' +
        'You must provide the task_id (number). Use list_tasks first if you don\'t know the ID. ' +
        'Example: {"task_id": 5} | {"task_id": 12}',

    schema: z.object({
        task_id: z.number().int().positive()
            .describe('The numeric ID of the task to complete. Use list_tasks to find the ID if unknown.'),
    }),

    func: async (input) => {
        const data = parseInput(input, 'task_id');
        const task_id = typeof data === 'object' ? data.task_id : parseInt(data, 10);

        if (!task_id || isNaN(task_id)) {
            return 'Error: task_id (number) is required. Use list_tasks to find the ID first.';
        }

        try {
            const response = await taskApi.complete(task_id);
            const { task, exp_awarded, message } = response.data;

            // Notify Tasks page to refresh
            window.dispatchEvent(new CustomEvent('mentra:task-completed', { detail: { task_id } }));

            if (exp_awarded) {
                return `${message ?? 'Task completed!'} +${exp_awarded} XP awarded! Task: "${task?.title ?? task_id}"`;
            }

            return `Task #${task_id} marked as completed! ${task?.title ? `("${task.title}")` : ''} ${task?.exp_reward ? `+${task.exp_reward} XP` : ''}`;
        } catch (error) {
            if (error.response?.status === 404) {
                return `Task #${task_id} not found. Use list_tasks to see available tasks.`;
            }
            if (error.response?.status === 422) {
                return `Task #${task_id} may already be completed.`;
            }
            return `Error completing task: ${error.response?.data?.message ?? error.message}`;
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Export all tools
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All agent tools — imported in MentraAgent.jsx for the ReAct loop.
 * Order matters: put high-frequency tools first so the LLM sees them first.
 */
export const mentraTools = [
    searchKnowledgeTool,   // 1. knowledge retrieval
    listTasksTool,          // 2. task listing (often needed before create/complete)
    createTaskTool,         // 3. task creation
    completeTaskTool,       // 4. task completion
    getUserStatsTool,       // 5. user stats
    addKnowledgeTool,       // 6. knowledge addition
];

export default mentraTools;
