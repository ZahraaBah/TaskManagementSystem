import axios from 'axios';

const API_URL = 'http://localhost:3000';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`, // ← Change 'token' en 'auth_token'
  },
});

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const getTasks = async (completed?: boolean): Promise<Task[]> => {
  const params = completed !== undefined ? { completed } : {};
  const res = await axios.get(`${API_URL}/tasks`, { ...getAuthHeader(), params });
  return res.data;
};

export const createTask = async (data: { title: string; description?: string }): Promise<Task> => {
  const res = await axios.post(`${API_URL}/tasks`, data, getAuthHeader());
  return res.data;
};

export const updateTask = async (id: string, data: { title?: string; description?: string; completed?: boolean }): Promise<Task> => {
  const res = await axios.patch(`${API_URL}/tasks/${id}`, data, getAuthHeader());
  return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/tasks/${id}`, getAuthHeader());
};