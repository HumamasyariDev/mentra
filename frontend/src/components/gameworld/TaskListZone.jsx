/**
 * TaskListZone.jsx
 * ----------------
 * Renders a vertical list of to-do task cards.
 * Each card has a "Done" button that triggers the cutscene.
 *
 * Props:
 *  - tasks: Array of { id, title, exp } objects
 *  - onComplete: (taskId, cardElement) => void
 *  - taskRefs: React.MutableRefObject<Map> — parent-managed map of id → DOM element
 *
 * Uses forwardRef to expose the zone container ref to the parent.
 */
import { forwardRef } from 'react';

/* ---------- Hardcoded demo tasks ---------- */
export const DEMO_TASKS = [
    { id: 1, title: 'Finish the landing page design', exp: 50 },
    { id: 2, title: 'Write unit tests for auth module', exp: 75 },
    { id: 3, title: 'Review pull request #42', exp: 30 },
    { id: 4, title: 'Deploy staging environment', exp: 100 },
    { id: 5, title: 'Update project documentation', exp: 40 },
];

const TaskListZone = forwardRef(function TaskListZone({ tasks, onComplete, taskRefs }, ref) {
    return (
        <div ref={ref} className="zone zone--tasks">
            {/* ---- Header ---- */}
            <div className="zone--tasks__header">
                <h1 className="zone--tasks__title">
                    Quest <span>Board</span>
                </h1>
                <p className="zone--tasks__subtitle">
                    Complete a task to fuel the campfire 🔥
                </p>
            </div>

            {/* ---- Task list ---- */}
            <div className="zone--tasks__list">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="task-card"
                        ref={(el) => {
                            if (el) taskRefs.current.set(task.id, el);
                            else taskRefs.current.delete(task.id);
                        }}
                    >
                        {/* Task info */}
                        <div className="task-card__info">
                            <p className="task-card__name">{task.title}</p>
                            <span className="task-card__exp">+{task.exp} EXP</span>
                        </div>

                        {/* Done button */}
                        <button
                            className="task-card__done-btn"
                            onClick={() => {
                                const cardEl = taskRefs.current.get(task.id);
                                onComplete(task.id, cardEl);
                            }}
                        >
                            Done ✓
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default TaskListZone;
