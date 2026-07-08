---
applyTo: "apps/web/**/*"
---

# 🌐 Web Application Instructions (Next.js 15)

## 1. Server Components First
- Default to React Server Components (RSC).
- Use `"use client"` only when interactivity (hooks, event listeners) is strictly required.

## 2. Data Fetching
- Use Server Actions for mutations.
- Fetch data directly in Server Components using `async/await`.

## 3. UI System
- Use components from `@pranakaia/ui`.
- Adhere to the Platinum Design System: Vibrant colors, glassmorphism, and smooth animations.

## 4. Error Boundaries
- Implement localized error boundaries to prevent full-page crashes.
- Use the `error.tsx` convention of Next.js.
