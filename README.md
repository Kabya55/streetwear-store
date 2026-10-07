# 👟 MIRALOU Streetwear Store — Frontend

Modern, high-performance, dark-aesthetic e-commerce frontend for **MIRALOU Streetwear Store**. Built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom brutalist & dark luxury palette: `#121212`, `#E50914`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API (`CartContext`) with `localStorage` persistence
- **HTTP Client**: Fetch API with Next.js caching & SSR/SSG support

---

## ✨ Features

- **Brutalist / Dark Luxury Aesthetic**: Tailored dark theme with smooth micro-interactions and high-end visual design.
- **Hero & Interactive Elements**: Dynamic particles canvas (`AntigravityParticles`), brand story manifesto, and curated product showcase.
- **Product Catalog**:
  - Filter by category, sorting by price, release date, and availability.
  - Dedicated product detail pages (`/products/[id]`) with size selectors and image galleries.
- **Cart & State Management**:
  - Global shopping bag context.
  - Persistent state in browser `localStorage`.
  - Real-time quantity adjustments and cart count badge in navbar.
- **Checkout & Payment**:
  - Delivery details form with Bangladesh district/city support.
  - Seamless redirection to SSLCommerz payment gateway.
  - Dedicated payment success (`/payment/success`) and failure (`/payment/fail`) callback pages.
- **Authentication & Admin**:
  - Sign in (`/login`) and Sign up (`/register`) interfaces.
  - Admin dashboard (`/admin`) for product management, orders, and sales analytics.

---

## 📁 Folder Structure

```text
streetwear_store/
├── public/                 # Static assets and images
├── src/
│   ├── app/                # Next.js 14 App Router pages & layouts
│   │   ├── layout.tsx      # Root layout with CartProvider and Navbar/Footer
│   │   ├── page.tsx        # Homepage
│   │   ├── globals.css     # Global styles & custom scrollbars
│   │   ├── products/       # Products listing & details [id]
│   │   ├── cart/           # Shopping cart bag
│   │   ├── checkout/       # Checkout & delivery form
│   │   ├── payment/        # Payment success & fail pages
│   │   ├── login/          # User & Admin login
│   │   ├── register/       # User registration
│   │   ├── about/          # Brand story page
│   │   ├── admin/          # Admin portal & dashboard
│   │   └── not-found.tsx   # Custom 404 page
│   ├── components/         # Reusable React components
│   │   ├── home/           # Homepage-specific sections (Hero, Particles, etc.)
│   │   ├── Navbar.tsx      # Sticky header with cart drawer & search
│   │   ├── Footer.tsx      # Branded footer with links & newsletter
│   │   └── ProductCard.tsx # Reusable sneaker display card
│   └── context/            # React context providers (CartContext)
├── .env.example            # Example environment configuration
├── .env.local              # Local environment variables (gitignored)
├── .gitignore              # Git ignore rules
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies & scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS theme configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js** (v18.17+ or v20+) installed.

### 2. Environment Setup

Create a `.env.local` file in this directory based on `.env.example`:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Make sure the backend server (`streetwear_store-backend`) is running on `http://localhost:5000`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3000 |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the Next.js server in production mode |
| `npm run lint` | Runs ESLint to check for code issues |

---

## 🛡️ Security

Sensitive configuration files (`.env`, `.env.local`, `.env*.local`) and build artifacts (`.next`, `node_modules`) are configured in `.gitignore` to prevent confidential credentials from being committed to source control.
