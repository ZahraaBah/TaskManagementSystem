import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder — will be replaced by Chiva's TaskListPage in Phase 5
const TasksPlaceholder = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-500">Tasks page coming soon...</p>
  </div>
);

const App = () => {
  return (
    // AuthProvider wraps everything so auth state is accessible in all routes
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPlaceholder />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;