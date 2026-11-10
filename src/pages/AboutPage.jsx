// src/pages/AboutPage.jsx
// Clean Master Orchestrator for VELTRAXX 2.0 Department Magazine & History Page
// Decomposed into 11 modular components under src/components/about/
// Strict Semantic HTML (<div> wrapper, single <Footer /> at bottom)

import React, { useState } from 'react';
import SeoHead from '../components/common/SeoHead';
import AboutHero from '../components/about/AboutHero';
import AboutMarqueeStats from '../components/about/AboutMarqueeStats';
import AboutLeadership from '../components/about/AboutLeadership';
import AboutWorkshops from '../components/about/AboutWorkshops';
import AboutSiliconResearch from '../components/about/AboutSiliconResearch';
import AboutCompetitions from '../components/about/AboutCompetitions';
import AboutNationalExposure from '../components/about/AboutNationalExposure';
import AboutHonours from '../components/about/AboutHonours';
import AboutBeyondSilicon from '../components/about/AboutBeyondSilicon';
import AboutMagazineVault from '../components/about/AboutMagazineVault';
import AboutClosingCta from '../components/about/AboutClosingCta';
import AboutLightbox from '../components/about/AboutLightbox';
import Footer from '../components/Footer';

export default function AboutPage() {
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    activeIndex: 0,
  });

  const openLightbox = (index = 0) => {
    setLightboxState({ isOpen: true, activeIndex: index });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, activeIndex: 0 });
  };

  return (
    <div className="flex-1 flex flex-col w-full overflow-x-hidden bg-[#FAF8F5] text-[#111116]">
      {/* Dynamic SEO Head Management */}
      <SeoHead route="/about" />

      {/* S1: Asymmetric Hero Stage & 2.5D Magazine Cover Portal */}
      <AboutHero onOpenGallery={openLightbox} />

      {/* S2: Dual Intersecting Tilted Marquees & Departmental Key Metrics */}
      <AboutMarqueeStats />

      {/* S3: Institutional Vision & 5-Stage VLSI Innovation Model (Obsidian Chassis) */}
      <AboutLeadership />

      {/* S4: MeitY C2S EDA Labs & 7 Commercial Workshops Interactive Rail */}
      <AboutWorkshops />

      {/* S5: 17 Undergraduate Silicon Research Architectures Bento */}
      <AboutSiliconResearch />

      {/* S6: Flagship Competitive Arenas (VELTRAXX '26 & The Lost Silicon) */}
      <AboutCompetitions />

      {/* S7: National Delegations & Conclaves Rail */}
      <AboutNationalExposure onOpenGallery={openLightbox} />

      {/* S8: Fellowships (Samsung India), Startups (InterviewBot) & NPTEL Elite (Obsidian Chassis) */}
      <AboutHonours />

      {/* S9: Holistic Excellence Beyond Silicon (Sports, NCC, Cultural & Clubs) */}
      <AboutBeyondSilicon />

      {/* S10: Departmental Magazine Vault, 51-Page PDF & Builder Voices */}
      <AboutMagazineVault onOpenGallery={openLightbox} />

      {/* S11: High-Voltage Inquiries & Admissions Conversion Anchor (Obsidian Chassis) */}
      <AboutClosingCta />

      {/* Accessible Lightbox Modal */}
      {lightboxState.isOpen && (
        <AboutLightbox
          activeIndex={lightboxState.activeIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Universal Institutional Footer */}
      <Footer />
    </div>
  );
}
