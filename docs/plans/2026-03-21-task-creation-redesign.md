# Task Creation Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the lazy AI quizzability check with an explicit user choice at task creation time — normal to-do vs quiz-based task (with study material upload).

**Architecture:** Add a `type` column to tasks (`normal`|`quiz`), a `material` column to quizzes, and a `quiz_attempts` table. The frontend create form gets tabs for the two modes. Quiz-mode tasks generate the quiz via Puter.js at creation time (blocking), and the task can't be completed until the quiz is attempted.

**Tech Stack:** Laravel 12 (PHP), React 19, Puter.js (client-side AI), TanStack Query, Tailwind-style CSS

---

### Task 1: Migration — Add `type` to tasks, `material` to quizzes, create `quiz_attempts`

**Files:**
- Create: `backend/database/migrations/2026_03_21_000001_task_creation_redesign.php`

**Step 1: Create the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add type to tasks
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('type', 10)->default('normal')->after('user_id'); // 'normal' | 'quiz'
            $table->index(['user_id', 'type']);
        });

        // Add material to quizzes
        Schema::table('quizzes', function (Blueprint $table) {
            $table->text('material')->nullable()->after('questions');
        });

        // Create quiz_attempts table
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('score'); // number of correct answers
            $table->integer('total'); // total questions
            $table->jsonb('answers')->nullable(); // { questionIndex: selectedOptionIndex }
            $table->timestamps();

            $table->index(['quiz_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('material');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type']);
            $table->dropColumn('type');
        });
    }
};
```

**Step 2: Run migration**

Run: `php artisan migrate`
Expected: Migration runs successfully, tables updated.

**Step 3: Commit**

```bash
git add backend/database/migrations/2026_03_21_000001_task_creation_redesign.php
git commit -m "feat: migration for task type, quiz material, quiz_attempts"
```

---

### Task 2: Backend Models — Update Task, Quiz, create QuizAttempt

**Files:**
- Modify: `backend/app/Models/Task.php:16-25` — add `type` to fillable + casts
- Modify: `backend/app/Models/Quiz.php:10-17` — add `material` to fillable, add attempts relationship
- Create: `backend/app/Models/QuizAttempt.php`

**Step 1: Update Task model**

In `backend/app/Models/Task.php`, add `'type'` to the `$fillable` array (after `'user_id'`):

```php
protected $fillable = [
    'user_id',
    'type',
    'title',
    'description',
    'priority',
    'status',
    'due_date',
    'exp_reward',
    'completed_at',
];
```

**Step 2: Update Quiz model**

In `backend/app/Models/Quiz.php`:

```php
protected $fillable = ['task_id', 'questions', 'material'];

protected $casts = [
    'questions' => 'array',
];

public function task(): BelongsTo
{
    return $this->belongsTo(Task::class);
}

public function attempts(): HasMany
{
    return $this->hasMany(QuizAttempt::class);
}
```

Add `use Illuminate\Database\Eloquent\Relations\HasMany;` to imports.

**Step 3: Create QuizAttempt model**

Create `backend/app/Models/QuizAttempt.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    protected $fillable = ['quiz_id', 'user_id', 'score', 'total', 'answers'];

    protected $casts = [
        'answers' => 'array',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

**Step 4: Commit**

```bash
git add backend/app/Models/Task.php backend/app/Models/Quiz.php backend/app/Models/QuizAttempt.php
git commit -m "feat: update Task/Quiz models, create QuizAttempt model"
```

---

### Task 3: Backend Controllers — TaskController + QuizController updates

**Files:**
- Modify: `backend/app/Http/Controllers/Api/TaskController.php:29-42` — accept `type` in store
- Modify: `backend/app/Http/Controllers/Api/TaskController.php:76-103` — quiz gate in complete
- Modify: `backend/app/Http/Controllers/Api/TaskController.php:18-27` — eager load quiz + attempts count in index
- Modify: `backend/app/Http/Controllers/Api/QuizController.php:54-97` — accept `material` in store
- Add: `backend/app/Http/Controllers/Api/QuizController.php` — new `attempt()` method

**Step 1: Update TaskController::store to accept `type`**

In `backend/app/Http/Controllers/Api/TaskController.php`, update the `store` method validation:

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'type' => ['sometimes', 'in:normal,quiz'],
        'priority' => ['in:low,medium,high'],
        'due_date' => ['nullable', 'date'],
        'exp_reward' => ['nullable', 'integer', 'min:1', 'max:100'],
    ]);

    $task = $request->user()->tasks()->create($validated);

    return response()->json($task, 201);
}
```

**Step 2: Update TaskController::index to eager-load quiz info**

```php
public function index(Request $request): JsonResponse
{
    $tasks = $request->user()->tasks()
        ->with(['quiz:id,task_id', 'quiz.attempts' => function ($q) use ($request) {
            $q->where('user_id', $request->user()->id)->latest()->limit(1);
        }])
        ->when($request->status, fn($q, $status) => $q->where('status', $status))
        ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
        ->orderBy('created_at', 'desc')
        ->paginate($request->per_page ?? 15);

    return response()->json($tasks);
}
```

**Step 3: Add quiz gate to TaskController::complete**

```php
public function complete(Request $request, int $id): JsonResponse
{
    $task = $request->user()->tasks()->findOrFail($id);

    if ($task->status === 'completed') {
        return response()->json(['message' => 'Task already completed.'], 422);
    }

    // Quiz gate: quiz tasks require at least one quiz attempt
    if ($task->type === 'quiz') {
        $quiz = $task->quiz;
        if (!$quiz) {
            return response()->json(['message' => 'Quiz task has no quiz. Cannot complete.'], 422);
        }
        $hasAttempt = $quiz->attempts()->where('user_id', $request->user()->id)->exists();
        if (!$hasAttempt) {
            return response()->json(['message' => 'You must complete the quiz before marking this task as done.'], 422);
        }
    }

    $task->update([
        'status' => 'completed',
        'completed_at' => now(),
    ]);

    $this->expService->awardExp(
        $request->user(),
        $task->exp_reward,
        'task',
        $task,
        "Completed task: {$task->title}"
    );

    $this->streakService->recordActivity($request->user());

    return response()->json([
        'task' => $task->fresh(),
        'message' => "Task completed! +{$task->exp_reward} EXP",
    ]);
}
```

**Step 4: Update QuizController::store to accept `material`**

In `backend/app/Http/Controllers/Api/QuizController.php`, update the `store` method:

```php
public function store(Request $request, int $taskId): JsonResponse
{
    $task = $request->user()->tasks()->findOrFail($taskId);

    $validated = $request->validate([
        'questions' => ['required', 'array', 'min:1', 'max:20'],
        'questions.*.question' => ['required', 'string'],
        'questions.*.options' => ['required', 'array', 'min:2'],
        'questions.*.correct_index' => ['nullable', 'integer'],
        'questions.*.answer' => ['nullable'],
        'questions.*.explanation' => ['nullable', 'string'],
        'material' => ['nullable', 'string', 'max:50000'],
    ]);

    // Normalise: resolve answer → correct_index integer
    $normalized = array_map(function (array $q) {
        $answer = $q['correct_index'] ?? $q['answer'] ?? 0;

        if (is_string($answer) && preg_match('/^[A-Da-d]$/', $answer)) {
            $answer = ord(strtoupper($answer)) - ord('A');
        }

        return [
            'question' => $q['question'],
            'options' => array_values($q['options']),
            'correct_index' => (int)$answer,
            'explanation' => $q['explanation'] ?? null,
        ];
    }, $validated['questions']);

    $quiz = Quiz::updateOrCreate(
        ['task_id' => $task->id],
        [
            'questions' => $normalized,
            'material' => $validated['material'] ?? null,
        ]
    );

    return response()->json([
        'id' => $quiz->id,
        'task_id' => $quiz->task_id,
        'questions' => $quiz->questions,
        'message' => $quiz->wasRecentlyCreated ? 'Quiz saved.' : 'Quiz updated.',
    ], $quiz->wasRecentlyCreated ? 201 : 200);
}
```

**Step 5: Add QuizController::attempt method**

Add this method to `QuizController`:

```php
/**
 * POST /api/tasks/{taskId}/quiz/attempt
 *
 * Records a quiz attempt. Frontend sends score, total, and answers map.
 */
public function attempt(Request $request, int $taskId): JsonResponse
{
    $task = $request->user()->tasks()->findOrFail($taskId);
    $quiz = $task->quiz;

    if (!$quiz) {
        return response()->json(['message' => 'No quiz found for this task.'], 404);
    }

    $validated = $request->validate([
        'score' => ['required', 'integer', 'min:0'],
        'total' => ['required', 'integer', 'min:1'],
        'answers' => ['nullable', 'array'],
    ]);

    $attempt = $quiz->attempts()->create([
        'user_id' => $request->user()->id,
        'score' => $validated['score'],
        'total' => $validated['total'],
        'answers' => $validated['answers'] ?? null,
    ]);

    return response()->json([
        'attempt' => $attempt,
        'message' => "Quiz attempt recorded: {$attempt->score}/{$attempt->total}",
    ], 201);
}
```

Add the `QuizAttempt` import at the top of QuizController if needed.

**Step 6: Update QuizController::show to include attempt info**

```php
public function show(Request $request, int $taskId): JsonResponse
{
    $task = $request->user()->tasks()->findOrFail($taskId);
    $quiz = $task->quiz;

    if (!$quiz) {
        return response()->json(['message' => 'No quiz found for this task.'], 404);
    }

    $latestAttempt = $quiz->attempts()
        ->where('user_id', $request->user()->id)
        ->latest()
        ->first();

    return response()->json([
        'id' => $quiz->id,
        'task_id' => $quiz->task_id,
        'questions' => $quiz->questions,
        'has_attempt' => $latestAttempt !== null,
        'latest_attempt' => $latestAttempt,
        'created_at' => $quiz->created_at,
        'updated_at' => $quiz->updated_at,
    ]);
}
```

**Step 7: Commit**

```bash
git add backend/app/Http/Controllers/Api/TaskController.php backend/app/Http/Controllers/Api/QuizController.php
git commit -m "feat: task type support, quiz gate, quiz attempt endpoint"
```

---

### Task 4: Backend Route — Add quiz attempt route

**Files:**
- Modify: `backend/routes/api.php:37-39` — add attempt route

**Step 1: Add the route**

After line 39 in `backend/routes/api.php`, add:

```php
Route::post('/tasks/{taskId}/quiz/attempt', [QuizController::class, 'attempt']);
```

So the quiz routes section becomes:

```php
// Quiz (nested under task)
Route::get('/tasks/{taskId}/quiz',  [QuizController::class, 'show']);
Route::post('/tasks/{taskId}/quiz', [QuizController::class, 'store']);
Route::post('/tasks/{taskId}/quiz/attempt', [QuizController::class, 'attempt']);
```

**Step 2: Commit**

```bash
git add backend/routes/api.php
git commit -m "feat: add quiz attempt route"
```

---

### Task 5: Frontend API — Add quiz attempt endpoint

**Files:**
- Modify: `frontend/src/services/api.js:126-129` — add attempt method to quizApi

**Step 1: Update quizApi**

In `frontend/src/services/api.js`, update the `quizApi` object:

```js
// Quiz API
export const quizApi = {
  get: (taskId) => api.get(`/tasks/${taskId}/quiz`),
  save: (taskId, questions, material = null) =>
    api.post(`/tasks/${taskId}/quiz`, { questions, material }),
  attempt: (taskId, score, total, answers = null) =>
    api.post(`/tasks/${taskId}/quiz/attempt`, { score, total, answers }),
};
```

**Step 2: Commit**

```bash
git add frontend/src/services/api.js
git commit -m "feat: add quiz attempt + material API methods"
```

---

### Task 6: Frontend — Update `quizHelpers.js`

**Files:**
- Modify: `frontend/src/utils/quizHelpers.js` — remove `checkQuizzability`, update `generateQuiz` to accept material text

**Step 1: Rewrite quizHelpers.js**

Replace contents with:

```js
/**
 * Generates an array of quiz questions from study material via Puter.js.
 * Returns a parsed array of quiz objects or null on failure.
 *
 * Each quiz shape:
 * {
 *   question: string,
 *   options: string[],      // exactly 4
 *   correct_index: number,  // 0-3
 *   explanation: string,
 * }
 */
export async function generateQuizFromMaterial(material, count = 5) {
    if (!window.puter?.ai?.chat) {
        throw new Error('Puter.js is not available. Please make sure you are logged in.');
    }

    const prompt = `Based on the following study material, generate ${count} different multiple-choice quiz questions.
Return ONLY raw JSON — no markdown backticks, no explanation, no extra text.
Return a JSON array with exactly ${count} items using this exact structure:
[{"question":"...","options":["...","...","...","..."],"correct_index":0,"explanation":"..."}]
Rules:
- Each "options" must have exactly 4 items
- "correct_index" is the 0-based index of the correct answer
- "explanation" is a short 1-2 sentence explanation
- All ${count} questions must be distinct and cover different aspects of the material
- Questions should test understanding, not just memorization

STUDY MATERIAL:
${material}`;

    const raw = await window.puter.ai.chat([
        { role: 'system', content: 'You are a quiz generator. Output ONLY raw JSON, no other text.' },
        { role: 'user', content: prompt },
    ], { model: 'claude-sonnet-4-5' });

    const text = extractText(raw).trim();

    // Strip potential markdown fences
    const cleaned = text
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();

    const quizArray = JSON.parse(cleaned);

    if (!Array.isArray(quizArray)) throw new Error('Expected array');

    // Validate and filter each item
    const valid = quizArray.filter(
        (q) =>
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correct_index === 'number' &&
            typeof q.explanation === 'string'
    );

    if (valid.length === 0) throw new Error('No valid quiz items');

    return valid;
}

/**
 * Extracts text from a file using FileReader.
 * Supports .txt and .md files directly.
 * Returns the text content as a string.
 */
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/** Extracts plain text from various Puter response shapes */
function extractText(response) {
    if (typeof response === 'string') return response;
    return (
        response?.message?.content?.[0]?.text ??
        response?.message?.content ??
        response?.content ??
        ''
    );
}
```

**Step 2: Commit**

```bash
git add frontend/src/utils/quizHelpers.js
git commit -m "feat: replace checkQuizzability with generateQuizFromMaterial"
```

---

### Task 7: Frontend — Redesign `TaskCreateForm.jsx`

**Files:**
- Modify: `frontend/src/components/tasks/TaskCreateForm.jsx` — full rewrite with Normal/Quiz tabs

**Step 1: Rewrite TaskCreateForm**

```jsx
import { useState } from 'react';
import { Loader2, FileText, Upload, X } from 'lucide-react';
import { generateQuizFromMaterial, readFileAsText } from '../../utils/quizHelpers';
import { quizApi } from '../../services/api';
import '../../styles/components/tasks/TaskComponents.css';

export default function TaskCreateForm({ onSubmit, isPending }) {
  const [taskType, setTaskType] = useState('normal'); // 'normal' | 'quiz'
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });
  const [material, setMaterial] = useState('');
  const [file, setFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'medium', due_date: '' });
    setMaterial('');
    setFile(null);
    setError('');
    setGenerating(false);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    try {
      const text = await readFileAsText(selectedFile);
      setMaterial(text);
    } catch {
      setError('Failed to read file. Please try a .txt or .md file.');
    }
  };

  const removeFile = () => {
    setFile(null);
    setMaterial('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (taskType === 'quiz') {
      if (!material.trim()) {
        setError('Please provide study material for the quiz.');
        return;
      }

      setGenerating(true);
      try {
        // 1. Generate quiz from material via Puter.js
        const questions = await generateQuizFromMaterial(material.trim());

        // 2. Create the task (with type: 'quiz')
        const taskPayload = { ...form, type: 'quiz' };
        // Use a callback pattern: onSubmit creates the task, returns the task object
        onSubmit(taskPayload, resetForm, async (createdTask) => {
          // 3. Save quiz + material to backend
          await quizApi.save(createdTask.id, questions, material.trim());
        });
      } catch (err) {
        console.error('[TaskCreateForm] Quiz generation error:', err);
        setError('Failed to generate quiz. Please check your material and try again.');
        setGenerating(false);
      }
    } else {
      // Normal task — simple create
      onSubmit({ ...form, type: 'normal' }, resetForm);
    }
  };

  const isSubmitting = isPending || generating;

  return (
    <form onSubmit={handleSubmit} className="task-create-form">
      {/* Type Tabs */}
      <div className="task-type-tabs">
        <button
          type="button"
          className={`task-type-tab ${taskType === 'normal' ? 'active' : ''}`}
          onClick={() => setTaskType('normal')}
        >
          <FileText style={{ width: '1rem', height: '1rem' }} />
          Normal Task
        </button>
        <button
          type="button"
          className={`task-type-tab ${taskType === 'quiz' ? 'active' : ''}`}
          onClick={() => setTaskType('quiz')}
        >
          <Zap style={{ width: '1rem', height: '1rem' }} />
          Quiz Task
        </button>
      </div>

      <div className="task-create-form-grid">
        <div className="task-form-group">
          <label className="task-form-label">Title</label>
          <input
            type="text"
            className="task-form-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to be done?"
            required
          />
        </div>
        <div className="task-form-group">
          <label className="task-form-label">Description (optional)</label>
          <textarea
            className="task-form-input task-form-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add details..."
          />
        </div>
        <div className="task-create-form-row">
          <div className="task-form-group">
            <label className="task-form-label">Priority</label>
            <select
              className="task-form-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="task-form-group">
            <label className="task-form-label">Due Date (optional)</label>
            <input
              type="date"
              className="task-form-input"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>

        {/* Quiz Material Section */}
        {taskType === 'quiz' && (
          <div className="task-form-group">
            <label className="task-form-label">Study Material</label>
            <p className="task-form-hint">Paste your study notes or upload a text file. A quiz will be generated from this material.</p>
            <textarea
              className="task-form-input task-form-textarea task-form-material"
              rows={6}
              value={material}
              onChange={(e) => { setMaterial(e.target.value); setFile(null); }}
              placeholder="Paste your study material here..."
            />
            <div className="task-form-file-row">
              <label className="task-form-file-btn">
                <Upload style={{ width: '0.875rem', height: '0.875rem' }} />
                Upload File
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              {file && (
                <span className="task-form-file-name">
                  {file.name}
                  <button type="button" onClick={removeFile} className="task-form-file-remove">
                    <X style={{ width: '0.75rem', height: '0.75rem' }} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="task-form-error">{error}</p>}

      <div className="task-form-actions">
        <button
          type="submit"
          className="task-form-btn task-form-btn-primary task-form-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="task-form-spinner" />}
          {generating ? 'Generating Quiz…' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
```

**NOTE:** The `Zap` icon import needs to be added. The full import line:
```js
import { Loader2, FileText, Upload, X, Zap } from 'lucide-react';
```

**Step 2: Update the parent `Tasks.jsx` handleCreate**

The `onSubmit` callback signature changes to support the async quiz save step. In `frontend/src/pages/Tasks.jsx`, update `handleCreate`:

```js
const handleCreate = async (formData, resetForm, afterCreate) => {
  createMutation.mutate(formData, {
    onSuccess: async (response) => {
      if (afterCreate) {
        try {
          await afterCreate(response.data);
        } catch (err) {
          console.error('[Tasks] Post-create callback error:', err);
        }
      }
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
    },
  });
};
```

Also remove the duplicate `setShowForm(false)` from the mutation's `onSuccess` if needed (it should only be in `handleCreate`).

**Step 3: Commit**

```bash
git add frontend/src/components/tasks/TaskCreateForm.jsx frontend/src/pages/Tasks.jsx
git commit -m "feat: redesign TaskCreateForm with Normal/Quiz tabs"
```

---

### Task 8: Frontend — Update `TaskItem.jsx` (remove AI check, add quiz gate UI)

**Files:**
- Modify: `frontend/src/components/tasks/TaskItem.jsx`

**Step 1: Rewrite TaskItem**

Key changes:
- Remove `checkQuizzability` import and useEffect
- Show quiz button based on `task.type === 'quiz'` instead of AI check
- Disable complete toggle if `task.type === 'quiz'` and no quiz attempt exists
- Add "Complete quiz first" visual hint
- Keep retake quiz option always available for quiz tasks

Replace the entire `TaskItem.jsx` with:

```jsx
import { useState, useRef } from 'react';
import { CheckCircle2, Circle, Trash2, Clock, Zap, Lock } from 'lucide-react';
import { quizApi } from '../../services/api';
import QuizModal from './QuizModal';
import '../../styles/components/tasks/TaskComponents.css';

const priorityColors = {
  low: 'task-item-priority-low',
  medium: 'task-item-priority-medium',
  high: 'task-item-priority-high',
};

export default function TaskItem({ task, onComplete, onUncomplete, onDelete, compact = false }) {
  const isCompleted = task.status === 'completed';
  const isQuizTask = task.type === 'quiz';
  const cardRef = useRef(null);

  // Quiz attempt status from eager-loaded data
  const hasQuizAttempt = task.quiz?.attempts?.length > 0;
  const quizLocked = isQuizTask && !hasQuizAttempt && !isCompleted;

  // --- Quiz state ---
  const [showModal, setShowModal]     = useState(false);
  const [quizList, setQuizList]       = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [bonusMsg, setBonusMsg]       = useState('');
  // Track if user just completed a quiz attempt (to unlock complete btn)
  const [justAttempted, setJustAttempted] = useState(false);

  const handleToggle = () => {
    if (isCompleted) {
      onUncomplete?.(task.id);
    } else if (quizLocked && !justAttempted) {
      // Can't complete — quiz not attempted
      return;
    } else {
      onComplete?.(task.id, cardRef.current);
    }
  };

  /**
   * handleOpenQuiz — fetch quiz from DB.
   */
  const handleOpenQuiz = async () => {
    setQuizList(null);
    setShowModal(true);
    setQuizLoading(true);

    try {
      const response = await quizApi.get(task.id);
      setQuizList(response.data.questions);
    } catch (err) {
      console.error('[Quiz] Fetch error:', err);
      setQuizList(null);
    } finally {
      setQuizLoading(false);
    }
  };

  /**
   * handleQuizDone — called when quiz modal finishes (user clicks Done).
   * Records the attempt to backend.
   */
  const handleQuizDone = async (correctCount, totalCount, answersMap) => {
    try {
      await quizApi.attempt(task.id, correctCount, totalCount, answersMap);
      setJustAttempted(true);
      if (correctCount > 0) {
        setBonusMsg(`+${correctCount} Log`);
        setTimeout(() => setBonusMsg(''), 3000);
      }
    } catch (err) {
      console.error('[Quiz] Attempt save error:', err);
    }
  };

  // ── Compact view ───────────────────────────────────────────
  if (compact) {
    return (
      <div ref={cardRef} className={`task-item-compact ${isCompleted ? 'completed' : ''}`}>
        <button onClick={handleToggle} className="task-item-toggle-btn">
          {isCompleted ? (
            <CheckCircle2 className="task-item-icon completed" />
          ) : (
            <Circle className="task-item-icon incomplete" />
          )}
        </button>
        <span className={`task-item-title-compact ${isCompleted ? 'completed' : 'incomplete'}`}>
          {task.title}
        </span>
        {isQuizTask && (
          <span className="task-item-quiz-badge-compact">
            <Zap style={{ width: '0.625rem', height: '0.625rem' }} /> Quiz
          </span>
        )}
        <span className={`task-item-priority-badge ${priorityColors[task.priority]}`}>
          {task.priority[0].toUpperCase()}
        </span>
      </div>
    );
  }

  // ── Full card view ─────────────────────────────────────────
  return (
    <>
      <div ref={cardRef} className={`task-item-card ${isCompleted ? 'completed' : ''} ${isQuizTask ? 'quiz-task' : ''}`}>
        <button
          onClick={handleToggle}
          className="task-item-toggle-btn-full"
          disabled={quizLocked && !justAttempted}
          title={quizLocked && !justAttempted ? 'Complete the quiz first' : undefined}
        >
          {isCompleted ? (
            <CheckCircle2 className="task-item-icon-full completed" />
          ) : quizLocked && !justAttempted ? (
            <Lock className="task-item-icon-full locked" />
          ) : (
            <Circle className="task-item-icon-full incomplete" />
          )}
        </button>

        <div className="task-item-content">
          <p className={`task-item-title ${isCompleted ? 'completed' : 'incomplete'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="task-item-description">{task.description}</p>
          )}
          <div className="task-item-meta">
            <span className={`task-item-priority-badge ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {isQuizTask && (
              <span className="task-item-type-badge quiz">
                <Zap style={{ width: '0.75rem', height: '0.75rem' }} /> Quiz Task
              </span>
            )}
            {task.due_date && (
              <span className="task-item-meta-item">
                <Clock className="task-item-meta-icon" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="task-item-exp-badge">+{task.exp_reward} EXP</span>

            {bonusMsg && (
              <span className="task-item-bonus-msg">
                {bonusMsg}
              </span>
            )}
          </div>

          {/* Quiz gate hint */}
          {quizLocked && !justAttempted && (
            <p className="task-item-quiz-hint">Complete the quiz to unlock this task</p>
          )}
        </div>

        <div className="task-item-actions">
          {/* Quiz button — shown for all quiz tasks (take or retake) */}
          {isQuizTask && (
            <button
              onClick={handleOpenQuiz}
              title={hasQuizAttempt || justAttempted ? 'Retake Quiz' : 'Take Quiz'}
              className="task-item-quiz-btn"
            >
              <Zap className="task-item-quiz-icon" />
              {hasQuizAttempt || justAttempted ? 'Retake' : 'Quiz'}
            </button>
          )}

          <button
            onClick={() => onDelete?.(task.id)}
            className="task-item-delete-btn"
          >
            <Trash2 className="task-item-delete-icon" />
          </button>
        </div>
      </div>

      {/* Quiz Modal */}
      {showModal && (
        <QuizModal
          quizList={quizList}
          isLoading={quizLoading}
          onClose={() => setShowModal(false)}
          onDone={handleQuizDone}
        />
      )}
    </>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/tasks/TaskItem.jsx
git commit -m "feat: TaskItem uses task.type, quiz gate, no AI check"
```

---

### Task 9: Frontend — Update `QuizModal.jsx` (attempt tracking, retake)

**Files:**
- Modify: `frontend/src/components/tasks/QuizModal.jsx`

**Step 1: Update QuizModal**

Key changes:
- Replace `onCorrect` callback with `onDone(correctCount, totalCount, answersMap)` that sends all attempt data
- Remove the `onRegenerate` prop (no longer needed — quiz is pre-generated)
- Call `onDone` when user finishes the quiz (clicks "Done" on summary screen)

Update the component signature and the `handleClose` / done logic:

In the props, change from:
```js
export default function QuizModal({ quizList, isLoading, onClose, onCorrect, onRegenerate })
```
to:
```js
export default function QuizModal({ quizList, isLoading, onClose, onDone })
```

Update `handleClose`:
```js
const handleClose = () => {
    if (isDone && onDone) {
        const answersMap = {};
        Object.keys(submitted).forEach((i) => {
            answersMap[i] = answers[i] ?? null;
        });
        onDone(correctCount, total, answersMap);
    }
    onClose();
};
```

Remove the `onRegenerate` button from the header and all references to `onRegenerate`.

**Step 2: Commit**

```bash
git add frontend/src/components/tasks/QuizModal.jsx
git commit -m "feat: QuizModal sends attempt data on done, remove regenerate"
```

---

### Task 10: Frontend CSS — Add styles for new task type UI

**Files:**
- Modify: `frontend/src/styles/components/tasks/TaskComponents.css` — append new styles

**Step 1: Add CSS at end of file**

Append to `TaskComponents.css`:

```css
/* ── Task Type Tabs ──────────────────────────────────────────── */
.task-type-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.25rem;
  background: #f5f5f7;
  border-radius: 10px;
}

.task-type-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #86868b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-type-tab:hover {
  color: #1a1a1a;
}

.task-type-tab.active {
  background: #ffffff;
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ── Quiz Material Input ─────────────────────────────────────── */
.task-form-hint {
  font-size: 0.8125rem;
  color: #86868b;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.task-form-material {
  min-height: 8rem;
  font-family: inherit;
}

.task-form-file-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.task-form-file-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
  background: #fafafa;
  color: #6e7781;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-form-file-btn:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  background: #f5f5f7;
}

.task-form-file-name {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #6366f1;
  font-weight: 500;
  background: #f0f1ff;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
}

.task-form-file-remove {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.task-form-file-remove:hover {
  color: #ef4444;
}

.task-form-error {
  color: #dc2626;
  font-size: 0.8125rem;
  font-weight: 500;
  margin: 0.5rem 0 0;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

/* ── Quiz Task Item Styles ───────────────────────────────────── */
.task-item-card.quiz-task::before {
  background: #6d28d9;
}

.task-item-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
}

.task-item-type-badge.quiz {
  background: #f5f3ff;
  color: #6d28d9;
}

.task-item-icon-full.locked {
  color: #d2d2d7;
}

.task-item-quiz-hint {
  font-size: 0.75rem;
  color: #6d28d9;
  font-weight: 500;
  margin: 0;
  padding: 0.25rem 0.5rem;
  background: #f5f3ff;
  border-radius: 6px;
  display: inline-block;
}

.task-item-quiz-badge-compact {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.625rem;
  color: #6d28d9;
  background: #f5f3ff;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/components/tasks/TaskComponents.css
git commit -m "feat: CSS for task type tabs, quiz material input, quiz badges"
```

---

### Task 11: Cleanup — Remove dead code

**Files:**
- Modify: `frontend/src/utils/quizHelpers.js` — `checkQuizzability` already removed in Task 6
- Verify: no other files import `checkQuizzability`

**Step 1: Search for remaining references**

Run: `grep -r "checkQuizzability" frontend/src/`
Expected: No results (already removed from `quizHelpers.js` and `TaskItem.jsx`).

**Step 2: Search for old generateQuiz references**

Run: `grep -r "generateQuiz" frontend/src/`
Expected: Only `generateQuizFromMaterial` in `quizHelpers.js` and its import in `TaskCreateForm.jsx`.

**Step 3: Commit final cleanup if any straggling references found**

```bash
git add -A
git commit -m "chore: remove dead checkQuizzability references"
```

---

### Task 12: Manual Testing Checklist

Test the following flows:

1. **Normal task creation** — Create a task with Normal tab selected → task appears in list without quiz badge, can be completed immediately
2. **Quiz task creation** — Switch to Quiz tab, paste study material, click Create → spinner shows "Generating Quiz…" → task appears with purple "Quiz Task" badge
3. **Quiz gate** — Try to check-mark a quiz task before taking the quiz → should be locked (Lock icon, "Complete quiz first" hint)
4. **Take quiz** — Click Quiz button → modal opens with pre-generated questions → complete quiz → modal shows results → click Done
5. **Unlock after quiz** — After quiz attempt, task checkbox should be unlockable → check mark to complete → EXP awarded
6. **Retake quiz** — Completed quiz task still shows "Retake" button → can re-take the same quiz
7. **File upload** — Create quiz task using file upload (.txt) → material populates textarea → quiz generates from file content
