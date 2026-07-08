import type { Metadata } from 'next';
import { Commitments } from '@/components/about/commitments';
import { HeroSection } from '@/components/about/hero-section';
import { ImpactStats } from '@/components/about/impact-stats';
import { JoinCommunity } from '@/components/about/join-community';
import { MissionVision } from '@/components/about/mission-vision';
import { OurStory } from '@/components/about/our-story';
import { ValuesSection } from '@/components/about/values-section';

export const metadata: Metadata = {
  title: 'Sobre PranaKaia | Elite Grow Shop Concepción 2026',
  description:
    'Lanzamiento 2026. Conoce la misión de PranaKaia: elevar el estándar del cultivo indoor en Concepción y todo Chile con tecnología de vanguardia y genética de élite.',
  keywords: [
    'sobre nosotros',
    'lanzamiento 2026',
    'quiénes somos',
    'Prana Kaia Grow',
    'Grow Shop Concepción',
    'Biobío',
    'Concepción',
    'cultura cannábica',
    'bienestar',
    'cultivo responsable',
    'Chile',
  ],
  openGraph: {
    title: 'Sobre Nosotros | Prana Kaia Grow',
    description:
      'Creemos en el poder de la naturaleza y en el valor de la cultura cannábica como camino hacia el bienestar, la innovación y la responsabilidad.',
    images: [
      {
        url: '/og/about-pranakaia-grow.jpg',
        width: 1200,
        height: 630,
        alt: 'PranaKaia Grow - About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PranaKaia Grow - Premium Cannabis Cultivation Solutions',
    description:
      'Leading the evolution of conscious cannabis cultivation with premium, sustainable solutions.',
  },
};

export default function AboutPage() {
  return (
    <main data-testid="about-content" className="min-h-screen">
      {/* Hero Section - Emotional Connection */}
      <HeroSection />

      {/* Our Story - Narrative Arc */}
      <OurStory />

      {/* Mission & Vision - Purpose */}
      <MissionVision />

      {/* Core Values - Identity */}
      <ValuesSection />

      {/* Impact Statistics - Credibility */}
      <ImpactStats />

      {/* Commitments & Certifications - Trust */}
      <Commitments />

      {/* Join Our Community - Call to Action */}
      <JoinCommunity />
    </main>
  );
}
