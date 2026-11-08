// src/components/about/AboutLightbox.jsx
// Accessible Neo-Brutalist Image Lightbox Modal with keyboard navigation

import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { galleryItemsData } from '../../data/aboutData';

export default function AboutLightbox({ activeIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const total = galleryItemsData.length;
  const currentItem = galleryItemsData[currentIndex] || galleryItemsData[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    setCurrentIndex(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, handlePrev, handleNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Gallery Lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D0D11]/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full rounded-3xl bg-[#161622] p-5 sm:p-7 border-3 border-[#FFE500] shadow-[10px_10px_0px_#111116] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#FFE500] text-[#111116] font-mono text-xs font-black uppercase">
              {currentItem.category}
            </span>
            <span className="font-mono text-xs text-white/70">
              {currentIndex + 1} / {total}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="w-9 h-9 rounded-xl bg-white text-[#111116] border-2 border-[#111116] flex items-center justify-center hover:bg-[#FF2E93] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Image Container */}
        <div className="relative flex items-center justify-center min-h-[320px] max-h-[60vh] overflow-hidden rounded-2xl bg-[#0D0D11] border-2 border-white/20">
          <img
            src={currentItem.src}
            alt={currentItem.title}
            className="max-h-[58vh] w-auto max-w-full object-contain"
          />

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Image"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#111116]/80 text-[#FFE500] border-2 border-white/40 flex items-center justify-center hover:bg-[#FFE500] hover:text-[#111116] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Image"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#111116]/80 text-[#FFE500] border-2 border-white/40 flex items-center justify-center hover:bg-[#FFE500] hover:text-[#111116] transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Details Bar */}
        <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-sans font-black text-lg text-white uppercase">
              {currentItem.title}
            </h4>
            <p className="font-sans text-xs sm:text-sm text-white/70 font-medium">
              {currentItem.desc}
            </p>
          </div>

          <a
            href={currentItem.src}
            download
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111116] text-[#FFE500] font-mono text-xs font-bold border border-white/30 hover:border-[#FFE500] transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
}

