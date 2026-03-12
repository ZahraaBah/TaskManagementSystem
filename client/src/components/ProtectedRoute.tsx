import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('auth_token'); // ← Change 'token' en 'auth_token'
  console.log('ProtectedRoute - token:', token); // ← Garde le log pour vérifier

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
