import { useNavigate } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { loginSuccess, selectCurrentUser, selectIsAuthenticated } from '@features/auth/auth.slice';
import { usersApi } from '@services/users.service';

export function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [usernameDraft, setUsernameDraft] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError(null);
      return;
    }

    const fetchMe = async () => {
      setLoading(true);
      setError(null);

      try {
        const profile = await usersApi.getMyProfile();
        setUsernameDraft(profile.username);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message = err.response?.data?.message;
          setError(Array.isArray(message) ? message.join(', ') : message || 'Failed to load settings');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load settings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [isAuthenticated]);

  const handleUsernameUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = usernameDraft.trim().toLowerCase();

    if (!normalized) {
      setUsernameStatus('Username is required');
      return;
    }

    setSavingUsername(true);
    setUsernameStatus(null);

    try {
      const updated = await usersApi.updateMyUsername(normalized);
      setUsernameDraft(updated.username);
      setUsernameStatus('Username updated successfully');

      if (currentUser) {
        dispatch(
          loginSuccess({
            ...currentUser,
            username: updated.username,
            name: updated.name,
            avatarUrl: updated.avatarUrl,
          }),
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setUsernameStatus(Array.isArray(message) ? message.join(', ') : message || 'Failed to update username');
      } else if (err instanceof Error) {
        setUsernameStatus(err.message);
      } else {
        setUsernameStatus('Failed to update username');
      }
    } finally {
      setSavingUsername(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      setPasswordStatus('New password and confirm password are required');
      return;
    }

    setSavingPassword(true);
    setPasswordStatus(null);

    try {
      await usersApi.updateMyPassword({
        currentPassword: currentPassword || undefined,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus('Password updated successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setPasswordStatus(Array.isArray(message) ? message.join(', ') : message || 'Failed to update password');
      } else if (err instanceof Error) {
        setPasswordStatus(err.message);
      } else {
        setPasswordStatus('Failed to update password');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] p-6 md:p-10 animate-pulse">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-neutral-200 rounded" />
          <div className="h-40 bg-neutral-200 rounded-xl" />
          <div className="h-56 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">Settings</h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300"
              onClick={() => navigate('/profile/me')}
            >
              Back to Profile
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white"
              onClick={() => navigate('/home')}
            >
              Dashboard
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 mb-6">
          <h2 className="text-lg font-semibold">Username</h2>
          <p className="text-sm text-neutral-600">Change your public profile URL and display handle.</p>

          <form onSubmit={handleUsernameUpdate} className="space-y-3">
            <input
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value)}
              className="w-full md:w-96 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              placeholder="username"
            />
            <button
              type="submit"
              disabled={savingUsername}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white disabled:opacity-60"
            >
              {savingUsername ? 'Saving...' : 'Update username'}
            </button>
          </form>

          {usernameStatus && <p className="text-sm text-neutral-700">{usernameStatus}</p>}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-sm text-neutral-600">
            For Google sign-in accounts, current password can be left empty for first-time setup.
          </p>

          <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-lg">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Current password (optional for Google account)"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              placeholder="New password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Confirm new password"
            />
            <button
              type="submit"
              disabled={savingPassword}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white disabled:opacity-60"
            >
              {savingPassword ? 'Saving...' : 'Update password'}
            </button>
          </form>

          {passwordStatus && <p className="text-sm text-neutral-700">{passwordStatus}</p>}
        </div>
      </div>
    </div>
  );
}
