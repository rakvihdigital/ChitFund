'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, adminUser } = useApp();

  const [email, setEmail] = useState('admin@rakvih.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (adminUser) {
      router.push('/admin');
    }
  }, [adminUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const success = adminLogin(email, password);
      if (success) {
        router.push('/admin');
      } else {
        setErrorMsg('Invalid administrator credentials.');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="auth-page staff-auth-page"><div className="auth-intro"><span>RAKVIH · MANAGEMENT SUITE</span><h1>A clearer view.<br /><em>At every step.</em></h1><p>Your workspace for schemes, subscriber records, collections, and approvals.</p><div>One connected workspace for your team.</div></div>
      <div className="auth-card max-w-md w-full bg-white rounded-[20px] p-8 space-y-6 shadow-lg text-gray-900 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto relative rounded-2xl p-1.5 flex items-center justify-center">
            <Image
              src="/logo-transparent.png"
              alt="RAKVIH Solutions"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrative Gateway</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Admin Staff Login</h2>
          <p className="text-xs text-gray-500">
            Restricted access for RAKVIH Solutions chit fund officers & managers
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rakvih.com"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#123d33]"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#123d33]"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-0.5">
            <p className="font-bold">Initial Administrator Credentials:</p>
            <p className="text-amber-800">Email: <span className="font-mono font-bold">admin@rakvih.com</span></p>
            <p className="text-amber-800">Password: <span className="font-mono font-bold">admin123</span></p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#123d33] text-white hover:bg-[#0b2e26] font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{isLoading ? 'Verifying Authorization...' : 'Sign In to Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
