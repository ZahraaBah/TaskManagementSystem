import { useState } from 'react';
import type { Task } from '.././api/tasks';
import { updateTask, deleteTask } from '.././api/tasks';

interface TaskListProps {
  tasks: Task[];
  onTasksChange: () => void;
}

export default function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (task: Task) => {
    setLoadingId(task.id);
    await updateTask(task.id, { completed: !task.completed });
    onTasksChange();
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await deleteTask(id);
    onTasksChange();
    setLoadingId(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="task-empty">
        <div className="task-empty-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <p className="task-empty-title">No tasks yet. Create one!</p>
      </div>
    );
  }

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div>
      <div className="task-list-meta">
        <span className="task-count">{tasks.length} tasks</span>
        <span className="task-progress-label">
          {completed}/{tasks.length} done
        </span>
      </div>

      <div className="task-progress-bar-wrap">
        <div
          className="task-progress-bar-fill"
          style={{
            width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%`,
          }}
        />
      </div>

      <ul className="task-list" data-testid="task-list">
        {tasks.map((task, index) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? 'task-item--done' : ''}`}
            style={{ animationDelay: `${index * 60}ms` }}
            data-testid="task-item"
          >
            <button
              className={`task-checkbox ${task.completed ? 'task-checkbox--checked' : ''}`}
              onClick={() => handleToggle(task)}
              disabled={loadingId === task.id}
              data-testid="task-checkbox"
              aria-label="Toggle task"
            >
              {task.completed && (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>

            <div className="task-content">
              <span
                className={`task-title ${task.completed ? 'task-title--done' : ''}`}
              >
                {task.title}
              </span>
              {task.description && (
                <span className="task-desc">{task.description}</span>
              )}
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              disabled={loadingId === task.id}
              className="task-delete-btn"
              data-testid="delete-button"
              aria-label="Delete task"
            >
              {loadingId === task.id ? (
                <span className="task-spinner task-spinner--sm" />
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
