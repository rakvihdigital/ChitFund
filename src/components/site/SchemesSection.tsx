"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers, Wallet } from "lucide-react";
import { useApp } from "@/lib/store";
import { useReveal } from "@/lib/useReveal";
import { msg, useT } from "@/lib/i18n";
import { JoinGroupDialog } from "@/components/ChitAgreement";
import type { ChitGroup } from "@/lib/types";

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const statusLabels: Record<ChitGroup["status"], string> = {
  RECRUITING: msg("Open for enrollment"),
  ACTIVE: msg("Active"),
  COMPLETED: msg("Completed"),
  CANCELLED: msg("Cancelled"),
};

export function SchemesSection() {
  const { groups, customerUser, subscribers, openAuthModal } = useApp();
  const { t } = useT();
  const [message, setMessage] = useState("");
  const [joining, setJoining] = useState<ChitGroup | null>(null);
  useReveal(groups);
  function enroll(group: ChitGroup) {
    if (!customerUser) {
      openAuthModal("signup");
      return;
    }
    setMessage("");
    setJoining(group);
  }
  return (
    <section id="schemes" className="site-container section-space">
      <div className="section-heading" data-home-reveal="down">
        <div>
          <span className="eyebrow">{t("FIND YOUR FIT")}</span>
          <h1 className="page-heading">
            {t("Chit schemes built")}
            <br />
            <em>{t("around your goals.")}</em>
          </h1>
        </div>
        <p>
          {t("Different ambitions. The same steady approach.")}
          <br /> {t("Find a chit scheme that fits your life.")}
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
                  {t(statusLabels[group.status] ?? group.status)}
                </span>
              </div>
              <span className="scheme-code">{group.groupCode}</span>
              <h3>
                {group.groupName
                  .replace(/^(RAKVIH|ChitFund) /, "")
                  .replace(" Chit Scheme", "")}
                <span> / {t("CHIT SCHEME")}</span>
              </h3>
              <div className="scheme-value">
                {money(group.totalValue)}
                <span>{t("Total chit value")}</span>
              </div>
              <div className="scheme-details">
                <div>
                  <span>{t("Monthly contribution")}</span>
                  <strong>
                    {money(group.monthlyContribution)}
                    <small> / {t("month")}</small>
                  </strong>
                </div>
                <div>
                  <span>{t("Scheme duration")}</span>
                  <strong>
                    {group.durationMonths}
                    <small> {t("months")}</small>
                  </strong>
                </div>
              </div>
              <div className="availability">
                <span>
                  {t("{available} of {total} seats available", {
                    available: Math.max(0, group.totalMembers - group.currentMemberCount),
                    total: group.totalMembers,
                  })}
                </span>
                <span>{t("{percent}% foreman fee", { percent: group.foremanCommissionPercent })}</span>
              </div>
              <div className="scheme-extra-details">
                <span>{t("Max Limit / Person:")} <strong>{t("Max {count} Tickets", { count: max })}</strong></span>
                <span>{t("Enrolled Members:")} <strong>{t("{enrolled} / {total} Enrolled", { enrolled: group.currentMemberCount, total: group.totalMembers })}</strong></span>
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
                  {t("You hold {held} of {max} allowed tickets.", { held, max })}
                </p>
              )}
              <button
                className="scheme-button"
                disabled={disabled}
                onClick={() => enroll(group)}
              >
                {closed
                  ? t("Scheme closed")
                  : full
                    ? t("Fully subscribed")
                    : held >= max
                      ? t("Ticket limit reached")
                      : held
                        ? t("Add another ticket")
                        : customerUser
                          ? t("Enroll in This Scheme")
                          : t("Create Account to Enroll")}
              </button>
            </article>
          );
        })}
        <aside className="scheme-help" data-home-reveal="up">
          <span className="eyebrow">{t("MAKE AN INFORMED START")}</span>
          <h3>
            {t("Good decisions")}
            <br /> {t("start with")}
            <br /> <em>{t("clear numbers.")}</em>
          </h3>
          <p>
            {t("See how your contribution, auction discount, and potential payout come together.")}
          </p>
          <Link href="/calculator" className="text-link">
            {t("Try the calculator")}
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
          {t("New schemes are on their way. Explore the calculator while you wait.")}
        </p>
      )}
      <p className="section-footnote">
        {t("Review scheme terms, fees, and eligibility before enrolling. Contributions continue for the full scheme duration.")}
      </p>
      {message && (
        <div className="enrollment-message" role="status">
          <CheckCircle2 size={20} />
          <span>{t(message)}</span>
          <Link href="/portal">
            {t("View portal")} <ArrowRight size={15} />
          </Link>
          <button
            aria-label={t("Dismiss notification")}
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}
      {joining && (
        <JoinGroupDialog
          group={joining}
          onClose={() => setJoining(null)}
          onJoined={() => {
            setJoining(null);
            setMessage(msg("You’re enrolled and your signed agreement is saved. Your scheme is ready to view in your member portal."));
          }}
        />
      )}
    </section>
  );
}
