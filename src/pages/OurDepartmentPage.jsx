// src/pages/OurDepartmentPage.jsx
// Standalone Unlisted Department Showcase Portal (/our_department)
// Shares modular departmental sections from AboutPage with an isolated same-page
// header (DepartmentNavbar), zero hackathon registration CTAs, and no public Footer.

import React, { useState, useEffect } from 'react';
import SeoHead from '../components/common/SeoHead';
import DepartmentNavbar from '../components/department/DepartmentNavbar';
import { smoothScrollTo } from '../components/ScrollManager';
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

export default function OurDepartmentPage() {
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    activeIndex: 0,
  });

  // Handle deep-link #hash navigation cleanly after lazy route mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.replace('#', '');
    const timer = setTimeout(() => {
      smoothScrollTo(id);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (index = 0) => {
    setLightboxState({ isOpen: true, activeIndex: index });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, activeIndex: 0 });
  };

  return (
    <>
      {/* Isolated Unlisted Portal Head Metadata (noindex, nofollow, noarchive) */}
      <SeoHead route="/our_department" />

      {/* Dedicated Same-Page Sticky Departmental Header (outside overflow container so sticky stays pinned) */}
      <DepartmentNavbar />

      <div className="flex-1 flex flex-col w-full overflow-x-clip bg-[#FAF8F5] text-[#111116]">
        {/* S1: Asymmetric Hero Stage & 2.5D Magazine Cover Portal */}
        <AboutHero onOpenGallery={openLightbox} />

        {/* S2: Dual Intersecting Tilted Marquees & Departmental Key Metrics (Standalone: TNEA 2727 replaces ₹0 chip) */}
        <AboutMarqueeStats standalone />

        {/* S3: Institutional Vision & 5-Stage VLSI Innovation Model (Obsidian Chassis) */}
        <AboutLeadership />

        {/* S4: MeitY C2S EDA Labs & 7 Commercial Workshops Interactive Rail */}
        <AboutWorkshops />

        {/* S5: 17 Undergraduate Silicon Research Architectures Bento */}
        <AboutSiliconResearch />

        {/* S6: Competitive Arenas Archive (Standalone: neutral stamp, zero /register CTA) */}
        <AboutCompetitions standalone />

        {/* S7: National Delegations & Conclaves Rail */}
        <AboutNationalExposure onOpenGallery={openLightbox} />

        {/* S8: Fellowships (Samsung India), Startups (InterviewBot) & NPTEL Elite (Obsidian Chassis) */}
        <AboutHonours />

        {/* S9: Holistic Excellence Beyond Silicon (Sports, NCC, Cultural & Clubs) */}
        <AboutBeyondSilicon />

        {/* S10: Departmental Magazine Vault, 51-Page PDF & Builder Voices */}
        <AboutMagazineVault onOpenGallery={openLightbox} />

        {/* S11: Departmental Inquiries & Secretariat Contacts (Standalone: Magazine CTA, no Footer below) */}
        <AboutClosingCta standalone />

        {/* Accessible Lightbox Modal */}
        {lightboxState.isOpen && (
          <AboutLightbox
            activeIndex={lightboxState.activeIndex}
            onClose={closeLightbox}
          />
        )}
      </div>
    </>
  );
}
