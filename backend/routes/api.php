<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\PomodoroController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);
    Route::post('/tasks/{task}/uncomplete', [TaskController::class, 'uncomplete']);

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

    // Moods
    Route::get('/moods', [MoodController::class, 'index']);
    Route::post('/moods', [MoodController::class, 'store']);
    Route::get('/moods/today', [MoodController::class, 'today']);
    Route::get('/moods/weekly', [MoodController::class, 'weekly']);
    Route::get('/moods/{mood}', [MoodController::class, 'show']);

    // AI Chat
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/chat/history', [ChatController::class, 'history']);
    Route::delete('/chat/clear', [ChatController::class, 'clear']);
});
