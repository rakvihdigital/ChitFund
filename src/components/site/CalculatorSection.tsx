"use client";

import { useReveal } from "@/lib/useReveal";
import { ChitCalculator } from "@/components/ChitCalculator";
import { ClosingCta } from "@/components/site/ClosingCta";
import { useT } from "@/lib/i18n";

export function CalculatorSection() {
  useReveal();
  const { t } = useT();
  return (
    <>
      <section id="calculator" className="site-container section-space">
        <div className="section-heading" data-home-reveal="down">
          <div>
            <span className="eyebrow">{t("A LITTLE CLARITY GOES A LONG WAY")}</span>
            <h1 className="page-heading">
              {t("Let’s put your plans")}
              <br />
              <em>{t("into perspective.")}</em>
            </h1>
          </div>
          <p>
            {t("Adjust the numbers. Understand the possibilities.")}
            <br /> {t("Start with a clearer picture.")}
          </p>
        </div>
        <ChitCalculator />
      </section>
      <ClosingCta />
    </>
  );
}
