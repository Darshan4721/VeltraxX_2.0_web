import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { smoothScrollTo } from './ScrollManager';
import logoMark from '../assets/logo-mark.svg';

export default function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleAnchorClick = (anchor, e) => {
    if (isHomePage) {
      smoothScrollTo(anchor, e);
    }
  };

  return (
    <footer className="py-14 bg-white text-[#111116] border-t-3 border-[#111116] font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b-2 border-[#111116]/10">
          
          {/* Brand & Department */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 shrink-0">
              <img src={logoMark} alt="VELTRAXX 2.0 Hackathon Logo" className="w-full h-full object-contain" width="44" height="44" loading="lazy" />
            </div>
            <div>
              <div className="font-black text-sm text-[#111116]">
                VELTRAXX 2.0 · NATIONAL TECH & SILICON HACKATHON
              </div>
              <div className="text-[#111116]/70 text-[11px] font-semibold">
                Department of EE - VDT (VLSI Design & Technology), SIET Coimbatore
              </div>
            </div>
          </div>

          {/* Quick Jump Links */}
          <div className="flex flex-wrap items-center gap-5 font-bold text-[#111116]">
            <a 
              href={isHomePage ? "#overview" : "/#overview"} 
              onClick={(e) => handleAnchorClick("overview", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              Overview
            </a>
            <a 
              href={isHomePage ? "#pipeline" : "/#pipeline"} 
              onClick={(e) => handleAnchorClick("pipeline", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              The Gauntlet
            </a>
            <a 
              href={isHomePage ? "#tracks" : "/#tracks"} 
              onClick={(e) => handleAnchorClick("tracks", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              5 Tracks
            </a>
            <a 
              href={isHomePage ? "#rules" : "/#rules"} 
              onClick={(e) => handleAnchorClick("rules", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              Rules
            </a>
            <a 
              href={isHomePage ? "#timeline" : "/#timeline"} 
              onClick={(e) => handleAnchorClick("timeline", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              Timeline
            </a>
            <Link 
              to="/about" 
              className="text-[#0055FF] hover:underline font-extrabold"
            >
              Our Journey
            </Link>
            <a 
              href={isHomePage ? "#downloads" : "/#downloads"} 
              onClick={(e) => handleAnchorClick("downloads", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              Downloads
            </a>
            <a 
              href={isHomePage ? "#faqs" : "/#faqs"} 
              onClick={(e) => handleAnchorClick("faqs", e)}
              className="hover:text-[#0055FF] transition-colors"
            >
              FAQs
            </a>
            <Link to="/register" className="text-[#0055FF] hover:underline font-black">
              Register Free
            </Link>
            <Link to="/submit-ppt" className="hover:text-[#0055FF] transition-colors">
              Submit PPT
            </Link>
            <Link to="/round2-confirm" className="hover:text-[#FF2E93] transition-colors">
              Round 2 Gatekeeper
            </Link>
          </div>

        </div>

        {/* Bottom Credits & Institutional Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#111116]/70 gap-4">
          <div>
            © 2026 VELTRAXX 2.0 · Sri Shakthi Institute of Engineering and Technology. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-[#111116]">
              <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
              <span>COIMBATORE, TAMIL NADU</span>
            </span>
            <span>•</span>
            <span className="font-bold text-[#111116] bg-[#FFE500] px-2 py-0.5 rounded border border-[#111116]">
              DEPARTMENT OF EE (VLSI DESIGN & TECH)
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}