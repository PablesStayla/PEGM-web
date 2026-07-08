# PranaKaia Web Storefront

The primary e-commerce frontend for PranaKaia, built with **Next.js 15 App Router** and **React 19**.

## Features

- 🛍️ **Full E-Commerce Flow**: Catalog, Cart, Checkout.
- 🎨 **Modern UI**: Styled with Tailwind CSS and Radix UI.
- ⚡ **Performance**: Static Generation (SSG) + Server Components (RSC).
- 🔍 **SEO**: Optimized meta tags and structured data.
- 📱 **Responsive**: Mobile-first design.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **State**: Zustand, TanStack Query
- **API**: tRPC (Client)
- **Auth**: NextAuth.js (via `@pranakaia/next-auth-helpers`)

## Getting Started

1.  **Install dependencies**:

    ```bash
    pnpm install
    ```

2.  **Run development server**:

    ```bash
    pnpm dev
    ```

3.  **Open**: [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/`: App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Utilities and generic logic.
- `styles/`: Global styles and Tailwind configuration.
