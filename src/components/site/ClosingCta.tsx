"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

export function ClosingCta() {
  const { customerUser, openAuthModal } = useApp();
  return (
    <section className="closing-section">
      <div className="site-container" data-home-reveal="up">
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h2>
          Your future deserves
          <br />
          <em>a considered plan.</em>
        </h2>
        {customerUser ? (
          <Link className="button" href="/portal">
            Go to your portal
          </Link>
        ) : (
          <button className="button" onClick={() => openAuthModal("signup")}>
            Start your savings journey
          </button>
        )}
      </div>
    </section>
  );
}
