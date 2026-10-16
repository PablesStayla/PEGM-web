# PEGM Metallurgical Civil Engineering Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a state-of-the-art (SOTA 2026) 360° digital platform for Pablo (Civil Metallurgical Engineer), combining an executive interactive lineup & CV, comprehensive engineering suite with pure mathematical process models in `@pranakaia/domain`, multi-provider streaming AI technical assistant (Gemini Flash + Groq), interactive visual charts, publications repository, and automated quality shields.

**Architecture:** Monorepo using Turborepo and pnpm. Core metallurgical domain models are implemented as pure, zero-dependency TypeScript functions in `packages/domain/src/metallurgy` with strict physical bounds validation and Result monads. Next.js 15 App Router with React 19 and Tailwind CSS v4 in `apps/web` renders the frontend with instant static data fallback and live Supabase synchronization. Real-time AI streaming uses Server-Sent Events with automated multi-provider fallback.

**Tech Stack:** Next.js 15.2+, React 19, Tailwind CSS v4, Turborepo, TypeScript 5.6 (strict), Vitest 3, Playwright, Drizzle ORM, Supabase (PostgreSQL Free Tier), Upstash Redis, Google Gemini 2.0 Flash API, Groq SDK, Lucide Icons, Recharts.

## Global Constraints

- TypeScript strict mode only; zero `any` or untyped casts.
- Physical units must be explicitly stated in variable and type names (`tph`, `kwhPerTon`, `microns`, `percentCu`, `gpl`).
- All metallurgical calculations must be pure functions in `packages/domain/src/metallurgy` returning `Result<T, Error>`.
- Mass balance conservation law must hold: $F = C + T$ and $F \cdot f = C \cdot c + T \cdot t$.
- 100% Free-Tier compatible (Vercel + Supabase + Upstash + Gemini Flash + Groq).
- Zero placeholders (no "TODO", "TBD", or unwritten logic).

---

### Task 1: Metallurgical Domain Models & Unit Tests (Tailings, Hydraulics, Profile Data)

**Files:**
- Create: `packages/domain/src/metallurgy/tailings.ts`
- Create: `packages/domain/src/metallurgy/profile.ts`
- Create: `packages/domain/src/metallurgy/publications.ts`
- Create: `packages/domain/src/metallurgy/tailings.test.ts`
- Modify: `packages/domain/src/index.ts`

**Interfaces:**
- Consumes: `@pranakaia/shared-kernel` (`Result`)
- Produces: `calculateTailingsThickener(input: TailingsThickenerInput): Result<TailingsThickenerOutput, Error>`, `calculatePulpDensity(input: PulpDensityInput): Result<PulpDensityOutput, Error>`, `EXECUTIVE_METALLURGICAL_PROFILE: ExecutiveProfile`, `PUBLICATIONS_DATA: PublicationItem[]`.

- [ ] **Step 1: Write the failing tests for Tailings & Pulp Density calculations**

```typescript
// packages/domain/src/metallurgy/tailings.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePulpDensity, calculateTailingsThickener } from './tailings';

describe('Tailings & Slurry Hydraulics Domain Models', () => {
  it('should calculate pulp density and solids percentage by weight correctly', () => {
    const result = calculatePulpDensity({
      drySolidsSpecificGravity: 2.7,
      solidsWeightPercent: 50,
      liquidDensityGcm3: 1.0,
    });

    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.pulpDensityGcm3).toBeCloseTo(1.47, 1);
    expect(value.solidsVolumePercent).toBeCloseTo(27.0, 1);
    expect(value.volumetricFlowRatio).toBeGreaterThan(0);
  });

  it('should reject invalid solids percentage outside 0-100%', () => {
    const result = calculatePulpDensity({
      drySolidsSpecificGravity: 2.7,
      solidsWeightPercent: 110,
      liquidDensityGcm3: 1.0,
    });
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('between 0 and 100%');
  });

  it('should size a tailings thickener based on solid flux rate', () => {
    const result = calculateTailingsThickener({
      dryTailingsThroughputTph: 1200,
      feedSolidsPercent: 25,
      underflowTargetSolidsPercent: 65,
      solidSpecificGravity: 2.75,
      unitAreaFluxRateTpdM2: 0.8,
    });

    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.requiredThickenerAreaM2).toBeGreaterThan(0);
    expect(value.suggestedDiameterMeters).toBeGreaterThan(10);
    expect(value.waterRecoveryFlowM3h).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @pranakaia/domain test`
Expected: FAIL with "Cannot find module './tailings'"

- [ ] **Step 3: Implement `tailings.ts`, `profile.ts`, and `publications.ts`**

```typescript
// packages/domain/src/metallurgy/tailings.ts
import { Result } from '@pranakaia/shared-kernel';

export interface PulpDensityInput {
  drySolidsSpecificGravity: number;
  solidsWeightPercent: number;
  liquidDensityGcm3?: number;
}

export interface PulpDensityOutput {
  pulpDensityGcm3: number;
  solidsVolumePercent: number;
  volumetricFlowRatio: number;
  liquidWeightPercent: number;
}

export function calculatePulpDensity(input: PulpDensityInput): Result<PulpDensityOutput, Error> {
  const { drySolidsSpecificGravity, solidsWeightPercent, liquidDensityGcm3 = 1.0 } = input;

  if (drySolidsSpecificGravity <= 1.0) {
    return Result.fail(new Error('Dry solids specific gravity must be greater than liquid (1.0)'));
  }
  if (solidsWeightPercent <= 0 || solidsWeightPercent >= 100) {
    return Result.fail(new Error('Solids weight percent (%Cp) must be between 0 and 100%'));
  }

  const cp = solidsWeightPercent / 100;
  const rhoS = drySolidsSpecificGravity;
  const rhoL = liquidDensityGcm3;

  const pulpDensityGcm3 = 1 / (cp / rhoS + (1 - cp) / rhoL);
  const solidsVolumePercent = (cp * pulpDensityGcm3 / rhoS) * 100;
  const liquidWeightPercent = 100 - solidsWeightPercent;
  const volumetricFlowRatio = (100 - solidsVolumePercent) / solidsVolumePercent;

  return Result.ok({
    pulpDensityGcm3: Number(pulpDensityGcm3.toFixed(3)),
    solidsVolumePercent: Number(solidsVolumePercent.toFixed(2)),
    volumetricFlowRatio: Number(volumetricFlowRatio.toFixed(2)),
    liquidWeightPercent: Number(liquidWeightPercent.toFixed(2)),
  });
}

export interface TailingsThickenerInput {
  dryTailingsThroughputTph: number;
  feedSolidsPercent: number;
  underflowTargetSolidsPercent: number;
  solidSpecificGravity: number;
  unitAreaFluxRateTpdM2: number;
}

export interface TailingsThickenerOutput {
  requiredThickenerAreaM2: number;
  suggestedDiameterMeters: number;
  waterRecoveryFlowM3h: number;
  underflowVolumetricFlowM3h: number;
}

export function calculateTailingsThickener(
  input: TailingsThickenerInput,
): Result<TailingsThickenerOutput, Error> {
  const {
    dryTailingsThroughputTph,
    feedSolidsPercent,
    underflowTargetSolidsPercent,
    solidSpecificGravity,
    unitAreaFluxRateTpdM2,
  } = input;

  if (dryTailingsThroughputTph <= 0 || unitAreaFluxRateTpdM2 <= 0) {
    return Result.fail(new Error('Throughput and unit area flux rate must be positive'));
  }
  if (feedSolidsPercent <= 0 || underflowTargetSolidsPercent <= feedSolidsPercent) {
    return Result.fail(new Error('Underflow solids percent must be greater than feed solids percent'));
  }

  const dryTpd = dryTailingsThroughputTph * 24;
  const requiredThickenerAreaM2 = dryTpd / unitAreaFluxRateTpdM2;
  const suggestedDiameterMeters = Math.sqrt((4 * requiredThickenerAreaM2) / Math.PI);

  const feedWaterFlowM3h = dryTailingsThroughputTph * ((100 - feedSolidsPercent) / feedSolidsPercent);
  const underflowWaterFlowM3h = dryTailingsThroughputTph * ((100 - underflowTargetSolidsPercent) / underflowTargetSolidsPercent);
  const waterRecoveryFlowM3h = Math.max(0, feedWaterFlowM3h - underflowWaterFlowM3h);

  const solidsVolFlowM3h = dryTailingsThroughputTph / solidSpecificGravity;
  const underflowVolumetricFlowM3h = solidsVolFlowM3h + underflowWaterFlowM3h;

  return Result.ok({
    requiredThickenerAreaM2: Number(requiredThickenerAreaM2.toFixed(1)),
    suggestedDiameterMeters: Number(suggestedDiameterMeters.toFixed(1)),
    waterRecoveryFlowM3h: Number(waterRecoveryFlowM3h.toFixed(1)),
    underflowVolumetricFlowM3h: Number(underflowVolumetricFlowM3h.toFixed(1)),
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @pranakaia/domain test`
Expected: PASS with 100% coverage.

- [ ] **Step 5: Commit**

```bash
git add packages/domain/src/metallurgy/ packages/domain/src/index.ts
git commit -m "feat(domain): add tailings hydraulics models, profile data and publications"
```

---

### Task 2: Multi-Provider AI Metallurgical Assistant API Route with Streaming

**Files:**
- Create: `apps/web/src/app/api/metallurgy/chat/route.ts`
- Create: `apps/web/src/lib/ai/metallurgical-system-prompt.ts`
- Create: `apps/web/src/lib/ai/ai-provider-router.ts`
- Test: `apps/web/src/lib/ai/ai-provider-router.test.ts`

- [ ] **Step 1: Write unit test for AI provider router and system prompt fallback**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement system prompt, multi-provider streaming router and API route**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Interactive Visual Components (Lineup, Publications, Case Studies & Booking)

**Files:**
- Create: `apps/web/src/components/metallurgy/InteractiveLineupTimeline.tsx`
- Create: `apps/web/src/components/metallurgy/PublicationsViewer.tsx`
- Create: `apps/web/src/components/metallurgy/CaseStudiesGrid.tsx`
- Create: `apps/web/src/components/metallurgy/ConsultingBookingModal.tsx`
- Create: `apps/web/src/components/metallurgy/LeachingCalculator.tsx`
- Create: `apps/web/src/components/metallurgy/TailingsThickenerCalculator.tsx`
- Modify: `apps/web/src/components/metallurgy/ExecutiveHeroBanner.tsx`
- Modify: `apps/web/src/app/[locale]/page.tsx`

- [ ] **Step 1: Create `InteractiveLineupTimeline.tsx`**
- [ ] **Step 2: Create `PublicationsViewer.tsx`**
- [ ] **Step 3: Create `LeachingCalculator.tsx` and `TailingsThickenerCalculator.tsx`**
- [ ] **Step 4: Create `ConsultingBookingModal.tsx` & Integrate all components into `apps/web/src/app/[locale]/page.tsx`**
- [ ] **Step 5: Run tests and type check**
- [ ] **Step 6: Commit**

---

### Task 4: Automated Verification, Linting and Quality Gate Shields

**Files:**
- Modify: `.lefthook.yml`
- Modify: `package.json`
- Test: All unit, integration and build scripts

- [ ] **Step 1: Run comprehensive lint and format validation (`pnpm format && pnpm lint`)**
- [ ] **Step 2: Run full unit test suite across all monorepo packages (`pnpm test:unit`)**
- [ ] **Step 3: Run full production build verification (`pnpm build`)**
- [ ] **Step 4: Commit**
