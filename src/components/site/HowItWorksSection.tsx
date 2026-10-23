"use client";

import { useReveal } from "@/lib/useReveal";
import { ClosingCta } from "@/components/site/ClosingCta";

const steps = [
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
];

export function HowItWorksSection() {
  useReveal();
  return (
    <>
      <section id="how-it-works" className="how-section">
        <div className="site-container">
          <div className="section-heading" data-home-reveal="left">
            <div>
              <span className="eyebrow">SIMPLE BY DESIGN</span>
              <h1 className="page-heading">
                Your journey.
                <br />
                <em>One step at a time.</em>
              </h1>
            </div>
            <p>
              A familiar way to save.
              <br /> A more considered digital experience.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(([num, title, text]) => (
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
      <ClosingCta />
    </>
  );
}
