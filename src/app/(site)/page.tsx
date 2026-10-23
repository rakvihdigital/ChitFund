"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Plus,
  ShieldCheck,
  Users,
  Wallet,
  Layers,
} from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { ClosingCta } from "@/components/site/ClosingCta";
import {
  HomeCycle,
  HomeExample,
  HomeExplainer,
  HomeFeatures,
  HomeSchemes,
} from "@/components/site/HomeSections";

const faqs = [
  [
    "What is a chit fund?",
    "A group of members contributes a fixed amount each month. The pooled amount is awarded to a member through an auction or draw, according to the scheme terms. Contributions continue for the full duration, including after receiving a payout.",
  ],
  [
    "How do I choose the right scheme?",
    "Compare the monthly contribution, total chit value, duration, and fees. Choose a contribution you can comfortably maintain for the entire scheme, and review its terms before enrolling.",
  ],
  [
    "How are dividends calculated?",
    "The winning bid discount, minus the foreman commission, is shared equally among the members. Your dividend reduces that month’s contribution. Actual amounts depend on the auction and the scheme terms.",
  ],
  [
    "Who can bid in the monthly auction?",
    "Every active member who has not yet won can bid. Bids are a discount on the chit value, within the minimum and maximum set for the scheme, and the highest discount wins. A member can win only once per ticket.",
  ],
  [
    "What happens after I win?",
    "Your prize money is paid to your verified bank account after our team completes the checks for the scheme, which may include guarantor or security documents. You continue paying your monthly contribution until the scheme ends.",
  ],
  [
    "What documents do I need to join?",
    "You will need your PAN card, Aadhaar card, a photograph, your signature, and proof of your bank account. You can upload all of them online.",
  ],
  [
    "How can I pay my monthly contribution?",
    "You can pay online by UPI, net banking, debit card, credit card, or bank transfer. Each payment is acknowledged with a digital receipt in your member portal.",
  ],
  [
    "Can I hold more than one ticket?",
    "Yes. You can hold more than one ticket in the same scheme, up to the limit shown on each scheme. Each ticket is a separate seat with its own contributions and its own chance to win.",
  ],
  [
    "Can I track my contributions online?",
    "Yes. Sign in to your member portal to see your enrolled schemes, instalments, payment records, and auction updates in one place.",
  ],
];

export default function HomePage() {
  useReveal();
  return (
    <>
      <section className="hero-banner">
        <svg
          className="banner-lines"
          viewBox="0 0 1440 700"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d={`M -100 ${420 + i * 12} C 180 ${140 + i * 14}, 370 ${820 + i * 9}, 780 ${510 + i * 11} S 1190 ${440 + i * 13}, 1540 ${80 + i * 17}`}
            />
          ))}
        </svg>
        <div className="hero site-container">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span className="status-dot" /> RAKVIH · DIGITAL CHIT FUNDS
            </div>
            <h1>
              Build your future.
              <br />
              <em>With confidence.</em>
            </h1>
            <p>
              A disciplined approach to saving. A community to grow with.
              Explore chit schemes with clear contributions, transparent
              auctions, and your financial goals at the centre.
            </p>
            <div className="hero-actions">
              <Link href="/schemes" className="button">
                Explore chit schemes
              </Link>
              <Link href="/how-it-works" className="text-link">
                See how it works <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="small-seal">
                <ShieldCheck size={20} />
              </span>
              <span>
                Built around transparency.
                <small>
                  Clear contributions. Visible progress. Your peace of mind.
                </small>
              </span>
            </div>
          </div>
          <div className="banner-portraits">
            <figure className="banner-photo banner-photo-primary">
              <Image
                src="/images/chit-savings-consultation.png"
                alt="A family discussing a savings contribution plan with an advisor"
                fill
                sizes="(max-width: 540px) 65vw, (max-width: 800px) 48vw, 360px"
                priority
              />
            </figure>
            <figure className="banner-photo banner-photo-secondary">
              <Image
                src="/images/chit-contribution-planning.png"
                alt="Reviewing a monthly contribution ledger and calculator"
                fill
                sizes="(max-width: 540px) 40vw, 220px"
                priority
              />
            </figure>
            <div className="banner-photo-caption">
              <span /> DISCIPLINED SAVINGS. SHARED PROGRESS.
            </div>
          </div>
        </div>
      </section>
      <div className="trust-strip">
        <div className="site-container">
          <span>
            <ShieldCheck /> Clear scheme details
          </span>
          <span>
            <Users /> Community-powered savings
          </span>
          <span>
            <Wallet /> Digital contribution tracking
          </span>
          <span>
            <Layers /> Everything in one place
          </span>
        </div>
      </div>
      <section className="original-trust site-container" aria-label="Platform assurances">
        <div data-home-reveal="left"><strong>100% Regulated</strong><span>Govt Compliant</span></div>
        <div data-home-reveal="up"><strong>Instant UPI</strong><span>Zero Dues Delay</span></div>
        <div data-home-reveal="right"><strong>Maker-Checker</strong><span>Dual Authorization</span></div>
      </section>
      <HomeExplainer />
      <HomeCycle />
      <HomeExample />
      <HomeSchemes />
      <HomeFeatures />
      <section className="site-container section-space faq-section">
        <div data-home-reveal="left">
          <span className="eyebrow">A FEW THINGS TO KNOW</span>
          <h2>
            Good questions.
            <br />
            <em>Clear answers.</em>
          </h2>
          <p>Getting started should feel simple.</p>
        </div>
        <div className="faq-list" data-home-reveal="right">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Plus size={18} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <ClosingCta />
    </>
  );
}
