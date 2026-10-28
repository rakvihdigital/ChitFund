import type { Metadata } from "next";
import { SchemesSection } from "@/components/site/SchemesSection";

export const metadata: Metadata = {
  title: "Chit schemes",
  description: "Compare ChitFund chit schemes by chit value, monthly contribution and duration, and enroll online.",
};

export default function SchemesPage() {
  return <SchemesSection />;
}
