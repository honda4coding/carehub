"use client";
import React from "react";
import VisitCard from "@/components/shared/VisitCard";

interface MedicalHistoryCardProps {
  record: any;
  hideHeader?: boolean;
}

export default function MedicalHistoryCard({ record, hideHeader = false }: MedicalHistoryCardProps) {
  // We now delegate rendering to the unified VisitCard component to maintain consistency across the app.
  return <VisitCard record={record} />;
}
