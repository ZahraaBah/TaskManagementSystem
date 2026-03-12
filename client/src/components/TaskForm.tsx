import { useState } from 'react';
import { createTask } from '../api/tasks';

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createTask({ title, description: description || undefined });
      setTitle('');
      setDescription('');
      onTaskCreated();
    } catch {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-card mb-6" data-testid="task-form">
      <div className="task-form-header">
        <div className="task-form-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span className="task-form-title">New Task</span>
      </div>

      {error && (
        <div className="task-error" data-testid="form-error">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className="task-field-group">
        <label className="task-field-label">TITLE</label>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="task-input"
          data-testid="title-input"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <div className="task-field-group">
        <label className="task-field-label">
          DESCRIPTION <span className="task-optional">— optional</span>
        </label>
        <input
          type="text"
          placeholder="Add some details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="task-input"
          data-testid="description-input"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="task-submit-btn"
        data-testid="submit-button"
      >
        {loading ? (
          <span className="task-btn-loading">
            <span className="task-spinner" />
            Creating...
          </span>
        ) : (
          'Add Task'
        )}
      </button>
    </div>
  );
}
