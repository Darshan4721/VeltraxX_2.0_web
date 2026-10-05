import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MarqueeRibbon from './components/MarqueeRibbon';
import ChallengeSection from './components/ChallengeSection';
import RulesBento from './components/RulesBento';
import TimelineSection from './components/TimelineSection';
import PrizeSection from './components/PrizeSection';
import FaqSection from './components/FaqSection';
import ClosingCta from './components/ClosingCta';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-[#111116] selection:bg-[#FFE500] selection:text-[#111116] overflow-x-clip">
      {/* Pinned Optical Glass Navigation */}
      <Navbar />
      
      <main className="flex-1">
        {/* CHAPTER 1: Hero Stage with 2.5D Spatial Atropos Engine & Typographic Weave */}
        <HeroSection />

        {/* Tilted High-Contrast Marquee Ribbons (Reference 2 Signature Motif) */}
        <MarqueeRibbon />

        {/* CHAPTER 2: High-Contrast Black Band — Problem Statement Architecture & 3D Chip Breakout */}
        <ChallengeSection />

        {/* CHAPTER 3: Asymmetric Vivid Bento Grid — BYOD, Team Cap & AI Governance */}
        <RulesBento />

        {/* CHAPTER 4: 24-Hour Precision Timeline with Live Status Badges */}
        <TimelineSection />

        {/* CHAPTER 5: 3D Championship Spotlight — Direct VLSI Internship & Synopsys Access */}
        <PrizeSection />

        {/* CHAPTER 6: Interactive FAQ Accordion & Direct Organizing Committee Helpdesk */}
        <FaqSection />

        {/* CHAPTER 7: High-Voltage Conversion Anchor & Strict Capacity Gate */}
        <ClosingCta />
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
