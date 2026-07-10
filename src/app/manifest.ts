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
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pulse.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard / Encounters",
        short_name: "Dashboard",
        description: "Go to your dashboard",
        url: "/",
        icons: [{ src: "/icons/shortcut-records.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Book Appointment",
        short_name: "Book",
        description: "Book a new appointment",
        url: "/patient/appointments/book",
        icons: [{ src: "/icons/shortcut-book.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Notifications",
        short_name: "Alerts",
        description: "Check your recent notifications",
        url: "/patient/notifications",
        icons: [{ src: "/icons/shortcut-alerts.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
