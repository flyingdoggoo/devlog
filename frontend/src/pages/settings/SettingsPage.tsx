import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">Settings</h1>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white"
            onClick={() => navigate('/home')}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold">Workspace Preferences</h2>
          <p className="text-sm text-neutral-600">
            This page is ready for your next settings modules (profile, security, notifications, and
            display options).
          </p>
        </div>
      </div>
    </div>
  );
}
