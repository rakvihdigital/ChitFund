"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { Menu, X } from "lucide-react";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Wordmark } from "@/components/Wordmark";
import { msg, useT } from "@/lib/i18n";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customerUser, customerLogout, openAuthModal } = useApp();
  const { t } = useT();
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
    [msg("Home"), "/"],
    [msg("Chit schemes"), "/schemes"],
    [msg("How it works"), "/how-it-works"],
    [msg("Savings calculator"), "/calculator"],
    [msg("About us"), "/about"],
  ];
  return (
    <div className="premium-site">
      <CustomerAuthModal />
      <a href="#main-content" className="skip-link">
        {t("Skip to content")}
      </a>
      <div className="announcement">
        {t("A little discipline today. A world of possibilities tomorrow.")}{" "}
        <span>{t("Discover a better way to save")}</span>
      </div>
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/" className="brand" aria-label={t("ChitFund home")}>
            <Wordmark />
          </Link>
          <nav className="desktop-nav" aria-label={t("Main navigation")}>
            {links.map(([label, href]) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
                {t(label)}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {customerUser ? (
              <>
                <LanguageSwitcher />
                <Link className="button button-small" href="/portal">
                  {t("My account")}
                </Link>
                <button className="signin signout-link" onClick={customerLogout}>
                  {t("Sign out")}
                </button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <button
                  className="signup-header-link"
                  onClick={() => openAuthModal("signup")}
                >
                  {t("Sign up")}
                </button>
                <button
                  className="button button-small"
                  onClick={() => openAuthModal("signup")}
                >
                  {t("Get started")}
                </button>
              </>
            )}
            <button
              className="icon-button mobile-toggle"
              aria-label={menuOpen ? t("Close menu") : t("Open menu")}
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
        aria-label={t("Navigation menu")}
        onCancel={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMenuOpen(false);
        }}
      >
        <div className="mobile-menu-panel">
          <div className="mobile-menu-heading">
            <Link href="/" aria-label={t("ChitFund home")} onClick={() => setMenuOpen(false)}>
              <Wordmark />
            </Link>
            <button className="mobile-menu-close" aria-label={t("Close menu")} onClick={() => setMenuOpen(false)} autoFocus>
              <X size={22} />
            </button>
          </div>
          <span className="mobile-menu-label">{t("EXPLORE CHITFUND")}</span>
          <nav className="mobile-menu-links" aria-label={t("Mobile navigation")}>
            {links.map(([label, href]) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {t(label)}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-account">
            <LanguageSwitcher className="language-switcher mobile-menu-language" />
            {customerUser ? (
              <Link className="mobile-menu-primary" href="/portal" onClick={() => setMenuOpen(false)}>{t("My account")}</Link>
            ) : (
              <div className="mobile-menu-auth">
                <button onClick={() => { setMenuOpen(false); openAuthModal("signup"); }}>{t("Sign up")}</button>
                <button className="mobile-menu-primary" onClick={() => { setMenuOpen(false); openAuthModal("signup"); }}>{t("Get started")}</button>
              </div>
            )}
            {customerUser && (
              <button
                className="mobile-menu-signout"
                onClick={() => {
                  setMenuOpen(false);
                  customerLogout();
                }}
              >
                {t("Sign out")}
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
                <Link href="/" className="footer-logo" aria-label={t("ChitFund home")}>
                  <Wordmark tone="light" />
                </Link>
                <p>
                  {t("Rooted in trust.")}
                  <br />
                  {t("Built for your tomorrow.")}
                </p>
              </div>
              <p className="footer-company-description">
                {t("ChitFund Solutions Private Limited. Next-generation digital chitty management platform providing transparent, regulated savings and emergency liquidity.")}
              </p>
              <span className="footer-registration">{t("Registered under Chit Funds Act, 1982")}</span>
            </div>
            <div className="footer-navigation-col" data-home-reveal="up">
              <div className="footer-link-col">
                <span className="eyebrow">{t("EXPLORE")}</span>
                <Link href="/">{t("Home")}</Link>
                <Link href="/schemes">{t("Chit schemes")}</Link>
                <Link href="/calculator">{t("Savings calculator")}</Link>
                <Link href="/how-it-works">{t("How it works")}</Link>
                <Link href="/about">{t("About us")}</Link>
              </div>
              <div className="footer-link-col">
                <span className="eyebrow">{t("YOUR CHITFUND")}</span>
                <Link href="/portal">{t("Member portal")}</Link>
                <Link href="/login">{t("Sign in / Register")}</Link>
              </div>
            </div>
            <div className="footer-contact-col" data-home-reveal="up">
              <span className="eyebrow">{t("LET’S TALK")}</span>
              <a href="mailto:support@rakvih.com">
                support@rakvih.com
              </a>
              <a href="tel:+918040001234">+91 80 4000 1234</a>
              <p>
                {t("Bangalore, Karnataka")}
                <br />
                {t("India")}
              </p>
            </div>
            <div className="footer-security-col" data-home-reveal="right">
              <span className="eyebrow">{t("SECURITY")}</span>
              <p>{t("256-bit SSL encrypted financial transactions with Supabase Row Level Security.")}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">{t("© 2026 ChitFund Solutions Private Limited. All Rights Reserved.")}</span>
            <div className="footer-bottom-right">
              <div className="footer-legal">
                <span>{t("Privacy Policy")}</span>
                <span>{t("Terms & Conditions")}</span>
                <span>{t("Compliance Standards")}</span>
              </div>
              {/* Developer credit: stays as RAKVIH */}
              <div className="footer-credit">
                {t("Designed and developed by")}{" "}
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
