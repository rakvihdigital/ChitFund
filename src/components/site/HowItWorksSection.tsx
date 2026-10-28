"use client";

import { useReveal } from "@/lib/useReveal";
import { ClosingCta } from "@/components/site/ClosingCta";
import { msg, useT } from "@/lib/i18n";

const steps = [
  ["01", msg("Find your scheme"), msg("Choose a contribution and duration that feel right for your goals.")],
  ["02", msg("Make it a habit"), msg("Complete your profile, join your group, and contribute each month.")],
  ["03", msg("Move towards more"), msg("Participate in auctions and follow your contributions in your portal.")],
];

export function HowItWorksSection() {
  useReveal();
  const { t } = useT();
  return (
    <>
      <section id="how-it-works" className="how-section">
        <div className="site-container">
          <div className="section-heading" data-home-reveal="left">
            <div>
              <span className="eyebrow">{t("SIMPLE BY DESIGN")}</span>
              <h1 className="page-heading">
                {t("Your journey.")}
                <br />
                <em>{t("One step at a time.")}</em>
              </h1>
            </div>
            <p>
              {t("A familiar way to save.")}
              <br /> {t("A more considered digital experience.")}
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(([num, title, text]) => (
              <div key={num} data-home-reveal={num === "01" ? "left" : num === "03" ? "right" : "up"}>
                <span className="step-number">
                  {num}
                </span>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ClosingCta />
    </>
  );
}
