import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from '@pages/auth/LoginPage';
import { HomePage } from '@pages/home/HomePage';
import { CreatePostPage } from '@pages/post/CreatePostPage';
import { PostDetailPage } from '@pages/post/PostDetailPage';
import { ProfilePage } from '@pages/profile/ProfilePage';
import { SettingsPage } from '@pages/settings/SettingsPage';
import { SearchPage } from '@pages/search/SearchPage';
import { AuthGuard } from '@components/AuthGuard';

export function AppRouter() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-transition">
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/posts/create"
          element={
            <AuthGuard>
              <CreatePostPage />
            </AuthGuard>
          }
        />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route
          path="/profile/:username"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile/me"
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
