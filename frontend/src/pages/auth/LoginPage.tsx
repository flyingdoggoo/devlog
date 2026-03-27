import { LoginForm } from '@features/auth/components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 font-sans antialiased">
      <div className="flex">
        {/* Left Image Column - Hidden on mobile */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            alt="Abstract flowing lines"
            className="absolute inset-0 w-full h-full object-cover"
            src="/images/login-bg.png"
          />
        </div>

        {/* Right Content Column */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-20 relative">
          {/* Top Spacer */}
          <div></div>

          {/* Main Login Section */}
          <main className="w-full flex flex-col items-center">
            {/* Branding */}
            <h1 className="text-4xl font-serif text-white mb-10 tracking-wide">
              DevLog
            </h1>

            {/* Login Form */}
            <LoginForm />
          </main>

          {/* Footer */}
          <footer className="w-full flex justify-between items-end text-[11px] text-gray-500 leading-relaxed max-w-[420px] mx-auto lg:max-w-none mt-12">
            <div className="space-y-1">
              <p>Institutional Grade Security</p>
              <p>Developer journaling</p>
            </div>
            <div className="text-right space-y-1">
              <p>v0.1.0-alpha</p>
              <p className="text-brand-green">SYSTEM OPERATIONAL</p>
              <div className="flex gap-3 pt-1 uppercase tracking-wider text-[10px]">
                <a href="#" className="text-[#0ea5e9] hover:text-blue-400">
                  Help
                </a>
                <a href="#" className="text-[#0ea5e9] hover:text-blue-400">
                  Privacy
                </a>
                <a href="#" className="text-[#0ea5e9] hover:text-blue-400">
                  Terms
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
