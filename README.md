<div align="center">
  <h1>🏥 CareHub — Patient Portal</h1>
  <p><strong>A full-featured healthcare management platform connecting patients, doctors, and medical staff.</strong></p>
  <a href="https://carehub-two.vercel.app">🌐 Live Demo</a> ·
  <a href="https://github.com/Dalia1199/hospital_managment_backend">Backend Repository</a>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [User Roles & Dashboards](#user-roles--dashboards)
- [Features by Role](#features-by-role)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

**CareHub** is a comprehensive healthcare web application built with Next.js. It provides dedicated dashboards for four user roles: **Patient**, **Doctor**, **Assistant**, and **Admin**. The platform supports appointment booking, live consultation queue management via OTP, full medical history tracking, AI-powered clinical assistance, digital prescriptions, wallet-based payments, and printable medical records.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Forms & Validation | Formik + Yup |
| Charts | Chart.js, Recharts, react-chartjs-2 |
| Icons | Lucide React, React Icons |
| Date Handling | date-fns, Day.js, react-day-picker |
| HTTP Client | Axios + js-cookie |
| Dark Mode | next-themes |
| PWA | Serwist (Service Worker + Offline support) |
| Authentication | JWT (via cookie) + SimpleWebAuthn (Passkey/Biometric) |
| Notifications | Web Push (via Service Worker) |
| AI Chat | React Markdown renderer |

---

## User Roles & Dashboards

| Role | Base Route | Description |
|---|---|---|
| 🧑‍⚕️ **Patient** | `/patient` | View records, book appointments, track health |
| 👨‍⚕️ **Doctor** | `/doctor` | Manage queue, run encounters, write prescriptions |
| 🩺 **Assistant** | `/assistant` | Support doctor workflow, manage vitals & billing |
| 🔐 **Admin** | `/admin` | Platform administration, finance, user management |

---

## Features by Role

### 🧑‍⚕️ Patient

| Feature | Route |
|---|---|
| Dashboard (Profile Overview, Medical Alerts, Recent Timeline) | `/patient` |
| Medical History (timeline view of all visits) | `/patient/history` |
| Appointments (book, view, cancel, reschedule) | `/patient/appointments` |
| Doctor Directory (search & filter doctors) | `/patient/doctors` |
| Personal Health Tracking (vitals, charts) | `/patient/tracking` |
| Medication Tracking (active meds, doses, schedules) | `/patient/tracking/medications` |
| Wallet (balance, transactions, top-up) | `/patient/wallet` |
| Notifications | `/patient/notifications` |
| Profile & Settings | `/patient/profile` |
| Security (Passkey / Biometric Login) | `/patient/security` |
| Print Medical Record (select & print encounters as PDF) | `/patient/record/print` |
| AI Chat Widget (floating assistant on all pages) | Global |

---

### 👨‍⚕️ Doctor

| Feature | Route |
|---|---|
| Dashboard (Live Queue, OTP Verification, Stats) | `/doctor` |
| Clinical Encounter (start session, record vitals, diagnosis, prescriptions, attachments) | `/doctor/encounter/:sessionId` |
| Patient Medical History | `/doctor/history` / `/doctor/history/:id` |
| My Patients List | `/doctor/patients` |
| Prescriptions Management | `/doctor/prescriptions` |
| Appointments (today, upcoming, completed) | `/doctor/appointments` |
| Clinics (add/edit/delete clinics & services) | `/doctor/clinics` |
| Staff Management (create assistants, manage permissions) | `/doctor/staff` |
| AI Knowledge Base (upload PDFs, manage databases) | `/doctor/knowledge-base` |
| Reports & Analytics | `/doctor/reports` |
| Wallet & Earnings | `/doctor/wallet` / `/doctor/earnings` |
| Billing | `/doctor/billing` |
| Subscription Plan | `/doctor/settings` |
| Profile | `/doctor/profile` |
| Notifications | `/doctor/notifications` |
| Security (Passkey) | `/doctor/security` |

---

### 🩺 Assistant

| Feature | Route |
|---|---|
| Dashboard (Queue view, patient management) | `/assistant` |
| Appointments | `/assistant/appointments` |
| Patient Assessment (vitals entry) | `/assistant/assessment` |
| Clinical Encounter | `/assistant/encounter/:sessionId` |
| Patient Medical History | `/assistant/history` |
| Clinics Management | `/assistant/clinics` |
| Billing | `/assistant/billing` |
| Reports | `/assistant/reports` |
| Vitals Tracking | `/assistant/vitals` |

---

### 🔐 Admin

| Feature | Route |
|---|---|
| Dashboard (platform stats, charts) | `/admin` |
| User Management (patients & doctors) | `/admin/users` |
| Doctor Approvals (approve/reject new doctors) | `/admin/approvals` |
| Doctor Management (license review) | `/admin/doctors` |
| Finance (wallet stats, revenue, payment analytics) | `/admin/finance` |
| Payouts Management (approve/reject payout requests) | `/admin/payouts` |
| Payments History | `/admin/payments` |
| Support Messages | `/admin/support-messages` |
| Notifications | `/admin/notifications` |
| Profile | `/admin/profile` |
| Security | `/admin/security` |

---

## Auth Pages

| Page | Route |
|---|---|
| Login | `/login` |
| Register (Patient / Doctor) | `/register` |
| OTP Verification | `/verify-otp` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password` |
| Admin Login | `/admin-login` |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/            # Login, Register, OTP, Reset Password
│   ├── (dashboard)/
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── assistant/     # Assistant dashboard pages
│   │   ├── doctor/        # Doctor dashboard pages
│   │   └── patient/       # Patient dashboard pages
│   ├── doctors/           # Public doctor listing page
│   ├── about/
│   ├── payments/
│   ├── support/
│   └── layout.tsx
├── components/
│   ├── admin/             # Admin-specific components
│   ├── appointments/      # Shared appointment components
│   ├── auth/              # Login/Register forms
│   ├── doctor/            # Doctor-specific components
│   ├── global/            # Sidebar, Topbar, DashboardShell, Footer
│   ├── landing/           # Landing page sections
│   ├── modals/            # Global modal components
│   ├── patient/           # Patient-specific components
│   ├── patients/          # Patient-view components (used from doctor side)
│   ├── shared/            # VisitCard, TimelineAccordionCard, DocumentModal
│   ├── settings/          # Settings-related components
│   └── ui/                # Generic UI primitives
├── context/               # AuthContext, ThemeContext
├── constants/             # Auth cookie name, enums
├── hooks/                 # Custom React hooks
├── lib/                   # API helpers, fetchClient
└── types/                 # TypeScript type definitions
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (see [backend repo](https://github.com/Dalia1199/hospital_managment_backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/honda4coding/carehub.git
cd carehub

# Install dependencies
npm install

# Start the development server (runs on port 3001)
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, replace with the deployed backend URL.

---

## PWA Support

CareHub is a Progressive Web App (PWA). It can be installed on mobile and desktop devices and works offline for previously visited pages, powered by **Serwist** (a modern Service Worker library).

---

## License

This project is private and not open for public distribution.