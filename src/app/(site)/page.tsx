"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Users,
  Wallet,
  Layers,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ChitCalculator } from "@/components/ChitCalculator";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
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
    "In this estimator, the auction discount minus the assumed foreman fee is shared among the members. Your dividend reduces that month’s contribution. Actual amounts depend on the auction and the scheme terms.",
  ],
  [
    "Can I track my contributions online?",
    "Yes. Sign in to your member portal to see your enrolled schemes, instalments, payment records, and auction updates in one place.",
  ],
];

export default function HomePage() {
  const { groups, customerUser, subscribers, joinChitGroup, openAuthModal } =
    useApp();
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const elements = document.querySelectorAll<HTMLElement>("[data-home-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -45px 0px" },
    );
    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        element.classList.add("reveal-pending");
        observer.observe(element);
      }
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("reveal-pending"));
    };
  }, [groups]);
  function enroll(id: string) {
    if (!customerUser) {
      openAuthModal("signup");
      return;
    }
    setMessage(
      joinChitGroup(id)
        ? "You’re enrolled. Your scheme is ready to view in your member portal."
        : "We couldn’t complete your enrollment. Please check scheme availability and try again.",
    );
  }
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
              <a href="#schemes" className="button">
                Explore chit schemes
              </a>
              <a href="#how-it-works" className="text-link">
                See how it works <ArrowRight size={17} />
              </a>
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
      <section id="schemes" className="site-container section-space">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">FIND YOUR FIT</span>
            <h2>
              Chit schemes built
              <br />
              <em>around your goals.</em>
            </h2>
          </div>
          <p>
            Different ambitions. The same steady approach.
            <br /> Find a chit scheme that fits your life.
          </p>
        </div>
        <div className="scheme-grid">
          {groups.map((group, index) => {
            const held = customerUser
              ? subscribers.filter(
                  (s) => s.groupId === group.id && s.userId === customerUser.id,
                ).length
              : 0;
            const max = group.maxTicketsPerPerson || 3;
            const full = group.currentMemberCount >= group.totalMembers;
            const closed =
              group.status === "COMPLETED" || group.status === "CANCELLED";
            const disabled = held >= max || full || closed;
            return (
              <article
                className={`scheme-card ${index % 2 ? "scheme-dark" : ""}`}
                key={group.id}
                data-home-reveal={index % 2 ? "right" : "left"}
              >
                <div className="scheme-top">
                  <span className="scheme-symbol">
                    {index % 2 ? <Layers size={23} /> : <Wallet size={23} />}
                  </span>
                  <span className="scheme-status">
                    <span className="status-dot" />
                    {group.status === "RECRUITING"
                      ? "Open for enrollment"
                      : group.status.toLowerCase()}
                  </span>
                </div>
                <span className="scheme-code">{group.groupCode}</span>
                <h3>
                  {group.groupName
                    .replace("RAKVIH ", "")
                    .replace(" Chit Scheme", "")}
                  <span> / CHIT SCHEME</span>
                </h3>
                <div className="scheme-value">
                  {money(group.totalValue)}
                  <span>Total chit value</span>
                </div>
                <div className="scheme-details">
                  <div>
                    <span>Monthly contribution</span>
                    <strong>
                      {money(group.monthlyContribution)}
                      <small> / month</small>
                    </strong>
                  </div>
                  <div>
                    <span>Scheme duration</span>
                    <strong>
                      {group.durationMonths}
                      <small> months</small>
                    </strong>
                  </div>
                </div>
                <div className="availability">
                  <span>
                    {Math.max(0, group.totalMembers - group.currentMemberCount)}{" "}
                    of {group.totalMembers} seats available
                  </span>
                  <span>{group.foremanCommissionPercent}% foreman fee</span>
                </div>
                <div className="scheme-extra-details">
                  <span>Max Limit / Person: <strong>Max {max} Tickets</strong></span>
                  <span>Enrolled Members: <strong>{group.currentMemberCount} / {group.totalMembers} Enrolled</strong></span>
                </div>
                <div className="seat-track">
                  <span
                    style={{
                      width: `${Math.min(100, (group.currentMemberCount / group.totalMembers) * 100)}%`,
                    }}
                  />
                </div>
                {held > 0 && (
                  <p className="held-tickets">
                    You hold {held} of {max} allowed tickets.
                  </p>
                )}
                <button
                  className="scheme-button"
                  disabled={disabled}
                  onClick={() => enroll(group.id)}
                >
                  {closed
                    ? "Scheme closed"
                    : full
                      ? "Fully subscribed"
                      : held >= max
                        ? "Ticket limit reached"
                        : held
                          ? "Add another ticket"
                          : customerUser
                            ? "Enroll in This Scheme"
                            : "Create Account to Enroll"}
                </button>
              </article>
            );
          })}
          <aside className="scheme-help" data-home-reveal="up">
            <span className="eyebrow">MAKE AN INFORMED START</span>
            <h3>
              Good decisions
              <br /> start with
              <br /> <em>clear numbers.</em>
            </h3>
            <p>
              See how your contribution, auction discount, and potential payout
              come together.
            </p>
            <a href="#calculator" className="text-link">
              Try the calculator
            </a>
            <div className="help-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </aside>
        </div>
        {groups.length === 0 && (
          <p className="empty-state">
            New schemes are on their way. Explore the calculator while you wait.
          </p>
        )}
        <p className="section-footnote">
          Review scheme terms, fees, and eligibility before enrolling.
          Contributions continue for the full scheme duration.
        </p>
        {message && (
          <div className="enrollment-message" role="status">
            <CheckCircle2 size={20} />
            <span>{message}</span>
            <Link href="/portal">
              View portal <ArrowRight size={15} />
            </Link>
            <button
              aria-label="Dismiss notification"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}
      </section>
      <section id="how-it-works" className="how-section">
        <div className="site-container">
          <div className="section-heading" data-home-reveal="left">
            <div>
              <span className="eyebrow">SIMPLE BY DESIGN</span>
              <h2>
                Your journey.
                <br />
                <em>One step at a time.</em>
              </h2>
            </div>
            <p>
              A familiar way to save.
              <br /> A more considered digital experience.
            </p>
          </div>
          <div className="steps-grid">
            {[
              [
                "01",
                "Find your scheme",
                "Choose a contribution and duration that feel right for your goals.",
              ],
              [
                "02",
                "Make it a habit",
                "Complete your profile, join your group, and contribute each month.",
              ],
              [
                "03",
                "Move towards more",
                "Participate in auctions and follow your contributions in your portal.",
              ],
            ].map(([num, title, text]) => (
              <div key={num} data-home-reveal={num === "01" ? "left" : num === "03" ? "right" : "up"}>
                <span className="step-number">
                  {num}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="calculator" className="site-container section-space">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</span>
            <h2>
              Let’s put your plans
              <br />
              <em>into perspective.</em>
            </h2>
          </div>
          <p>
            Adjust the numbers. Understand the possibilities.
            <br /> Start with a clearer picture.
          </p>
        </div>
        <ChitCalculator />
      </section>
      <section id="about" className="site-container">
        <div className="about-panel">
          <div data-home-reveal="left">
            <span className="eyebrow">THE RAKVIH WAY</span>
            <h2>
              Money is personal.
              <br />
              So is <em>our approach.</em>
            </h2>
            <p>
              Saving is about more than a number. It’s the freedom to plan, the
              confidence to take a step, and the people who help you get there.
            </p>
            <a href="#schemes" className="text-link">
              Build your next chapter
            </a>
          </div>
          <div className="values-list" data-home-reveal="right">
            {[
              [
                ShieldCheck,
                "Clarity comes first",
                "Understand your contribution, scheme duration, and fees before you begin.",
              ],
              [
                Users,
                "Progress, together",
                "A shared savings approach that connects individual ambitions.",
              ],
              [
                Wallet,
                "Your account, in view",
                "Follow your schemes and contribution records from your member portal.",
              ],
            ].map(([Icon, title, text]) => {
              const ValueIcon = Icon as typeof ShieldCheck;
              return (
                <div key={String(title)}>
                  <ValueIcon size={22} />
                  <div>
                    <h3>{String(title)}</h3>
                    <p>{String(text)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="site-container section-space regulatory-section">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">LEGAL PROTECTION &amp; TRANSPARENCY</span>
            <h2>Why Choose RAKVIH <em>Digital Chit Fund?</em></h2>
          </div>
          <p>
            Chit funds in India are formally governed by the Chit Funds Act, 1982.
            RAKVIH Solutions provides 100% digital compliance: prior sanctioned
            security deposits, transparent online auctions, and Maker-Checker
            authorized prize releases to protect every subscriber’s hard-earned savings.
          </p>
        </div>
        <div className="regulatory-grid">
          <article data-home-reveal="left">
            <span>01 / SECURITY</span>
            <h3>Statutory Security</h3>
            <p>100% chit value deposited in approved bank before commencing subscription.</p>
          </article>
          <article data-home-reveal="up">
            <span>02 / FAIR FEES</span>
            <h3>Regulated 5% Fee</h3>
            <p>Foreman commission capped at 5% per regulations, maximizing subscriber dividends.</p>
          </article>
          <article data-home-reveal="right">
            <span>03 / OVERSIGHT</span>
            <h3>Maker-Checker Authorization</h3>
            <p>Dual approval mandatory on all prize releases and bank disbursements.</p>
          </article>
        </div>
      </section>
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
      <section className="closing-section">
        <div className="site-container" data-home-reveal="up">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>
            Your future deserves
            <br />
            <em>a considered plan.</em>
          </h2>
          <>
            {customerUser ? (
              <Link className="button" href="/portal">
                Go to your portal
              </Link>
            ) : (
              <button
                className="button"
                onClick={() => openAuthModal("signup")}
              >
                Start your savings journey
              </button>
            )}
          </>
        </div>
      </section>
    </>
  );
}
