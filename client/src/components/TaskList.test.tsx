import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskList from './TaskList';
import * as tasksApi from '../api/tasks';

vi.mock('../api/tasks');

const mockTasks = [
  {
    id: '1',
    title: 'Test task',
    description: null,
    completed: false,
    userId: 'user-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('TaskList', () => {
  it('renders tasks correctly', () => {
    render(<TaskList tasks={mockTasks} onTasksChange={() => {}} />);
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('shows empty message when no tasks', () => {
    render(<TaskList tasks={[]} onTasksChange={() => {}} />);
    expect(screen.getByText('No tasks yet. Create one!')).toBeInTheDocument();
  });

  it('toggles task completion on checkbox click', async () => {
    const onTasksChange = vi.fn();
    vi.mocked(tasksApi.updateTask).mockResolvedValueOnce({ ...mockTasks[0], completed: true });

    render(<TaskList tasks={mockTasks} onTasksChange={onTasksChange} />);
    fireEvent.click(screen.getByTestId('task-checkbox'));

    await waitFor(() => expect(onTasksChange).toHaveBeenCalled());
  });

  it('deletes task on delete button click', async () => {
    const onTasksChange = vi.fn();
    vi.mocked(tasksApi.deleteTask).mockResolvedValueOnce();

    render(<TaskList tasks={mockTasks} onTasksChange={onTasksChange} />);
    fireEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() => expect(onTasksChange).toHaveBeenCalled());
  });
});