import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { selectCurrentUser } from '@features/auth/auth.slice';
import { logoutThunk } from '@features/auth/auth.thunks';

interface AvatarMenuProps {
  size?: 'sm' | 'md';
}

export function AvatarMenu({ size = 'sm' }: AvatarMenuProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = currentUser?.name ?? 'User';
  const initial = (displayName[0] ?? 'U').toUpperCase();
  const avatarSizeClass = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const onLogout = async () => {
    setOpen(false);
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`${avatarSizeClass} rounded-full bg-neutral-200 overflow-hidden`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open user menu"
      >
        {currentUser?.avatarUrl && !imgError ? (
          <img
            className="w-full h-full object-cover"
            src={currentUser.avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-neutral-600">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-50">
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => goTo('/home')}
          >
            Dashboard
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => goTo('/settings')}
          >
            Settings
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => goTo('/posts/create')}
          >
            Create Post
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
