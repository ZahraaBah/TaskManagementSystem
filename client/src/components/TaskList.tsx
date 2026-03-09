import { useState } from 'react';
import type { Task } from '../api/tasks';
import { updateTask, deleteTask } from '../api/tasks';

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
    return <p className="text-center text-gray-500 mt-8">No tasks yet. Create one!</p>;
  }

  return (
    <ul className="space-y-3" data-testid="task-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
          data-testid="task-item"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task)}
              disabled={loadingId === task.id}
              className="w-5 h-5 cursor-pointer"
              data-testid="task-checkbox"
            />
            <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-800'}>
              {task.title}
            </span>
          </div>
          <button
            onClick={() => handleDelete(task.id)}
            disabled={loadingId === task.id}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
            data-testid="delete-button"
          >
            {loadingId === task.id ? 'Loading...' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  );
}