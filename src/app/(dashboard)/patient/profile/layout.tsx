"use client";

import { PatientProfileProvider } from "@/context/PatientProfileContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientProfileProvider>
        
      {children}
    </PatientProfileProvider>
  );
}