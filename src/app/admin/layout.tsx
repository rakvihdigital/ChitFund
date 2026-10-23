'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { LayoutDashboard, Layers, Users, UserCheck, FileCheck, CreditCard, Award, Lock, BookOpen, History, LogOut, ArrowUpRight, Menu, X, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, adminUser, adminLogout, kycList, payouts, customers } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';
  React.useEffect(() => { if (isLoaded && !adminUser && !isLoginPage) router.push('/admin/login'); }, [isLoaded, adminUser, isLoginPage, router]);
  React.useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close); };
  }, [menuOpen]);
  if (isLoginPage) return <div className="workspace-theme">{children}</div>;
  const navItems = [
    { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/groups', label: 'Chit Schemes', icon: Layers },
    { href: '/admin/users', label: 'Registered Customers', icon: Users, count: customers?.length },
    { href: '/admin/subscribers', label: 'Subscribers & Seats', icon: UserCheck },
    { href: '/admin/kyc', label: 'KYC Approvals', icon: FileCheck, count: kycList.filter(k => k.status === 'PENDING_APPROVAL').length },
    { href: '/admin/collections', label: 'Collections & Dues', icon: CreditCard },
    { href: '/admin/auctions', label: 'e-Auctions & Draws', icon: Award },
    { href: '/admin/payouts', label: 'Maker-Checker Payouts', icon: Lock, count: payouts.filter(p => p.status === 'GUARANTOR_PENDING' || p.status === 'MAKER_APPROVED').length },
    { href: '/admin/accounting', label: 'Ledgers & Accounts', icon: BookOpen },
    { href: '/admin/audit', label: 'Audit Trail', icon: History },
  ];
  const current = navItems.find(item => item.href === pathname);
  return <div className="workspace-theme admin-shell">
    <a href="#admin-content" className="skip-link">Skip to workspace</a>
    {menuOpen && <button className="admin-menu-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <aside id="admin-navigation" className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="admin-brand"><Image src="/logo-transparent.png" alt="" width={40} height={40} /><div>RAKVIH ADMIN<small>Management Console</small></div><button className="admin-menu-toggle" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <div className="admin-system-status"><span><span className="admin-status-dot" /> SYSTEM ACTIVE</span><span>V2.4 PROD</span></div>
      <div className="admin-nav-label">CORE MODULES</div>
      <nav aria-label="Administration">{navItems.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setMenuOpen(false)}><item.icon size={18} /><span>{item.label}</span>{!!item.count && <b>{item.count}</b>}</Link>)}</nav>
      <div className="admin-account"><div className="admin-account-person"><span>{adminUser?.fullName?.charAt(0) || 'A'}</span><div><strong>{adminUser?.fullName || 'Administrator'}</strong><small>{adminUser?.email}</small></div></div><div className="admin-account-actions"><button onClick={adminLogout}><LogOut size={15} /> Sign out</button><Link href="/"><ArrowUpRight size={16} /> Website</Link></div></div>
    </aside>
    <div className="admin-workspace"><header className="admin-topbar"><div className="admin-page-title"><button className="admin-menu-toggle" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><div><span>ADMIN / {current?.label.toUpperCase()}</span><h1>{pathname === '/admin' ? 'Executive Overview' : current?.label || 'Workspace'}</h1></div></div><span className="workspace-badge"><ShieldCheck size={16} /> Govt Chit Funds Act 1982 Compliant</span></header>
      <main id="admin-content" className="admin-content">
        {!adminUser && isLoaded ? (
          <div className="workspace-loading">
            <ShieldCheck size={28} />
            <h2>Admin Authorization Required</h2>
            <p>Redirecting to administrator authentication gateway...</p>
            <Link href="/admin/login">Go to Admin Login</Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  </div>;
}
