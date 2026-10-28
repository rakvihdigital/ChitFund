import type { Metadata } from "next";
import { HowItWorksSection } from "@/components/site/HowItWorksSection";

export const metadata: Metadata = {
  title: "How it works",
  description: "How a ChitFund digital chit fund works: choose a scheme, contribute monthly and take part in auctions.",
};

export default function HowItWorksPage() {
  return <HowItWorksSection />;
}
