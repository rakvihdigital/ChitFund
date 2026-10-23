import type { Metadata } from "next";
import { CalculatorSection } from "@/components/site/CalculatorSection";

export const metadata: Metadata = {
  title: "Savings calculator",
  description: "Estimate your chit fund contributions, auction discount, dividends and payout.",
};

export default function CalculatorPage() {
  return <CalculatorSection />;
}
