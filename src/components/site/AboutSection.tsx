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
import { ClosingCta } from "@/components/site/ClosingCta";

const values = [
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
] as const;

const facts = [
  ["Chit Funds Act, 1982", "The law every RAKVIH scheme is run under"],
  ["5% maximum", "Foreman commission, capped by regulation"],
  ["2-person approval", "Required before any prize money is released"],
  ["24×7 access", "To your schemes, receipts and auction results"],
] as const;

const principles = [
  [Eye, "Transparency", "Scheme terms, fees, auction results and dividends are shown openly to every member of the group, not hidden in paper ledgers."],
  [Scale, "Fairness", "Every eligible member gets an equal chance to bid. Auctions follow published rules, and the winning bid and dividend are visible to the whole group."],
  [Sprout, "Discipline", "A fixed monthly contribution builds a steady savings habit, with reminders and a clear schedule so you always know what is due."],
  [Lock, "Security", "Your identity, bank details and payments are protected with verification checks, encryption and strict access controls."],
  [HeartHandshake, "Community", "A chit is a group working towards shared progress. We treat every member as part of that community, not as an account number."],
  [Smartphone, "Accessibility", "Join, pay, bid and track everything from your phone or computer. No queues, no paperwork, no trips to a branch."],
] as const;

const safeguards = [
  [Fingerprint, "Verified members", "Every member completes KYC with PAN, Aadhaar and photo verification before joining a scheme."],
  [BadgeCheck, "Maker-checker payouts", "Prize money is released only after two different authorised staff members approve it."],
  [Landmark, "Verified bank accounts", "Payouts go only to a bank account in the winner’s own name, verified by our team."],
  [Receipt, "A receipt for every rupee", "Each contribution generates a digital receipt and an entry in your statement."],
  [ScrollText, "Complete audit trail", "Every approval, auction and payout is recorded in a permanent log that cannot be edited."],
  [Gavel, "Guarantor checks", "Where a scheme requires it, guarantors and security documents are verified before release."],
] as const;

const audiences = [
  [Briefcase, "Salaried professionals", "Save a fixed part of every salary and build towards a goal with discipline."],
  [Store, "Small business owners", "Access a lump sum for stock, equipment or working capital when you need it."],
  [House, "Families", "Plan ahead for education, weddings, home improvements or emergencies."],
  [Users, "Self-employed members", "Turn irregular income into a steady saving habit with a predictable schedule."],
] as const;

const promises = [
  "We show you the complete scheme terms, fees and duration before you enroll.",
  "Every payment you make is acknowledged with a digital receipt.",
  "Auction results and dividends are published to every member of the group.",
  "Prize money is paid only to your own verified bank account.",
  "We charge no hidden fees beyond the disclosed foreman commission.",
  "Your personal and KYC data is used only to run your chit and meet legal requirements.",
] as const;

export function AboutSection() {
  useReveal();
  return (
    <>
      <section id="about" className="site-container about-page-intro">
        <div className="about-panel">
          <div data-home-reveal="left">
            <span className="eyebrow">THE RAKVIH WAY</span>
            <h1 className="page-heading">
              Money is personal.
              <br />
              So is <em>our approach.</em>
            </h1>
            <p>
              Saving is about more than a number. It’s the freedom to plan, the
              confidence to take a step, and the people who help you get there.
            </p>
            <Link href="/schemes" className="text-link">
              Build your next chapter
            </Link>
          </div>
          <div className="values-list" data-home-reveal="right">
            {values.map(([ValueIcon, title, text]) => (
              <div key={title}>
                <ValueIcon size={22} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-space about-story">
        <div data-home-reveal="left">
          <span className="eyebrow">OUR STORY</span>
          <h2>
            A trusted tradition,
            <br />
            <em>rebuilt for today.</em>
          </h2>
        </div>
        <div className="about-story-copy" data-home-reveal="right">
          <p>
            For generations, families across India have used chit funds to save
            together. A group of people contribute a fixed amount every month,
            and each month one member receives the pooled amount. It is simple,
            it builds discipline, and it gives members access to a lump sum
            without depending on a bank loan.
          </p>
          <p>
            But the traditional way often runs on paper registers, cash
            collections and trust in a single person. Members rarely see how
            auctions are decided, where their money is held, or what they are
            owed. When something goes wrong, there is little record to rely on.
          </p>
          <p>
            RAKVIH Solutions Private Limited, based in Bangalore, exists to keep
            everything that works about chit funds and fix what doesn’t. We run
            regulated chit schemes on a fully digital platform, so every
            contribution, auction and payout is recorded, visible and
            accountable.
          </p>
        </div>
      </section>

      <section className="site-container about-facts" aria-label="RAKVIH at a glance">
        {facts.map(([value, label]) => (
          <div key={value} data-home-reveal="up">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="site-container section-space">
        <div className="mission-grid">
          <article data-home-reveal="left">
            <span className="mission-icon"><Target size={22} /></span>
            <span className="eyebrow">OUR MISSION</span>
            <h3>Make disciplined saving simple, fair and open to everyone.</h3>
            <p>
              We want every member to understand exactly where their money is,
              how auctions work, and what they will receive, with a platform
              that makes regular saving effortless.
            </p>
          </article>
          <article className="mission-dark" data-home-reveal="right">
            <span className="mission-icon"><Sprout size={22} /></span>
            <span className="eyebrow">OUR VISION</span>
            <h3>Be the most trusted name in digital chit funds in India.</h3>
            <p>
              A future where saving with a chit fund is as transparent and
              secure as any modern financial product, and where communities
              grow their wealth together.
            </p>
          </article>
        </div>
      </section>

      <section className="site-container about-principles">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">WHAT WE STAND FOR</span>
            <h2>
              Six principles behind
              <br />
              <em>every scheme we run.</em>
            </h2>
          </div>
          <p>
            These guide how we design schemes, conduct auctions and treat every
            member, every month.
          </p>
        </div>
        <div className="regulatory-grid">
          {principles.map(([Icon, title, text]) => (
            <article key={title} data-home-reveal="up">
              <Icon size={22} className="principle-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
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

      <section className="how-section">
        <div className="site-container">
          <div className="section-heading" data-home-reveal="left">
            <div>
              <span className="eyebrow">HOW WE PROTECT YOUR MONEY</span>
              <h2>
                Safeguards at
                <br />
                <em>every step.</em>
              </h2>
            </div>
            <p>
              From the day you join to the day you receive your prize money,
              checks are built into the process.
            </p>
          </div>
          <div className="steps-grid protect-grid">
            {safeguards.map(([Icon, title, text]) => (
              <div key={title} data-home-reveal="up">
                <span className="step-number">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-space">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">WHO WE SERVE</span>
            <h2>
              Built for people
              <br />
              <em>with plans.</em>
            </h2>
          </div>
          <p>
            Whatever you are saving for, a chit scheme gives you a steady path
            and access to funds when it matters.
          </p>
        </div>
        <div className="regulatory-grid audience-grid">
          {audiences.map(([Icon, title, text]) => (
            <article key={title} data-home-reveal="up">
              <Icon size={22} className="principle-icon" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container about-promise">
        <div data-home-reveal="left">
          <span className="eyebrow">OUR PROMISE TO YOU</span>
          <h2>
            Commitments you
            <br />
            <em>can hold us to.</em>
          </h2>
          <p>
            Trust is earned month after month. These are the standards we hold
            ourselves to for every member and every scheme.
          </p>
          <Link href="/how-it-works" className="text-link">
            See how it works <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="promise-list" data-home-reveal="right">
          {promises.map((promise) => (
            <li key={promise}>
              <CircleCheck size={20} />
              <span>{promise}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="site-container section-space">
        <div className="about-contact" data-home-reveal="up">
          <div>
            <span className="eyebrow">TALK TO US</span>
            <h2>
              Questions before
              <br />
              <em>you begin?</em>
            </h2>
            <p>
              Our team is happy to explain how a scheme works, help you choose
              the right one, or walk you through enrollment.
            </p>
          </div>
          <div className="about-contact-list">
            <a href="mailto:support@rakvih.com">
              <Mail size={20} />
              <span>
                <small>Email</small>
                support@rakvih.com
              </span>
            </a>
            <a href="tel:+918040001234">
              <Phone size={20} />
              <span>
                <small>Phone</small>
                +91 80 4000 1234
              </span>
            </a>
            <div>
              <MapPin size={20} />
              <span>
                <small>Office</small>
                Bangalore, Karnataka, India
              </span>
            </div>
            <div>
              <FileCheck size={20} />
              <span>
                <small>Registration</small>
                Registered under the Chit Funds Act, 1982
              </span>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
