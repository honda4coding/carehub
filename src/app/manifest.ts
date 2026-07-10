import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareHub App",
    short_name: "CareHub",
    description: "A comprehensive hospital management system and patient portal",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0891B2",
    icons: [
      {
        src: "/icons/pulse.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/pulse.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard / Encounters",
        short_name: "Dashboard",
        description: "Go to your dashboard",
        url: "/",
        icons: [{ src: "/icons/shortcut-records.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name: "Book Appointment",
        short_name: "Book",
        description: "Book a new appointment",
        url: "/patient/appointments/book",
        icons: [{ src: "/icons/shortcut-book.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
      {
        name: "Notifications",
        short_name: "Alerts",
        description: "Check your recent notifications",
        url: "/patient/notifications",
        icons: [{ src: "/icons/shortcut-alerts.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
    ],
  };
}
