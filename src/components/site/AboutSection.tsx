"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CircleCheck,
  Eye,
  FileCheck,
  Fingerprint,
  Gavel,
  HeartHandshake,
  House,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Scale,
  ScrollText,
  ShieldCheck,
  Smartphone,
  Sprout,
  Store,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { useReveal } from "@/lib/useReveal";
import { msg, useT } from "@/lib/i18n";
import { ClosingCta } from "@/components/site/ClosingCta";

const values = [
  [
    ShieldCheck,
    msg("Clarity comes first"),
    msg("Understand your contribution, scheme duration, and fees before you begin."),
  ],
  [
    Users,
    msg("Progress, together"),
    msg("A shared savings approach that connects individual ambitions."),
  ],
  [
    Wallet,
    msg("Your account, in view"),
    msg("Follow your schemes and contribution records from your member portal."),
  ],
] as const;

const facts = [
  [msg("Chit Funds Act, 1982"), msg("The law every ChitFund scheme is run under")],
  [msg("5% maximum"), msg("Foreman commission, capped by regulation")],
  [msg("2-person approval"), msg("Required before any prize money is released")],
  [msg("24×7 access"), msg("To your schemes, receipts and auction results")],
] as const;

const principles = [
  [Eye, msg("Transparency"), msg("Scheme terms, fees, auction results and dividends are shown openly to every member of the group, not hidden in paper ledgers.")],
  [Scale, msg("Fairness"), msg("Every eligible member gets an equal chance to bid. Auctions follow published rules, and the winning bid and dividend are visible to the whole group.")],
  [Sprout, msg("Discipline"), msg("A fixed monthly contribution builds a steady savings habit, with reminders and a clear schedule so you always know what is due.")],
  [Lock, msg("Security"), msg("Your identity, bank details and payments are protected with verification checks, encryption and strict access controls.")],
  [HeartHandshake, msg("Community"), msg("A chit is a group working towards shared progress. We treat every member as part of that community, not as an account number.")],
  [Smartphone, msg("Accessibility"), msg("Join, pay, bid and track everything from your phone or computer. No queues, no paperwork, no trips to a branch.")],
] as const;

const safeguards = [
  [Fingerprint, msg("Verified members"), msg("Every member completes KYC with PAN, Aadhaar and photo verification before joining a scheme.")],
  [BadgeCheck, msg("Maker-checker payouts"), msg("Prize money is released only after two different authorised staff members approve it.")],
  [Landmark, msg("Verified bank accounts"), msg("Payouts go only to a bank account in the winner’s own name, verified by our team.")],
  [Receipt, msg("A receipt for every rupee"), msg("Each contribution generates a digital receipt and an entry in your statement.")],
  [ScrollText, msg("Complete audit trail"), msg("Every approval, auction and payout is recorded in a permanent log that cannot be edited.")],
  [Gavel, msg("Guarantor checks"), msg("Where a scheme requires it, guarantors and security documents are verified before release.")],
] as const;

const audiences = [
  [Briefcase, msg("Salaried professionals"), msg("Save a fixed part of every salary and build towards a goal with discipline.")],
  [Store, msg("Small business owners"), msg("Access a lump sum for stock, equipment or working capital when you need it.")],
  [House, msg("Families"), msg("Plan ahead for education, weddings, home improvements or emergencies.")],
  [Users, msg("Self-employed members"), msg("Turn irregular income into a steady saving habit with a predictable schedule.")],
] as const;

const promises = [
  msg("We show you the complete scheme terms, fees and duration before you enroll."),
  msg("Every payment you make is acknowledged with a digital receipt."),
  msg("Auction results and dividends are published to every member of the group."),
  msg("Prize money is paid only to your own verified bank account."),
  msg("We charge no hidden fees beyond the disclosed foreman commission."),
  msg("Your personal and KYC data is used only to run your chit and meet legal requirements."),
] as const;

export function AboutSection() {
  useReveal();
  const { t } = useT();
  return (
    <>
      <section id="about" className="site-container about-page-intro">
        <div className="about-panel">
          <div data-home-reveal="left">
            <span className="eyebrow">{t("THE CHITFUND WAY")}</span>
            <h1 className="page-heading">
              {t("Money is personal.")}
              <br />
              {t("So is")} <em>{t("our approach.")}</em>
            </h1>
            <p>
              {t("Saving is about more than a number. It’s the freedom to plan, the confidence to take a step, and the people who help you get there.")}
            </p>
            <Link href="/schemes" className="text-link">
              {t("Build your next chapter")}
            </Link>
          </div>
          <div className="values-list" data-home-reveal="right">
            {values.map(([ValueIcon, title, text]) => (
              <div key={title}>
                <ValueIcon size={22} />
                <div>
                  <h3>{t(title)}</h3>
                  <p>{t(text)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-space about-story">
        <div data-home-reveal="left">
          <span className="eyebrow">{t("OUR STORY")}</span>
          <h2>
            {t("A trusted tradition,")}
            <br />
            <em>{t("rebuilt for today.")}</em>
          </h2>
        </div>
        <div className="about-story-copy" data-home-reveal="right">
          <p>
            {t("For generations, families across India have used chit funds to save together. A group of people contribute a fixed amount every month, and each month one member receives the pooled amount. It is simple, it builds discipline, and it gives members access to a lump sum without depending on a bank loan.")}
          </p>
          <p>
            {t("But the traditional way often runs on paper registers, cash collections and trust in a single person. Members rarely see how auctions are decided, where their money is held, or what they are owed. When something goes wrong, there is little record to rely on.")}
          </p>
          <p>
            {t("ChitFund Solutions Private Limited, based in Bangalore, exists to keep everything that works about chit funds and fix what doesn’t. We run regulated chit schemes on a fully digital platform, so every contribution, auction and payout is recorded, visible and accountable.")}
          </p>
        </div>
      </section>

      <section className="site-container about-facts" aria-label={t("ChitFund at a glance")}>
        {facts.map(([value, label]) => (
          <div key={value} data-home-reveal="up">
            <strong>{t(value)}</strong>
            <span>{t(label)}</span>
          </div>
        ))}
      </section>

      <section className="site-container section-space">
        <div className="mission-grid">
          <article data-home-reveal="left">
            <span className="mission-icon"><Target size={22} /></span>
            <span className="eyebrow">{t("OUR MISSION")}</span>
            <h3>{t("Make disciplined saving simple, fair and open to everyone.")}</h3>
            <p>
              {t("We want every member to understand exactly where their money is, how auctions work, and what they will receive, with a platform that makes regular saving effortless.")}
            </p>
          </article>
          <article className="mission-dark" data-home-reveal="right">
            <span className="mission-icon"><Sprout size={22} /></span>
            <span className="eyebrow">{t("OUR VISION")}</span>
            <h3>{t("Be the most trusted name in digital chit funds in India.")}</h3>
            <p>
              {t("A future where saving with a chit fund is as transparent and secure as any modern financial product, and where communities grow their wealth together.")}
            </p>
          </article>
        </div>
      </section>

      <section className="site-container about-principles">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">{t("WHAT WE STAND FOR")}</span>
            <h2>
              {t("Six principles behind")}
              <br />
              <em>{t("every scheme we run.")}</em>
            </h2>
          </div>
          <p>
            {t("These guide how we design schemes, conduct auctions and treat every member, every month.")}
          </p>
        </div>
        <div className="regulatory-grid">
          {principles.map(([Icon, title, text]) => (
            <article key={title} data-home-reveal="up">
              <Icon size={22} className="principle-icon" />
              <h3>{t(title)}</h3>
              <p>{t(text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container section-space regulatory-section">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">{t("LEGAL PROTECTION & TRANSPARENCY")}</span>
            <h2>{t("Why Choose ChitFund")} <em>{t("Digital Chit Fund?")}</em></h2>
          </div>
          <p>
            {t("Chit funds in India are formally governed by the Chit Funds Act, 1982. ChitFund Solutions provides 100% digital compliance: prior sanctioned security deposits, transparent online auctions, and Maker-Checker authorized prize releases to protect every subscriber’s hard-earned savings.")}
          </p>
        </div>
        <div className="regulatory-grid">
          <article data-home-reveal="left">
            <span>{t("01 / SECURITY")}</span>
            <h3>{t("Statutory Security")}</h3>
            <p>{t("100% chit value deposited in approved bank before commencing subscription.")}</p>
          </article>
          <article data-home-reveal="up">
            <span>{t("02 / FAIR FEES")}</span>
            <h3>{t("Regulated 5% Fee")}</h3>
            <p>{t("Foreman commission capped at 5% per regulations, maximizing subscriber dividends.")}</p>
          </article>
          <article data-home-reveal="right">
            <span>{t("03 / OVERSIGHT")}</span>
            <h3>{t("Maker-Checker Authorization")}</h3>
            <p>{t("Dual approval mandatory on all prize releases and bank disbursements.")}</p>
          </article>
        </div>
      </section>

      <section className="how-section">
        <div className="site-container">
          <div className="section-heading" data-home-reveal="left">
            <div>
              <span className="eyebrow">{t("HOW WE PROTECT YOUR MONEY")}</span>
              <h2>
                {t("Safeguards at")}
                <br />
                <em>{t("every step.")}</em>
              </h2>
            </div>
            <p>
              {t("From the day you join to the day you receive your prize money, checks are built into the process.")}
            </p>
          </div>
          <div className="steps-grid protect-grid">
            {safeguards.map(([Icon, title, text]) => (
              <div key={title} data-home-reveal="up">
                <span className="step-number">
                  <Icon size={22} />
                </span>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-space">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">{t("WHO WE SERVE")}</span>
            <h2>
              {t("Built for people")}
              <br />
              <em>{t("with plans.")}</em>
            </h2>
          </div>
          <p>
            {t("Whatever you are saving for, a chit scheme gives you a steady path and access to funds when it matters.")}
          </p>
        </div>
        <div className="regulatory-grid audience-grid">
          {audiences.map(([Icon, title, text]) => (
            <article key={title} data-home-reveal="up">
              <Icon size={22} className="principle-icon" />
              <h3>{t(title)}</h3>
              <p>{t(text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container about-promise">
        <div data-home-reveal="left">
          <span className="eyebrow">{t("OUR PROMISE TO YOU")}</span>
          <h2>
            {t("Commitments you")}
            <br />
            <em>{t("can hold us to.")}</em>
          </h2>
          <p>
            {t("Trust is earned month after month. These are the standards we hold ourselves to for every member and every scheme.")}
          </p>
          <Link href="/how-it-works" className="text-link">
            {t("See how it works")} <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="promise-list" data-home-reveal="right">
          {promises.map((promise) => (
            <li key={promise}>
              <CircleCheck size={20} />
              <span>{t(promise)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="site-container section-space">
        <div className="about-contact" data-home-reveal="up">
          <div>
            <span className="eyebrow">{t("TALK TO US")}</span>
            <h2>
              {t("Questions before")}
              <br />
              <em>{t("you begin?")}</em>
            </h2>
            <p>
              {t("Our team is happy to explain how a scheme works, help you choose the right one, or walk you through enrollment.")}
            </p>
          </div>
          <div className="about-contact-list">
            <a href="mailto:support@rakvih.com">
              <Mail size={20} />
              <span>
                <small>{t("Email")}</small>
                support@rakvih.com
              </span>
            </a>
            <a href="tel:+918040001234">
              <Phone size={20} />
              <span>
                <small>{t("Phone")}</small>
                +91 80 4000 1234
              </span>
            </a>
            <div>
              <MapPin size={20} />
              <span>
                <small>{t("Office")}</small>
                {t("Bangalore, Karnataka, India")}
              </span>
            </div>
            <div>
              <FileCheck size={20} />
              <span>
                <small>{t("Registration")}</small>
                {t("Registered under the Chit Funds Act, 1982")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
