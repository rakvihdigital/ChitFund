"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function ClosingCta() {
  const { customerUser, openAuthModal } = useApp();
  const { t } = useT();
  return (
    <section className="closing-section">
      <div className="site-container" data-home-reveal="up">
        <span className="eyebrow">{t("YOUR NEXT CHAPTER")}</span>
        <h2>
          {t("Your future deserves")}
          <br />
          <em>{t("a considered plan.")}</em>
        </h2>
        {customerUser ? (
          <Link className="button" href="/portal">
            {t("Go to your portal")}
          </Link>
        ) : (
          <button className="button" onClick={() => openAuthModal("signup")}>
            {t("Start your savings journey")}
          </button>
        )}
      </div>
    </section>
  );
}
