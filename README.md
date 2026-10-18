# Silicon Exchange (GPU & AI Accelerator Marketplace)

**Silicon Exchange** is a high-performance spot marketplace for renting idle GPUs and AI accelerators (NVIDIA H100 SXM5, RTX 5090, AMD MI300X, Apple M3 Ultra, RTX Pro 6000, etc.) by the hour. Renters can browse real-time accelerator telemetry, compare die microarchitectures, inspect deterministic 30-day utilization charts, and reserve spot compute blocks with instant validation.

Built as a front-end single-page application with Next.js App Router, TypeScript (strict mode), Tailwind CSS, Vitest, Zustand, and Recharts. All mock data is deterministic and requires zero backend or paid services.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** >= 18.18.0
- **npm** >= 9.0.0

### 2. Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Unit Tests
Run the Vitest test suite covering overlap detection, pricing math, hold expirations, and filter reducers:
```bash
npm test
```
Or run once without watch mode:
```bash
npm test -- --run
```

### 4. Production Build & Lint
```bash
# Verify ESLint rules
npm run lint

# Production Turbopack build
npm run build

# Start production server
npm run start
```

---

## 📐 Core Marketplace Rules

### 1. Pricing Math (`/src/lib/pricing.ts`)
- **15-Minute Round-Up**: Every booking is billed in 15-minute increments, always rounded up. E.g., 62 minutes rounds up to 75 minutes.
- **1-Hour Minimum**: The minimum billable block for any reservation is 1 hour (60 minutes).
- **Excess-Hours Discount**: Any reservation longer than 24 continuous hours receives a **10% discount applied only to the excess hours beyond the 24th hour**, rather than discounting the whole booking.
- **Integer Cents**: All calculations are computed in exact integer cents to eliminate floating-point rounding errors.

### 2. Overlap Detection (`/src/lib/reservations.ts`)
- **Half-Open Intervals `[start, end)`**: Consecutive reservations touching at their boundaries (e.g. an existing reservation ending at 14:00 and a new one starting at 14:00) do **not** overlap and are valid.
- **Status Filtering**: Cancelled reservations and expired holds do not block slots.
- **Maintenance Lock**: Nodes undergoing scheduled maintenance reject new bookings.

### 3. Hold Expirations
- Unconfirmed spot holds expire automatically at the **10-minute boundary** (600,000 ms) from creation time, freeing up the slot for other renters.

---

## 🛠 Tech Stack
- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Charts**: Recharts (with deterministic pseudo-random seed generator)
- **State**: Zustand (persisted compare drawer & reservation store)
- **Testing**: Vitest
