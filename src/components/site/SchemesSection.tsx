"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers, Wallet } from "lucide-react";
import { useApp } from "@/lib/store";
import { useReveal } from "@/lib/useReveal";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export function SchemesSection() {
  const { groups, customerUser, subscribers, joinChitGroup, openAuthModal } =
    useApp();
  const [message, setMessage] = useState("");
  useReveal(groups);
  async function enroll(id: string) {
    if (!customerUser) {
      openAuthModal("signup");
      return;
    }
    setMessage(
      await joinChitGroup(id)
        ? "You’re enrolled. Your scheme is ready to view in your member portal."
        : "We couldn’t complete your enrollment. Please check scheme availability and try again.",
    );
  }
  return (
    <section id="schemes" className="site-container section-space">
      <div className="section-heading" data-home-reveal="down">
        <div>
          <span className="eyebrow">FIND YOUR FIT</span>
          <h1 className="page-heading">
            Chit schemes built
            <br />
            <em>around your goals.</em>
          </h1>
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
          <Link href="/calculator" className="text-link">
            Try the calculator
          </Link>
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
  );
}
