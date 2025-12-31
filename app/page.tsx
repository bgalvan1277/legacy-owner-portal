"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!isLogin) {
        // Registration Logic
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, firstName, lastName, phone }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || data.error || 'Registration failed');
        } else {
          setSuccessMessage(data.message || "Account created! Please wait for approval.");
          setIsSuccess(true);
          // setIsLogin(true); // Don't switch to login, show success card instead
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Login Logic
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || data.error || 'Login failed');
        } else {
          // Check role if needed, or just redirect
          if (data.role === 'ADMIN') {
            router.push('/portal/admin');
          } else {
            router.push('/portal/dashboard');
          }
        }
      }
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-brand-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-64 h-24 mb-2">
            <Image
              src="/assets/logo-dark.png"
              alt="Barnes Walker"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-gray-500 uppercase tracking-widest text-xs">Business Portal</p>
        </div>

        <div className="mb-6 flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLogin ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLogin ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Create User
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="name@company.com"
            />
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="(555) 000-0000"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verify Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark text-white py-3.5 rounded-lg font-bold shadow-lg hover:bg-[#085035] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 font-semibold text-brand-dark hover:text-brand-gold transition-colors"
            >
              {isLogin ? "Create User" : "Login"}
            </button>
          </p>
        </div>
      </div>

      {/* Success Modal / Card Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-brand-white flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-24 h-24 text-green-600 mb-6" />
            <h2 className="text-4xl font-bold text-green-700 mb-4">Success!</h2>
            <p className="text-gray-600 text-lg mb-8">
              Your account has been created and is pending approval. Please check your email shortly.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                setIsLogin(true);
                setSuccessMessage('');
              }}
              className="w-full bg-brand-dark text-white py-3.5 rounded-lg font-bold shadow-lg hover:bg-[#085035] transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </main >
  );
}
