"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CreditCard,
  Fingerprint,
  Gavel,
  HandCoins,
  LayoutDashboard,
  Percent,
  PiggyBank,
  Receipt,
  UserPlus,
} from "lucide-react";
import { useApp } from "@/lib/store";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const date = (value: string) =>
  new Date(value.replace(" ", "T")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const benefits = [
  [PiggyBank, "Save with discipline", "A fixed monthly contribution turns saving into a habit, with a clear schedule from the first month to the last."],
  [HandCoins, "Access a lump sum early", "Need funds before the scheme ends? Bid in the monthly auction and receive the prize money when you win."],
  [Percent, "Earn a dividend every month", "The discount from each auction, after the foreman commission, is shared among members and lowers their contribution."],
] as const;

const cycle = [
  [UserPlus, "01", "Join a group", "Choose a scheme, complete your KYC, and take a ticket in a group of members."],
  [CalendarCheck, "02", "Contribute monthly", "Every member pays the same monthly contribution for the full duration of the scheme."],
  [Gavel, "03", "Bid in the auction", "Each month, members who haven’t won yet can bid. The highest discount offered wins that month’s chit."],
  [HandCoins, "04", "Receive and continue", "The winner receives the prize money after verification and keeps contributing until the scheme ends."],
] as const;

const features = [
  [Fingerprint, "Online KYC", "Upload your PAN, Aadhaar, photograph, signature and bank proof from home. Our team verifies them before you join."],
  [CreditCard, "Pay your way", "Pay your monthly contribution by UPI, net banking, debit or credit card, or bank transfer."],
  [Gavel, "Live e-auctions", "Bid from your phone during the auction window and see the leading bid as it happens."],
  [Receipt, "Digital receipts", "Every payment is recorded with a receipt, so your statement is always complete and up to date."],
  [BadgeCheck, "Maker-checker payouts", "Prize money is released to your verified bank account only after two authorised staff approve it."],
  [LayoutDashboard, "One member portal", "See your schemes, upcoming dues, auction results and payout status in a single place."],
] as const;

export function HomeExplainer() {
  return (
    <section className="site-container section-space about-story">
      <div data-home-reveal="left">
        <span className="eyebrow">CHIT FUNDS, SIMPLY EXPLAINED</span>
        <h2>
          Save together.
          <br />
          <em>Access funds when it matters.</em>
        </h2>
      </div>
      <div className="about-story-copy" data-home-reveal="right">
        <p>
          A chit fund brings a group of people together to save. Every member
          contributes a fixed amount each month, and every month the pooled
          amount goes to one member, decided through an auction. Over the life
          of the scheme, every member gets their turn to receive it once.
        </p>
        <p>
          It is one of India’s most familiar ways to save, and it works as both
          a savings plan and a source of funds, without depending on a bank
          loan. In India, chit funds are governed by the Chit Funds Act, 1982.
        </p>
        <ul className="benefit-list">
          {benefits.map(([Icon, title, text]) => (
            <li key={title}>
              <Icon size={22} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeCycle() {
  return (
    <section className="how-section">
      <div className="site-container">
        <div className="section-heading" data-home-reveal="left">
          <div>
            <span className="eyebrow">ONE MONTH IN A CHIT</span>
            <h2>
              How every month
              <br />
              <em>comes together.</em>
            </h2>
          </div>
          <p>
            The same simple cycle repeats every month until every member has
            received the chit value.
          </p>
        </div>
        <div className="steps-grid cycle-grid">
          {cycle.map(([Icon, num, title, text]) => (
            <div key={num} data-home-reveal="up">
              <span className="step-number">
                {num}
                <Icon size={20} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <Link href="/how-it-works" className="text-link cycle-link">
          Read the full guide <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export function HomeExample() {
  const value = 100000;
  const members = 20;
  const monthly = value / members;
  const bid = 20000;
  const commission = value * 0.05;
  const pool = bid - commission;
  const dividend = pool / members;
  const rows = [
    ["Chit value", money(value)],
    ["Members and duration", `${members} members · ${members} months`],
    ["Monthly contribution", money(monthly)],
    ["Winning bid (discount given up)", `${money(bid)} · 20%`],
    ["Foreman commission (5%)", money(commission)],
    ["Dividend shared by members", money(pool)],
    ["Dividend per member", money(dividend)],
  ];
  return (
    <section className="site-container section-space">
      <div className="example-panel">
        <div data-home-reveal="left">
          <span className="eyebrow">SEE THE NUMBERS</span>
          <h2>
            A ₹1 lakh chit,
            <br />
            <em>worked out.</em>
          </h2>
          <p>
            Here is one month of a 20-member ₹1,00,000 scheme, like our
            Emerald scheme. A member who needs funds bids a 20% discount and
            wins the auction.
          </p>
          <p>
            The winner receives the chit value minus their bid. The discount,
            after the foreman commission, is shared equally by all members, so
            everyone pays less that month.
          </p>
          <Link href="/calculator" className="text-link">
            Try your own numbers <ArrowRight size={16} />
          </Link>
        </div>
        <div className="example-card" data-home-reveal="right">
          <dl>
            {rows.map(([label, amount]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{amount}</dd>
              </div>
            ))}
          </dl>
          <div className="example-results">
            <div>
              <span>Winner receives</span>
              <strong>{money(value - bid)}</strong>
            </div>
            <div>
              <span>Each member pays this month</span>
              <strong>{money(monthly - dividend)}</strong>
            </div>
          </div>
          <p className="example-note">
            Illustration only. Actual amounts depend on the winning bid each
            month and the terms of your scheme.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeSchemes() {
  const { groups } = useApp();
  const open = groups.filter((group) => group.status === "RECRUITING");
  if (open.length === 0) return null;
  return (
    <section className="site-container section-space home-schemes">
      <div className="section-heading" data-home-reveal="down">
        <div>
          <span className="eyebrow">OPEN FOR ENROLLMENT</span>
          <h2>
            Schemes starting
            <br />
            <em>soon.</em>
          </h2>
        </div>
        <p>
          Seats are limited in every group. Compare the schemes below and
          reserve your ticket before the group starts.
        </p>
      </div>
      <div className="home-scheme-grid">
        {open.map((group, index) => {
          const seatsLeft = Math.max(0, group.totalMembers - group.currentMemberCount);
          return (
            <Link
              href="/schemes"
              key={group.id}
              className={`home-scheme ${index % 2 ? "home-scheme-dark" : ""}`}
              data-home-reveal={index % 2 ? "right" : "left"}
            >
              <span className="home-scheme-code">{group.groupCode}</span>
              <h3>
                {group.groupName.replace("RAKVIH ", "").replace(" Chit Scheme", "")}
              </h3>
              <strong className="home-scheme-value">{money(group.totalValue)}</strong>
              <dl>
                <div>
                  <dt>Monthly</dt>
                  <dd>{money(group.monthlyContribution)}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{group.durationMonths} months</dd>
                </div>
                <div>
                  <dt>Starts</dt>
                  <dd>{date(group.startDate)}</dd>
                </div>
                <div>
                  <dt>Seats left</dt>
                  <dd>
                    {seatsLeft} of {group.totalMembers}
                  </dd>
                </div>
              </dl>
              <span className="home-scheme-link">
                View scheme <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function HomeFeatures() {
  return (
    <section className="site-container section-space about-principles">
      <div className="section-heading" data-home-reveal="down">
        <div>
          <span className="eyebrow">WHY GO DIGITAL WITH RAKVIH</span>
          <h2>
            Everything about your chit,
            <br />
            <em>in one place.</em>
          </h2>
        </div>
        <p>
          No paper registers and no cash collections. Every step, from joining
          to receiving your payout, happens online and is recorded.
        </p>
      </div>
      <div className="regulatory-grid">
        {features.map(([Icon, title, text]) => (
          <article key={title} data-home-reveal="up">
            <Icon size={22} className="principle-icon" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
