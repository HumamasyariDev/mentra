<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ForumMessageController;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\PomodoroController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\SandboxController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

//  Public Routes ──
Route::post('/register', [AuthController::class , 'register']);
Route::post('/login', [AuthController::class , 'login']);

//  Protected Routes (Sanctum) ─
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::get('/me', [AuthController::class , 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class , 'index']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{taskId}/complete',   [TaskController::class, 'complete']);
    Route::post('/tasks/{taskId}/uncomplete', [TaskController::class, 'uncomplete']);

    // Quiz (nested under task)
    Route::get('/tasks/{taskId}/quiz',  [QuizController::class, 'show']);
    Route::post('/tasks/{taskId}/quiz', [QuizController::class, 'store']);

    // Pomodoro
    Route::get('/pomodoro', [PomodoroController::class , 'index']);
    Route::get('/pomodoro/stats', [PomodoroController::class , 'stats']);
    Route::post('/pomodoro/start', [PomodoroController::class , 'start']);
    Route::post('/pomodoro/{session}/pause', [PomodoroController::class , 'pause']);
    Route::post('/pomodoro/{session}/resume', [PomodoroController::class , 'resume']);
    Route::post('/pomodoro/{session}/complete', [PomodoroController::class , 'complete']);
    Route::post('/pomodoro/{session}/cancel', [PomodoroController::class , 'cancel']);

    // Schedules
    Route::apiResource('schedules', ScheduleController::class);
    Route::post('/schedules/{schedule}/complete', [ScheduleController::class , 'complete']);
    Route::post('/schedules/{schedule}/uncomplete', [ScheduleController::class , 'uncomplete']);

    // Moods
    Route::get('/moods', [MoodController::class , 'index']);
    Route::post('/moods', [MoodController::class , 'store']);
    Route::get('/moods/today', [MoodController::class , 'today']);
    Route::get('/moods/weekly', [MoodController::class , 'weekly']);
    Route::get('/moods/{mood}', [MoodController::class , 'show']);

    // AI Chat
    Route::post('/chat/send', [ChatController::class , 'send']);
    Route::get('/chat/history', [ChatController::class , 'history']);
    Route::delete('/chat/clear', [ChatController::class , 'clear']);

    // Sandboxes
    Route::get('/sandboxes', [SandboxController::class , 'index']);
    Route::post('/sandboxes', [SandboxController::class , 'store']);
    Route::get('/sandboxes/{sandbox}', [SandboxController::class , 'show']);
    Route::put('/sandboxes/{sandbox}', [SandboxController::class , 'update']);
    Route::delete('/sandboxes/{sandbox}', [SandboxController::class , 'destroy']);
    Route::post('/sandboxes/{sandbox}/messages', [SandboxController::class , 'sendMessage']);


    // Agent API (LangChain.js Tools)
    // These endpoints are designed to be called by the frontend LangChain agent.
    // Each route corresponds to a DynamicTool defined in MentraTools.js.
    Route::prefix('agent')->name('agent.')->group(function () {
            // Tool: search_knowledge — embed query + cosine similarity search via pgvector
            Route::post('/vector-search', [AgentController::class , 'vectorSearch'])->name('vector-search');

            // Tool: create_task — create a task and return XP info for the agent
            Route::post('/tasks', [AgentController::class , 'createTask'])->name('tasks');

            // Utility: add entries to the knowledge base (with auto-embedding)
            Route::post('/knowledge', [AgentController::class , 'addKnowledge'])->name('knowledge');
        }
        );

        // Forum posts routes
        Route::get('/posts', [ForumMessageController::class , 'index']);
        Route::post('/posts', [ForumMessageController::class , 'store']);
        Route::put('/posts/{message}', [ForumMessageController::class , 'update']);
        Route::delete('/posts/{message}', [ForumMessageController::class , 'destroy']);
    });