import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@pages/auth/LoginPage';
import { HomePage } from '@pages/home/HomePage';
import { CreatePostPage } from '@pages/post/CreatePostPage';
import { PostDetailPage } from '@pages/post/PostDetailPage';
import { ProfilePage } from '@pages/profile/ProfilePage';
import { SettingsPage } from '@pages/settings/SettingsPage';
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
      <Route
        path="/posts/:id"
        element={
          <AuthGuard>
            <PostDetailPage />
          </AuthGuard>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path='/profile/me'
        element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
