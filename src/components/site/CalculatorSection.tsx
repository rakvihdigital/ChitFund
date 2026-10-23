"use client";

import { useReveal } from "@/lib/useReveal";
import { ChitCalculator } from "@/components/ChitCalculator";
import { ClosingCta } from "@/components/site/ClosingCta";

export function CalculatorSection() {
  useReveal();
  return (
    <>
      <section id="calculator" className="site-container section-space">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</span>
            <h1 className="page-heading">
              Let’s put your plans
              <br />
              <em>into perspective.</em>
            </h1>
          </div>
          <p>
            Adjust the numbers. Understand the possibilities.
            <br /> Start with a clearer picture.
          </p>
        </div>
        <ChitCalculator />
      </section>
      <ClosingCta />
    </>
  );
}
