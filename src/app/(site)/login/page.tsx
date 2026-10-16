'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield
} from 'lucide-react';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/portal';

  const { customerLogin, customerSignUp, customerUser } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (customerUser) {
      router.push(redirectUrl);
    }
  }, [customerUser, redirectUrl, router]);

  const handleQuickDemoFill = () => {
    setEmail('subscriber@rakvih.com');
    setPassword('subscriber123');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'signin') {
        if (!email.trim()) {
          setErrorMsg('Please enter your registered email address.');
          setIsLoading(false);
          return;
        }
        if (!password) {
          setErrorMsg('Please enter your account password.');
          setIsLoading(false);
          return;
        }
        const success = customerLogin(email, password);
        if (success) {
          setSuccessMsg('Authenticated! Opening your portal...');
          setTimeout(() => router.push(redirectUrl), 400);
        } else {
          setErrorMsg('Invalid login credentials.');
          setIsLoading(false);
        }
      } else {
        if (!fullName.trim() || !email.trim() || !phone.trim()) {
          setErrorMsg('Please complete all required fields.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        if (!agreedTerms) {
          setErrorMsg('Please accept the Chit Funds Act rules to register.');
          setIsLoading(false);
          return;
        }
        const success = customerSignUp(fullName, email, phone, password);
        if (success) {
          setSuccessMsg('Account registered! Taking you to customer portal...');
          setTimeout(() => router.push(redirectUrl), 500);
        } else {
          setErrorMsg('Registration failed. Please try again.');
          setIsLoading(false);
        }
      }
    }, 350);
  };

  return (
    <div className="auth-card w-full max-w-[500px] bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-11 h-11 rounded-lg p-1 flex items-center justify-center flex-shrink-0">
          <Image
            src="/logo-transparent.png"
            alt="RAKVIH"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h3 className="font-semibold text-base text-gray-900 leading-tight">
            RAKVIH SOLUTIONS
          </h3>
          <p className="text-xs text-gray-500">
            Digital Chit Fund Management Platform
          </p>
        </div>
      </div>

      {/* Segmented Switcher Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-5 text-xs font-bold border border-gray-200">
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
            mode === 'signup'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
            mode === 'signin'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {mode === 'signup' ? 'Create Customer Account' : 'Sign In to Your Account'}
        </h2>
        <p className="text-xs text-gray-500">
          {mode === 'signup'
            ? 'Enter your details to register as a chit fund subscriber'
            : 'Enter your credentials to access your chit portfolio'}
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Normal Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {mode === 'signup' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Full Name (as on ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[11px] font-bold text-gray-500 border-r border-gray-300 pr-1.5">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-1 text-[11px] text-gray-600">
              <input
                type="checkbox"
                id="page-normal-terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#123d33] focus:ring-[#123d33] cursor-pointer"
              />
              <label htmlFor="page-normal-terms" className="cursor-pointer leading-tight">
                I agree to the <span className="font-semibold text-gray-800">Chit Funds Act, 1982</span> rules and platform privacy terms.
              </label>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="subscriber@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  Fill Demo Login
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#123d33] focus:ring-[#123d33]"
                />
                <span>Remember me</span>
              </label>
              <span className="text-gray-400 text-[10px] flex items-center">
                <Shield className="w-3 h-3 text-emerald-600 mr-1" />
                Secure 256-bit SSL
              </span>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#123d33] hover:bg-[#283218] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer mt-3"
        >
          <span>
            {isLoading
              ? 'Processing...'
              : mode === 'signup'
              ? 'Create Customer Account'
              : 'Sign In to Portal'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Switcher & Admin link */}
      <div className="text-center pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500 space-y-2">
        {mode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className="font-bold text-[#123d33] hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className="font-bold text-[#123d33] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        )}

        <p className="text-[11px] text-gray-400">
          Administrator?{' '}
          <Link href="/admin/login" className="text-[#123d33] font-semibold hover:underline">
            Staff Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="workspace-theme auth-page">
      <div className="auth-intro"><span>RAKVIH · MEMBER ACCESS</span><h1>Your savings.<br /><em>All in one place.</em></h1><p>Manage your schemes, follow your contributions, and stay connected to your financial goals.</p><div>Clear records. Thoughtful planning. Shared progress.</div></div><Suspense fallback={<div className="text-xs text-gray-500">Loading form...</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
