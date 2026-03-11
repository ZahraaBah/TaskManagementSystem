const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

/**
 * Sends a register request to the backend.
 * @throws Error with backend message if request fails
 */
export const registerApi = async (payload: AuthPayload): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? 'Registration failed');
  }

  return data;
};

/**
 * Sends a login request to the backend.
 * @throws Error with backend message if request fails
 */
export const loginApi = async (payload: AuthPayload): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? 'Login failed');
  }

  return data;
};