"use client";
import React from "react";
import VisitCard from "@/components/shared/VisitCard";

/* ─── TimelineAccordionCard ─── */
export default function TimelineAccordionCard({ record }: { record: any }) {
  // We now delegate rendering to the unified VisitCard component to maintain consistency across the app.
  return <VisitCard record={record} index={0} />;
}
