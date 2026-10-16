'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  User,
  Mail,
  Lock,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const { authModalOpen, authModalMode } = useApp();
  return authModalOpen ? <CustomerAuthContent key={authModalMode} /> : null;
};

const CustomerAuthContent: React.FC = () => {
  const router = useRouter();
  const { authModalOpen, authModalMode, closeAuthModal, customerSignUp, customerLogin } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode || 'signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAuthModal();
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], select, textarea') || []);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); window.removeEventListener('keydown', handleKeyDown); };
  }, [closeAuthModal]);

  if (!authModalOpen) return null;

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

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full legal name.');
        setIsLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        setIsLoading(false);
        return;
      }
      if (!password || password.length < 6) {
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
        setErrorMsg('Please accept the Chit Funds Act terms to proceed.');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        const success = customerSignUp(fullName, email, phone, password);
        setIsLoading(false);
        if (success) {
          setSuccessMsg('Account created successfully! Opening your portal...');
          setTimeout(() => {
            closeAuthModal();
            router.push('/portal');
          }, 500);
        } else {
          setErrorMsg('Registration failed. Please try again.');
        }
      }, 350);
    } else {
      if (!email.trim()) {
        setErrorMsg('Please enter your registered email address.');
        setIsLoading(false);
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password.');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        const success = customerLogin(email, password);
        setIsLoading(false);
        if (success) {
          setSuccessMsg('Signed in! Opening your customer portal...');
          setTimeout(() => {
            closeAuthModal();
            router.push('/portal');
          }, 400);
        } else {
          setErrorMsg('Invalid email or password.');
        }
      }, 350);
    }
  };

  return (
    <div
      className="workspace-theme auth-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      {/* CLEAN NORMAL RECTANGULAR FORM CARD */}
      <div
        className="auth-card auth-modal-card relative w-full max-w-[520px] bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 animate-in zoom-in-95 duration-200 overflow-hidden"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

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

        {/* Clean Segmented Tabs */}
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

        {/* Form Title */}
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

        {/* Alert Messages */}
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
              {/* Row 1: Name and Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Full Name (as per ID)
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

              {/* Email */}
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

              {/* Row 2: Passwords */}
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

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2 pt-1 text-[11px] text-gray-600">
                <input
                  type="checkbox"
                  id="normal-form-terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#123d33] focus:ring-[#123d33] cursor-pointer"
                />
                <label htmlFor="normal-form-terms" className="cursor-pointer leading-tight">
                  I agree to the <span className="font-semibold text-gray-800">Chit Funds Act, 1982</span> rules and platform privacy terms.
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Sign In Fields */}
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

          {/* Normal Action Button */}
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

        {/* Toggle Mode Footer */}
        <div className="text-center pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
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
        </div>
      </div>
    </div>
  );
};
