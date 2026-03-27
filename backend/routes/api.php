<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ForestController;
use App\Http\Controllers\Api\ForumMessageController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\PomodoroController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\SandboxController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\ChatSessionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

//  Public Routes ──
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

//  Protected Routes (Sanctum) ─
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/user/account', [AuthController::class, 'deleteAccount']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{taskId}/complete',   [TaskController::class, 'complete']);
    Route::post('/tasks/{taskId}/uncomplete', [TaskController::class, 'uncomplete']);

    // Quiz (nested under task)
    Route::get('/tasks/{taskId}/quiz',  [QuizController::class, 'show']);
    Route::post('/tasks/{taskId}/quiz', [QuizController::class, 'store']);
    Route::post('/tasks/{taskId}/quiz/attempt', [QuizController::class, 'attempt']);

    // Pomodoro
    Route::get('/pomodoro', [PomodoroController::class, 'index']);
    Route::get('/pomodoro/stats', [PomodoroController::class, 'stats']);
    Route::post('/pomodoro/start', [PomodoroController::class, 'start']);
    Route::post('/pomodoro/{session}/pause', [PomodoroController::class, 'pause']);
    Route::post('/pomodoro/{session}/resume', [PomodoroController::class, 'resume']);
    Route::post('/pomodoro/{session}/complete', [PomodoroController::class, 'complete']);
    Route::post('/pomodoro/{session}/cancel', [PomodoroController::class, 'cancel']);

    // Schedules
    Route::apiResource('schedules', ScheduleController::class);
    Route::post('/schedules/{schedule}/complete', [ScheduleController::class, 'complete']);
    Route::post('/schedules/{schedule}/uncomplete', [ScheduleController::class, 'uncomplete']);

    // Moods (legacy)
    Route::get('/moods', [MoodController::class, 'index']);
    Route::post('/moods', [MoodController::class, 'store']);
    Route::get('/moods/today', [MoodController::class, 'today']);
    Route::get('/moods/weekly', [MoodController::class, 'weekly']);
    Route::get('/moods/{mood}', [MoodController::class, 'show']);

    // Journals
    Route::get('/journals', [JournalController::class, 'index']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals/today', [JournalController::class, 'today']);
    Route::get('/journals/by-date', [JournalController::class, 'byDate']);
    Route::get('/journals/recent', [JournalController::class, 'recent']);
    Route::get('/journals/insights', [JournalController::class, 'insights']);

    // AI Chat
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/chat/history', [ChatController::class, 'history']);
    Route::delete('/chat/clear', [ChatController::class, 'clear']);

    // Sandboxes
    Route::get('/sandboxes', [SandboxController::class, 'index']);
    Route::post('/sandboxes', [SandboxController::class, 'store']);
    Route::get('/sandboxes/{sandbox}', [SandboxController::class, 'show']);
    Route::put('/sandboxes/{sandbox}', [SandboxController::class, 'update']);
    Route::delete('/sandboxes/{sandbox}', [SandboxController::class, 'destroy']);
    Route::post('/sandboxes/{sandbox}/messages', [SandboxController::class, 'storeMessage']);
    Route::get('/sandboxes/{sandbox}/messages', [SandboxController::class, 'getMessages']);


    // Agent API (LangChain.js Tools)
    // These endpoints are designed to be called by the frontend LangChain agent.
    // Each route corresponds to a DynamicTool defined in MentraTools.js.
    Route::prefix('agent')->name('agent.')->group(
        function () {
            // Tool: search_knowledge — embed query + cosine similarity search via pgvector
            Route::post('/vector-search', [AgentController::class, 'vectorSearch'])->name('vector-search');

            // Tool: create_task — create a task and return XP info for the agent
            Route::post('/tasks', [AgentController::class, 'createTask'])->name('tasks');

            // Utility: add entries to the knowledge base (with auto-embedding)
            Route::post('/knowledge', [AgentController::class, 'addKnowledge'])->name('knowledge');
        }
    );

    // Chat Sessions
    Route::get('/chat-sessions', [ChatSessionController::class, 'index']);
    Route::post('/chat-sessions', [ChatSessionController::class, 'store']);
    Route::get('/chat-sessions/{id}', [ChatSessionController::class, 'show']);
    Route::put('/chat-sessions/{id}', [ChatSessionController::class, 'update']);
    Route::delete('/chat-sessions/{id}', [ChatSessionController::class, 'destroy']);
    Route::post('/chat-sessions/{id}/messages', [ChatSessionController::class, 'storeMessage']);
    Route::get('/chat-sessions/{id}/messages', [ChatSessionController::class, 'getMessages']);
    Route::delete('/chat-sessions/{id}/messages', [ChatSessionController::class, 'clearMessages']);

    // Forum posts routes
    Route::get('/posts', [ForumMessageController::class, 'index']);
    Route::post('/posts', [ForumMessageController::class, 'store']);
    Route::put('/posts/{message}', [ForumMessageController::class, 'update']);
    Route::delete('/posts/{message}', [ForumMessageController::class, 'destroy']);

    // Forest (Tree Care)
    Route::prefix('forest')->group(function () {
        Route::get('/', [ForestController::class, 'index']);
        Route::post('/plant', [ForestController::class, 'plant']);
        Route::post('/water/{tree}', [ForestController::class, 'water']);
        Route::get('/tree-types', [ForestController::class, 'treeTypes']);
        Route::post('/debug/skip-stage/{tree}', [ForestController::class, 'debugSkipStage']);
    });

    // AI Routes (NVIDIA API)
    Route::prefix('ai')->group(function () {
        Route::post('/chat', [AIController::class, 'chat']);
        Route::post('/agent', [AIController::class, 'agentChat']);
        Route::post('/sandbox', [AIController::class, 'sandboxChat']);
        Route::post('/quiz/generate', [AIController::class, 'generateQuiz']);
        Route::post('/extract-key-points', [AIController::class, 'extractKeyPoints']);
        Route::post('/mindmap', [AIController::class, 'generateMindMap']);
    });

    // Users Management (Admin Only)
    Route::apiResource('users', UserController::class);
});
