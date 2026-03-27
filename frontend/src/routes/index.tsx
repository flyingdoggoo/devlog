import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@pages/auth/LoginPage';
import { HomePage } from '@pages/home/HomePage';
import { CreatePostPage } from '@pages/post/CreatePostPage';
import { AuthGuard } from '@components/AuthGuard';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <HomePage />
          </AuthGuard>
        }
      />
      <Route
        path="/home"
        element={
          <AuthGuard>
            <HomePage />
          </AuthGuard>
        }
      />
      <Route
        path="/posts/create"
        element={
          <AuthGuard>
            <CreatePostPage />
          </AuthGuard>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
