import React from 'react';
import LiveArenaBanner from '../components/LiveArenaBanner';
import HeroSection from '../components/HeroSection';
import MarqueeRibbon from '../components/MarqueeRibbon';
import TwoStagePipeline from '../components/TwoStagePipeline';
import TracksAndVaultSection from '../components/TracksAndVaultSection';
import RulesBento from '../components/RulesBento';
import DownloadVault from '../components/DownloadVault';
import TimelineSection from '../components/TimelineSection';
import PrizeSection from '../components/PrizeSection';
import FaqSection from '../components/FaqSection';
import ClosingCta from '../components/ClosingCta';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      {/* 0. Live 24H Arena Banner (Mounts dynamically if event is live or announced) */}
      <LiveArenaBanner />

      <main className="flex-1">
        {/* Chapter 00: Hero Stage with 2.5D Atropos Silicon Cutout & Round 1 Close Countdown */}
        <HeroSection />

        {/* Tilted High-Contrast Marquee Ribbons */}
        <MarqueeRibbon />

        {/* Chapter 01: The Two-Stage Gauntlet (Free PPT Pitch -> Shortlist -> 24H Live Twist) */}
        <TwoStagePipeline />

        {/* Chapter 02: 5 Problem Tracks Bento & Embedded Download Vault */}
        <TracksAndVaultSection />

        {/* Chapter 03: Arena Governance, Shortlisting Criteria & 50/50 Live Twist Rules */}
        <RulesBento />

        {/* Official Asset Vault (PDF Problem Book, PPTX Template & Rulebook) */}
        <DownloadVault />

        {/* Chapter 04: Dual-Mode Interactive Timeline (Master Roadmap + 24H Finale Schedule) */}
        <TimelineSection />

        {/* Chapter 05: Prize Architecture, Trophies & Industry Mentorship Spotlight */}
        <PrizeSection />

        {/* Chapter 06: Frequently Answered Questions & Direct Coordinator Helpdesk */}
        <FaqSection />

        {/* Chapter 07: High-Voltage Free Registration Conversion Anchor */}
        <ClosingCta />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </>
  );
}
