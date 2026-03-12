import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../api/tasks';
import type { Task } from '../api/tasks';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch {
      localStorage.removeItem('auth_token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="tasks-page">
      {/* Ambient background orbs */}
      <div className="tasks-bg-orb tasks-bg-orb--1" />
      <div className="tasks-bg-orb tasks-bg-orb--2" />

      <div className="tasks-container">
        {/* Header */}
        <div className="tasks-header">
          <div className="tasks-header-left">
            <div className="tasks-logo">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h1 className="tasks-heading">My Tasks</h1>
              <p className="tasks-subheading">Stay focused, get things done</p>
            </div>
          </div>

          <button onClick={handleLogout} className="tasks-logout-btn">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

        {/* Form */}
        <TaskForm onTaskCreated={fetchTasks} />

        {/* List */}
        {loading ? (
          <div className="tasks-loading">
            <div className="tasks-loading-spinner" />
            <span>Loading your tasks...</span>
          </div>
        ) : (
          <TaskList tasks={tasks} onTasksChange={fetchTasks} />
        )}
      </div>
    </div>
  );
}
