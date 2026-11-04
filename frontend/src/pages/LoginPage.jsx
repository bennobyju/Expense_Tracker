
import React, { useState } from 'react';
import axios from 'axios';
import {
  Wallet,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  CircleDollarSign,
  ChartNoAxesCombined
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api/auth';

export default function LoginPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE}/register`, {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      setSuccessMsg(
        'Account created successfully! Please sign in.'
      );

      setIsRegistering(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';

      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: email.trim().toLowerCase(),
        password
      });

      const token = response.data.token;

if (!token) {
  setError('Login succeeded, but the server did not return an authentication token.');
  return;
}

const authenticatedUser = {
  id: response.data.id || response.data.userId,
  name: response.data.name,
  email: response.data.email
};

localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(authenticatedUser));

onLogin(authenticatedUser);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid email or password.';

      setError(typeof msg === 'string' ? msg : 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#527A46] focus:bg-white focus:ring-4 focus:ring-[#527A46]/10';

  return (
    <div className="min-h-screen bg-[#F4F6F1] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(30,45,25,0.10)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-64px)]">

        {/* LEFT PANEL */}
        <aside className="relative hidden w-[43%] flex-col justify-between overflow-hidden bg-[#17251C] p-10 text-white lg:flex xl:p-14">

          <div className="absolute -right-28 top-32 h-80 w-80 rounded-full border border-white/[0.07]" />
          <div className="absolute -right-16 top-44 h-56 w-56 rounded-full border border-white/[0.08]" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#55784A]/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A7C88D] text-[#17251C]">
              <Wallet size={23} strokeWidth={2.3} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">
                Expense360
              </p>
              <p className="text-[10px] uppercase tracking-[0.23em] text-gray-400">
                Personal Finance
              </p>
            </div>
          </div>

          <div className="relative z-10 my-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#A7C88D]/20 bg-[#A7C88D]/10 px-3 py-1.5 text-xs text-[#C6E3B1]">
              <span className="h-2 w-2 rounded-full bg-[#A7C88D]" />
              Your money, in perspective
            </div>

            <h1 className="max-w-lg text-4xl font-semibold leading-[1.2] tracking-tight xl:text-5xl">
              Make every
              <br />
              penny <span className="text-[#A7C88D]">count.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
              Take control of your spending, understand your habits,
              and build a healthier financial future.
            </p>

            {/* Decorative finance card */}
            <div className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <ChartNoAxesCombined size={16} className="text-[#A7C88D]" />
                  Financial overview
                </div>
                <TrendingUp size={18} className="text-[#A7C88D]" />
              </div>

              <div className="mt-5 flex items-end justify-between gap-2">
                {[35, 52, 42, 72, 56, 88, 64, 100, 73, 90, 60, 78].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-sm bg-[#A7C88D]"
                      style={{
                        height: `${height * 0.65}px`,
                        opacity: index === 7 ? 1 : 0.25 + index * 0.05
                      }}
                    />
                  )
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CircleDollarSign size={17} />
                  Track your spending
                </div>
                <span className="text-xs font-medium text-[#C6E3B1]">
                  Stay on track
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
              <ShieldCheck size={18} className="text-[#A7C88D]" />
              Your personal finances, organized in one place
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-5 text-xs text-gray-500">
            A clearer picture of your financial life.
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="flex w-full items-center justify-center px-6 py-10 sm:px-12 lg:w-[57%] lg:px-12 xl:px-20">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17251C] text-[#A7C88D]">
                <Wallet size={23} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  Expense360
                </p>
                <p className="text-xs text-gray-500">
                  Personal Finance
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4E9] text-[#527A46]">
                {isRegistering ? (
                  <User size={24} />
                ) : (
                  <Wallet size={24} />
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#648258]">
                {isRegistering ? 'GET STARTED' : 'WELCOME BACK'}
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-[#202820] sm:text-4xl">
                {isRegistering ? 'Create your account' : 'Sign in'}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {isRegistering
                  ? 'Create an account to start managing your finances.'
                  : 'Enter your details to access your personal dashboard.'}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form
              onSubmit={isRegistering ? handleRegister : handleLogin}
              className="space-y-5"
            >
              {isRegistering && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      isRegistering ? 'new-password' : 'current-password'
                    }
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#263D2B] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#263D2B]/10 transition duration-200 hover:bg-[#36583B] focus:outline-none focus:ring-4 focus:ring-[#527A46]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Please wait...'
                  : isRegistering
                    ? 'Create account'
                    : 'Sign in to your account'}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600">
              {isRegistering
                ? 'Already have an account?'
                : "Don't have an account?"}{' '}

              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-[#527A46] transition hover:text-[#263D2B] hover:underline"
              >
                {isRegistering ? 'Sign in' : 'Create an account'}
              </button>
            </p>

            <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
              <ShieldCheck size={15} />
              Your financial journey starts here.
            </p>

          </div>
        </main>
      </div>
    </div>
  );
}
