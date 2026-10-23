import type { Metadata } from "next";
import { AboutSection } from "@/components/site/AboutSection";

export const metadata: Metadata = {
  title: "About us",
  description: "RAKVIH Solutions: transparent, regulated digital chit funds under the Chit Funds Act, 1982.",
};

export default function AboutPage() {
  return <AboutSection />;
}
