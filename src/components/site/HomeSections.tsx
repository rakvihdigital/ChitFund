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
import { msg, useT } from "@/lib/i18n";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const date = (value: string, language: string) =>
  new Date(value.replace(" ", "T")).toLocaleDateString(`${language}-IN`, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const benefits = [
  [PiggyBank, msg("Save with discipline"), msg("A fixed monthly contribution turns saving into a habit, with a clear schedule from the first month to the last.")],
  [HandCoins, msg("Access a lump sum early"), msg("Need funds before the scheme ends? Bid in the monthly auction and receive the prize money when you win.")],
  [Percent, msg("Earn a dividend every month"), msg("The discount from each auction, after the foreman commission, is shared among members and lowers their contribution.")],
] as const;

const cycle = [
  [UserPlus, "01", msg("Join a group"), msg("Choose a scheme, complete your KYC, and take a ticket in a group of members.")],
  [CalendarCheck, "02", msg("Contribute monthly"), msg("Every member pays the same monthly contribution for the full duration of the scheme.")],
  [Gavel, "03", msg("Bid in the auction"), msg("Each month, members who haven’t won yet can bid. The highest discount offered wins that month’s chit.")],
  [HandCoins, "04", msg("Receive and continue"), msg("The winner receives the prize money after verification and keeps contributing until the scheme ends.")],
] as const;

const features = [
  [Fingerprint, msg("Online KYC"), msg("Upload your PAN, Aadhaar, photograph and a cancelled cheque from home when you register. Our team verifies them before your account is activated.")],
  [CreditCard, msg("Pay your way"), msg("Pay your monthly contribution by UPI, net banking, debit or credit card, or bank transfer.")],
  [Gavel, msg("Live e-auctions"), msg("Bid from your phone during the auction window and see the leading bid as it happens.")],
  [Receipt, msg("Digital receipts"), msg("Every payment is recorded with a receipt, so your statement is always complete and up to date.")],
  [BadgeCheck, msg("Maker-checker payouts"), msg("Prize money is released to your verified bank account only after two authorised staff approve it.")],
  [LayoutDashboard, msg("One member portal"), msg("See your schemes, upcoming dues, auction results and payout status in a single place.")],
] as const;

export function HomeExplainer() {
  const { t } = useT();
  return (
    <section className="site-container section-space about-story">
      <div data-home-reveal="left">
        <span className="eyebrow">{t("CHIT FUNDS, SIMPLY EXPLAINED")}</span>
        <h2>
          {t("Save together.")}
          <br />
          <em>{t("Access funds when it matters.")}</em>
        </h2>
      </div>
      <div className="about-story-copy" data-home-reveal="right">
        <p>
          {t("A chit fund brings a group of people together to save. Every member contributes a fixed amount each month, and every month the pooled amount goes to one member, decided through an auction. Over the life of the scheme, every member gets their turn to receive it once.")}
        </p>
        <p>
          {t("It is one of India’s most familiar ways to save, and it works as both a savings plan and a source of funds, without depending on a bank loan. In India, chit funds are governed by the Chit Funds Act, 1982.")}
        </p>
        <ul className="benefit-list">
          {benefits.map(([Icon, title, text]) => (
            <li key={title}>
              <Icon size={22} />
              <div>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeCycle() {
  const { t } = useT();
  return (
    <section className="how-section">
      <div className="site-container">
        <div className="section-heading" data-home-reveal="left">
          <div>
            <span className="eyebrow">{t("ONE MONTH IN A CHIT")}</span>
            <h2>
              {t("How every month")}
              <br />
              <em>{t("comes together.")}</em>
            </h2>
          </div>
          <p>
            {t("The same simple cycle repeats every month until every member has received the chit value.")}
          </p>
        </div>
        <div className="steps-grid cycle-grid">
          {cycle.map(([Icon, num, title, text]) => (
            <div key={num} data-home-reveal="up">
              <span className="step-number">
                {num}
                <Icon size={20} />
              </span>
              <h3>{t(title)}</h3>
              <p>{t(text)}</p>
            </div>
          ))}
        </div>
        <Link href="/how-it-works" className="text-link cycle-link">
          {t("Read the full guide")} <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export function HomeExample() {
  const { t } = useT();
  const value = 100000;
  const members = 20;
  const monthly = value / members;
  const bid = 20000;
  const commission = value * 0.05;
  const pool = bid - commission;
  const dividend = pool / members;
  const rows = [
    [t("Chit value"), money(value)],
    [t("Members and duration"), t("{members} members · {months} months", { members, months: members })],
    [t("Monthly contribution"), money(monthly)],
    [t("Winning bid (discount given up)"), `${money(bid)} · 20%`],
    [t("Foreman commission (5%)"), money(commission)],
    [t("Dividend shared by members"), money(pool)],
    [t("Dividend per member"), money(dividend)],
  ];
  return (
    <section className="site-container section-space">
      <div className="example-panel">
        <div data-home-reveal="left">
          <span className="eyebrow">{t("SEE THE NUMBERS")}</span>
          <h2>
            {t("A ₹1 lakh chit,")}
            <br />
            <em>{t("worked out.")}</em>
          </h2>
          <p>
            {t("Here is one month of a 20-member ₹1,00,000 scheme, like our Emerald scheme. A member who needs funds bids a 20% discount and wins the auction.")}
          </p>
          <p>
            {t("The winner receives the chit value minus their bid. The discount, after the foreman commission, is shared equally by all members, so everyone pays less that month.")}
          </p>
          <Link href="/calculator" className="text-link">
            {t("Try your own numbers")} <ArrowRight size={16} />
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
              <span>{t("Winner receives")}</span>
              <strong>{money(value - bid)}</strong>
            </div>
            <div>
              <span>{t("Each member pays this month")}</span>
              <strong>{money(monthly - dividend)}</strong>
            </div>
          </div>
          <p className="example-note">
            {t("Illustration only. Actual amounts depend on the winning bid each month and the terms of your scheme.")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeSchemes() {
  const { groups } = useApp();
  const { t, language } = useT();
  const open = groups.filter((group) => group.status === "RECRUITING");
  if (open.length === 0) return null;
  return (
    <section className="site-container section-space home-schemes">
      <div className="section-heading" data-home-reveal="down">
        <div>
          <span className="eyebrow">{t("OPEN FOR ENROLLMENT")}</span>
          <h2>
            {t("Schemes starting")}
            <br />
            <em>{t("soon.")}</em>
          </h2>
        </div>
        <p>
          {t("Seats are limited in every group. Compare the schemes below and reserve your ticket before the group starts.")}
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
                {group.groupName.replace(/^(RAKVIH|ChitFund) /, "").replace(" Chit Scheme", "")}
              </h3>
              <strong className="home-scheme-value">{money(group.totalValue)}</strong>
              <dl>
                <div>
                  <dt>{t("Monthly")}</dt>
                  <dd>{money(group.monthlyContribution)}</dd>
                </div>
                <div>
                  <dt>{t("Duration")}</dt>
                  <dd>{t("{count} months", { count: group.durationMonths })}</dd>
                </div>
                <div>
                  <dt>{t("Starts")}</dt>
                  <dd>{date(group.startDate, language)}</dd>
                </div>
                <div>
                  <dt>{t("Seats left")}</dt>
                  <dd>
                    {t("{left} of {total}", { left: seatsLeft, total: group.totalMembers })}
                  </dd>
                </div>
              </dl>
              <span className="home-scheme-link">
                {t("View scheme")} <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function HomeFeatures() {
  const { t } = useT();
  return (
    <section className="site-container section-space about-principles">
      <div className="section-heading" data-home-reveal="down">
        <div>
          <span className="eyebrow">{t("WHY GO DIGITAL WITH CHITFUND")}</span>
          <h2>
            {t("Everything about your chit,")}
            <br />
            <em>{t("in one place.")}</em>
          </h2>
        </div>
        <p>
          {t("No paper registers and no cash collections. Every step, from joining to receiving your payout, happens online and is recorded.")}
        </p>
      </div>
      <div className="regulatory-grid">
        {features.map(([Icon, title, text]) => (
          <article key={title} data-home-reveal="up">
            <Icon size={22} className="principle-icon" />
            <h3>{t(title)}</h3>
            <p>{t(text)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
