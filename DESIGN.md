---
version: 1.0.0
name: CareHub-Design-System
description: A hybrid design system combining the data density of Linear, the trusted professionalism of Stripe, and the clean aesthetics of Vercel/Apple. CareHub uses a teal/cyan and pink primary palette, tailored for a top-tier medical and SaaS platform.

colors:
  # Base Palette (Teal & Pink)
  primary: "#46BFE5"        # Main Brand Teal/Cyan
  primary-strong: "#2AA8D0" # Hover/Active
  primary-soft: "#EAF7FB"   # Backgrounds for active items
  
  secondary: "#F472B6"      # Main Brand Pink
  secondary-strong: "#E8529B"
  secondary-soft: "#FDF2F8"

  # Canvas & Surfaces (Vercel/Linear approach)
  canvas: "#FAFAFA"         # App Background
  surface: "#FFFFFF"        # Cards, Modals, Panels
  surface-hover: "#F3F4F6"
  surface-soft: "#F9FAFB"   # Secondary panels

  # Ink (Typography)
  ink: "#111827"            # Main text (Display/Headlines)
  ink-secondary: "#4B5563"  # Body text
  ink-muted: "#9CA3AF"      # Placeholders, minor details
  on-primary: "#FFFFFF"     # Text on primary buttons

  # Borders & Divides
  hairline: "#E5E7EB"
  hairline-strong: "#D1D5DB"
  focus-ring: "rgba(70, 191, 229, 0.4)" # Primary with opacity

  # Semantic (Dashboard Statuses)
  success: "#10B981"
  success-bg: "#D1FAE5"
  warning: "#F59E0B"
  warning-bg: "#FEF3C7"
  danger: "#EF4444"
  danger-bg: "#FEE2E2"
  info: "#3B82F6"
  info-bg: "#DBEAFE"

typography:
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
  # Linear-style negative tracking for large text
  display-xl: { fontSize: "48px", fontWeight: "700", letterSpacing: "-0.04em", lineHeight: "1.1" }
  display-lg: { fontSize: "36px", fontWeight: "700", letterSpacing: "-0.03em", lineHeight: "1.15" }
  display-md: { fontSize: "30px", fontWeight: "600", letterSpacing: "-0.02em", lineHeight: "1.2" }
  heading: { fontSize: "24px", fontWeight: "600", letterSpacing: "-0.01em", lineHeight: "1.3" }
  title: { fontSize: "20px", fontWeight: "600", letterSpacing: "0", lineHeight: "1.4" }
  body-lg: { fontSize: "16px", fontWeight: "400", letterSpacing: "0", lineHeight: "1.5" }
  body: { fontSize: "14px", fontWeight: "400", letterSpacing: "0", lineHeight: "1.5" }
  body-sm: { fontSize: "13px", fontWeight: "400", letterSpacing: "0", lineHeight: "1.5" }
  caption: { fontSize: "12px", fontWeight: "500", letterSpacing: "0.02em", lineHeight: "1.4" }

spacing:
  # 4px baseline grid
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-6: "24px"
  space-8: "32px"
  space-12: "48px"
  space-16: "64px"
  space-24: "96px"

radii:
  # Apple/Vercel smooth rounded corners
  sm: "6px"     # Badges, small inputs
  md: "10px"    # Buttons, inputs
  lg: "16px"    # Cards
  xl: "24px"    # Modals, large panels
  full: "9999px" # Pills, avatars

shadows:
  # Stripe-inspired crisp, multi-layered shadows
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)"
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)"

animations:
  # Snappy but smooth transitions
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)"
  normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)"
  slow: "350ms cubic-bezier(0.4, 0, 0.2, 1)"

components:
  Button:
    primary: "Solid background (primary), white text. Hover: shift up 1px, stronger background."
    secondary: "Soft background (secondary-soft), secondary text. Hover: stronger soft background."
    outline: "Transparent, 1px border (hairline-strong). Hover: border-primary, text-primary."
    ghost: "Transparent. Hover: surface-hover background."
  Card:
    base: "Surface background, lg radius, hairline border, sm shadow."
    hover: "Transition to md shadow, shift up 1px."
  Input:
    base: "Surface background, md radius, hairline border. Focus: primary border + focus-ring shadow."
---
