import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from '@pages/auth/LoginPage';
import { HomePage } from '@pages/home/HomePage';
import { PostDetailPage } from '@pages/post/PostDetailPage';
import { ProfilePage } from '@pages/profile/ProfilePage';
import { SettingsPage } from '@pages/settings/SettingsPage';
import { SearchPage } from '@pages/search/SearchPage';
import { TagsPage } from '@pages/tags/TagsPage';
import { BookmarksPage } from '@pages/bookmarks/BookmarksPage';
import { AuthGuard } from '@components/AuthGuard';

const CreatePostPage = lazy(async () => {
  const module = await import('../pages/post/CreatePostPage');
  return { default: module.CreatePostPage };
});

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
        <Route path="/tags" element={<TagsPage />} />
        <Route
          path="/posts/create"
          element={
            <AuthGuard>
              <Suspense
                fallback={
                  <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex items-center justify-center text-sm font-medium">
                    Loading editor...
                  </div>
                }
              >
                <CreatePostPage />
              </Suspense>
            </AuthGuard>
          }
        />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route
          path="/bookmarks"
          element={
            <AuthGuard>
              <BookmarksPage />
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
