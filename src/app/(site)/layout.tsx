"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { Menu, X } from "lucide-react";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customerUser, customerLogout, openAuthModal } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = menuDialog.current;
    if (!dialog) return;
    if (!menuOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1101px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);
  const links = [
    ["Home", "/"],
    ["Chit schemes", "/schemes"],
    ["How it works", "/how-it-works"],
    ["Savings calculator", "/calculator"],
    ["About us", "/about"],
  ];
  return (
    <div className="premium-site">
      <CustomerAuthModal />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="announcement">
        A little discipline today. A world of possibilities tomorrow.{" "}
        <span>Discover a better way to save</span>
      </div>
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/" className="brand" aria-label="RAKVIH home">
            <Image src="/logo-transparent.png" alt="RAKVIH" width={132} height={132} priority />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {customerUser ? (
              <>
                <Link className="admin-header-link" href="/admin/login">
                  Admin portal
                </Link>
                <Link className="button button-small" href="/portal">
                  My account
                </Link>
                <button className="signin signout-link" onClick={customerLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="admin-header-link" href="/admin/login">
                  Admin portal
                </Link>
                <button
                  className="signup-header-link"
                  onClick={() => openAuthModal("signup")}
                >
                  Sign up
                </button>
                <button
                  className="button button-small"
                  onClick={() => openAuthModal("signup")}
                >
                  Get started
                </button>
              </>
            )}
            <button
              className="icon-button mobile-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-haspopup="dialog"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <dialog
        ref={menuDialog}
        id="mobile-menu"
        className="mobile-menu-dialog"
        aria-label="Navigation menu"
        onCancel={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="mobile-menu-panel">
          <div className="mobile-menu-heading">
            <Link href="/" aria-label="RAKVIH home" onClick={() => setMenuOpen(false)}>
              <Image src="/logo-transparent.png" alt="RAKVIH" width={82} height={82} />
            </Link>
            <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)} autoFocus>
              <X size={22} />
            </button>
          </div>
          <span className="mobile-menu-label">EXPLORE RAKVIH</span>
          <nav className="mobile-menu-links" aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-account">
            {customerUser ? (
              <Link className="mobile-menu-primary" href="/portal" onClick={() => setMenuOpen(false)}>My account</Link>
            ) : (
              <div className="mobile-menu-auth">
                <button onClick={() => { setMenuOpen(false); openAuthModal("signup"); }}>Sign up</button>
                <button className="mobile-menu-primary" onClick={() => { setMenuOpen(false); openAuthModal("signup"); }}>Get started</button>
              </div>
            )}
            <Link className="mobile-menu-admin" href="/admin/login" onClick={() => setMenuOpen(false)}>
              Admin portal
            </Link>
            {customerUser && (
              <button
                className="mobile-menu-signout"
                onClick={() => {
                  setMenuOpen(false);
                  customerLogout();
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </dialog>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="site-container">
          <div className="footer-top">
            <div className="footer-brand-col" data-home-reveal="left">
              <div className="footer-brand-heading">
                <Link href="/" className="footer-logo" aria-label="RAKVIH home">
                  <Image src="/logo-transparent.png" alt="RAKVIH" width={150} height={150} />
                </Link>
                <p>
                  Rooted in trust.
                  <br />
                  Built for your tomorrow.
                </p>
              </div>
              <p className="footer-company-description">
                RAKVIH Solutions Private Limited. Next-generation digital chitty
                management platform providing transparent, regulated savings and
                emergency liquidity.
              </p>
              <span className="footer-registration">Registered under Chit Funds Act, 1982</span>
            </div>
            <div className="footer-navigation-col" data-home-reveal="up">
              <div className="footer-link-col">
                <span className="eyebrow">EXPLORE</span>
                <Link href="/">Home</Link>
                <Link href="/schemes">Chit schemes</Link>
                <Link href="/calculator">Savings calculator</Link>
                <Link href="/how-it-works">How it works</Link>
                <Link href="/about">About us</Link>
              </div>
              <div className="footer-link-col">
                <span className="eyebrow">YOUR RAKVIH</span>
                <Link href="/portal">Member portal</Link>
                <Link href="/login">Sign in / Register</Link>
                <Link href="/admin/login">Staff access</Link>
              </div>
            </div>
            <div className="footer-contact-col" data-home-reveal="up">
              <span className="eyebrow">LET’S TALK</span>
              <a href="mailto:support@rakvih.com">
                support@rakvih.com
              </a>
              <a href="tel:+918040001234">+91 80 4000 1234</a>
              <p>
                Bangalore, Karnataka
                <br />
                India
              </p>
            </div>
            <div className="footer-security-col" data-home-reveal="right">
              <span className="eyebrow">SECURITY &amp; STAFF</span>
              <p>256-bit SSL encrypted financial transactions with Supabase Row Level Security.</p>
              <Link href="/admin/login">Admin Management Portal</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">© 2026 RAKVIH Solutions Private Limited. All Rights Reserved.</span>
            <div className="footer-bottom-right">
              <div className="footer-legal">
                <span>Privacy Policy</span>
                <span>Terms &amp; Conditions</span>
                <span>Compliance Standards</span>
              </div>
              <div className="footer-credit">
                Designed and developed by{" "}
                <a href="https://rakvih.in" target="_blank" rel="noopener noreferrer">
                  RAKVIH
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
