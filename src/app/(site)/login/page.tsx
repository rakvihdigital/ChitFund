'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Wordmark } from '@/components/Wordmark';
import { msg, Trans, useT } from '@/lib/i18n';
import { KycFields, emptyKyc } from '@/components/KycFields';
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
  const { t } = useT();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kyc, setKyc] = useState(emptyKyc);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (customerUser) {
      router.push(redirectUrl);
    }
  }, [customerUser, redirectUrl, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    void (async () => {
      if (mode === 'signin') {
        if (!email.trim()) {
          setErrorMsg(msg('Please enter your registered email address.'));
          setIsLoading(false);
          return;
        }
        if (!password) {
          setErrorMsg(msg('Please enter your account password.'));
          setIsLoading(false);
          return;
        }
        const result = await customerLogin(email, password);
        if (result === true) {
          setSuccessMsg(msg('Authenticated! Opening your portal...'));
          setTimeout(() => router.push(redirectUrl), 400);
        } else {
          setErrorMsg(result);
          setIsLoading(false);
        }
      } else {
        if (!fullName.trim() || !email.trim() || !phone.trim()) {
          setErrorMsg(msg('Please complete all required fields.'));
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg(msg('Password must be at least 6 characters.'));
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg(msg('Passwords do not match.'));
          setIsLoading(false);
          return;
        }
        if (!agreedTerms) {
          setErrorMsg(msg('Please accept the Chit Funds Act rules to register.'));
          setIsLoading(false);
          return;
        }
        const result = await customerSignUp(fullName, email, phone, password, kyc);
        setIsLoading(false);
        if (result === true) {
          setMode('signin');
          setPassword('');
          setConfirmPassword('');
          setKyc(emptyKyc);
          setSuccessMsg(msg('Registration submitted! An admin will review your KYC details. You can sign in once your account is approved.'));
        } else {
          setErrorMsg(result);
        }
      }
    })();
  };

  return (
    <div className="auth-card w-full max-w-[500px] bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-5">
        <Wordmark tagline={t("Digital Chit Fund Management Platform")} />
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
          {t("Create Account")}
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
          {t("Sign In")}
        </button>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {mode === 'signup' ? t('Create Customer Account') : t('Sign In to Your Account')}
        </h2>
        <p className="text-xs text-gray-500">
          {mode === 'signup'
            ? t('Enter your details and KYC documents to register as a chit fund subscriber')
            : t('Enter your credentials to access your chit portfolio')}
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-medium">{t(errorMsg)}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{t(successMsg)}</span>
        </div>
      )}

      {/* Normal Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {mode === 'signup' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t("Full Name (as on ID)")}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("e.g. Ramesh Kumar")}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t("Mobile Number")}
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
                {t("Email Address")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("name@example.com")}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t("Password")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Min 6 characters")}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t("Confirm Password")}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("Re-enter password")}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <KycFields id="page-kyc" value={kyc} onChange={setKyc} />

            <div className="flex items-start space-x-2 pt-1 text-[11px] text-gray-600">
              <input
                type="checkbox"
                id="page-normal-terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#123d33] focus:ring-[#123d33] cursor-pointer"
              />
              <label htmlFor="page-normal-terms" className="cursor-pointer leading-tight">
                <Trans text="I agree to the {act} rules and platform privacy terms." values={{ act: <span className="font-semibold text-gray-800">{t("Chit Funds Act, 1982")}</span> }} />
              </label>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                {t("Email Address")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("subscriber@example.com")}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-gray-700">
                  {t("Password")}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("Enter your password")}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
              <span className="text-gray-400 text-[10px] flex items-center">
                <Shield className="w-3 h-3 text-emerald-600 mr-1" />
                {t("Secure sign in")}
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
              ? t('Processing...')
              : mode === 'signup'
              ? t('Submit for Approval')
              : t('Sign In to Portal')}
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
              {t("Sign In")}
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
              {t("Create Account")}
            </button>
          </p>
        )}

      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  const { t } = useT();
  return (
    <div className="workspace-theme auth-page">
      <div className="auth-intro"><span>{t("CHITFUND · MEMBER ACCESS")}</span><h1>{t("Your savings.")}<br /><em>{t("All in one place.")}</em></h1><p>{t("Manage your schemes, follow your contributions, and stay connected to your financial goals.")}</p><div>{t("Clear records. Thoughtful planning. Shared progress.")}</div></div><Suspense fallback={<div className="text-xs text-gray-500">{t("Loading form...")}</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
