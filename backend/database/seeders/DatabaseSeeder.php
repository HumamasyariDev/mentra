<?php

namespace Database\Seeders;

use App\Models\Mood;
use App\Models\PomodoroSession;
use App\Models\Schedule;
use App\Models\Streak;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::create([
            'name' => 'Mentra User',
            'email' => 'admin@mentra.app',
            'password' => Hash::make('password'),
            'level' => 3,
            'total_exp' => 280,
            'current_exp' => 80,
        ]);

        Streak::create([
            'user_id' => $user->id,
            'current_streak' => 5,
            'longest_streak' => 5,
            'last_activity_date' => today(),
        ]);

        // Tasks
        Task::insert([
            [
                'user_id' => $user->id,
                'title' => 'Setup project structure',
                'description' => 'Initialize Laravel and React projects',
                'priority' => 'high',
                'status' => 'completed',
                'exp_reward' => 20,
                'due_date' => null,
                'completed_at' => now()->subDays(2),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(2),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Design database schema',
                'description' => 'Create migrations for all MVP tables',
                'priority' => 'high',
                'status' => 'completed',
                'exp_reward' => 25,
                'due_date' => null,
                'completed_at' => now()->subDay(),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDay(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Build API endpoints',
                'description' => 'Create controllers and routes',
                'priority' => 'high',
                'status' => 'in_progress',
                'exp_reward' => 30,
                'due_date' => null,
                'completed_at' => null,
                'created_at' => now()->subDay(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Write documentation',
                'description' => 'Document API endpoints and setup guide',
                'priority' => 'medium',
                'status' => 'pending',
                'exp_reward' => 15,
                'due_date' => null,
                'completed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Review pull requests',
                'description' => null,
                'priority' => 'low',
                'status' => 'pending',
                'exp_reward' => 10,
                'due_date' => today()->addDays(2),
                'completed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Schedules
        Schedule::insert([
            [
                'user_id' => $user->id,
                'title' => 'Morning Exercise',
                'description' => '30 minutes workout',
                'type' => 'daily',
                'start_time' => '07:00',
                'end_time' => '07:30',
                'days_of_week' => null,
                'day_of_month' => null,
                'is_active' => true,
                'exp_reward' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Read a book',
                'description' => 'Read for 20 minutes before bed',
                'type' => 'daily',
                'start_time' => '21:00',
                'end_time' => '21:20',
                'days_of_week' => null,
                'day_of_month' => null,
                'is_active' => true,
                'exp_reward' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'title' => 'Weekly Review',
                'description' => 'Review goals and progress',
                'type' => 'weekly',
                'start_time' => '10:00',
                'end_time' => '11:00',
                'days_of_week' => json_encode([0]),
                'day_of_month' => null,
                'is_active' => true,
                'exp_reward' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Pomodoro sessions
        PomodoroSession::insert([
            [
                'user_id' => $user->id,
                'task_id' => 1,
                'duration_minutes' => 25,
                'break_minutes' => 5,
                'status' => 'completed',
                'exp_reward' => 15,
                'started_at' => now()->subDays(2)->setHour(9),
                'ended_at' => now()->subDays(2)->setHour(9)->addMinutes(25),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'user_id' => $user->id,
                'task_id' => 2,
                'duration_minutes' => 45,
                'break_minutes' => 10,
                'status' => 'completed',
                'exp_reward' => 15,
                'started_at' => now()->subDay()->setHour(14),
                'ended_at' => now()->subDay()->setHour(14)->addMinutes(45),
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
        ]);

        // Mood entries
        Mood::insert([
            [
                'user_id' => $user->id,
                'mood' => 'good',
                'energy_level' => 7,
                'note' => 'Productive day!',
                'date' => today()->subDays(2),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'user_id' => $user->id,
                'mood' => 'great',
                'energy_level' => 9,
                'note' => 'Finished major tasks',
                'date' => today()->subDay(),
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
            [
                'user_id' => $user->id,
                'mood' => 'okay',
                'energy_level' => 5,
                'note' => null,
                'date' => today(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
