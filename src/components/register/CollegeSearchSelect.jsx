import React, { useState, useRef, useEffect } from 'react';
import { CANONICAL_COLLEGES } from '../../data/colleges';
import { Search, ChevronDown, Check, Building, Plus } from 'lucide-react';

export default function CollegeSearchSelect({
  value,
  onChange,
  customCollege,
  onCustomCollegeChange,
  isOtherSelected,
  onToggleOther,
  id = "college-select",
  hasError = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on click/tap outside or Escape
  useEffect(() => {
    function handleOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filtered = CANONICAL_COLLEGES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCollegeObj = CANONICAL_COLLEGES.find(c => c.name === value);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={id} className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5 flex items-center justify-between">
        <span>College / Institution *</span>
        <button
          type="button"
          onClick={() => onToggleOther(!isOtherSelected)}
          className="text-[11px] text-[#0055FF] hover:underline font-bold cursor-pointer"
        >
          {isOtherSelected ? "Select from list" : "+ Other (Custom College)"}
        </button>
      </label>

      {isOtherSelected ? (
        <div className="space-y-3 bg-[#F4F4F6] p-3.5 rounded-xl border-2 border-[#111116]">
          <div>
            <span className="block font-mono text-[10px] font-bold text-[#6B6B78] uppercase mb-1">
              Custom Institution Name *
            </span>
            <input
              type="text"
              placeholder="e.g. Government Engineering College, Thrissur"
              value={customCollege.name || ''}
              onChange={(e) => onCustomCollegeChange({ ...customCollege, name: e.target.value })}
              className="w-full h-11 bg-white border-2 border-[#111116] rounded-lg px-3 text-sm font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block font-mono text-[10px] font-bold text-[#6B6B78] uppercase mb-1">
                City / District *
              </span>
              <input
                type="text"
                placeholder="e.g. Thrissur"
                value={customCollege.city || ''}
                onChange={(e) => onCustomCollegeChange({ ...customCollege, city: e.target.value })}
                className="w-full h-10 bg-white border-2 border-[#111116] rounded-lg px-3 text-xs font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>
            <div>
              <span className="block font-mono text-[10px] font-bold text-[#6B6B78] uppercase mb-1">
                State *
              </span>
              <input
                type="text"
                placeholder="e.g. Kerala"
                value={customCollege.state || ''}
                onChange={(e) => onCustomCollegeChange({ ...customCollege, state: e.target.value })}
                className="w-full h-10 bg-white border-2 border-[#111116] rounded-lg px-3 text-xs font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={triggerRef}
            id={id}
            tabIndex={0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="College or Institution selection"
            onClick={() => {
              setIsOpen(!isOpen);
              setActiveIndex(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
                setActiveIndex(-1);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isOpen) {
                  setIsOpen(true);
                  setActiveIndex(0);
                } else {
                  setActiveIndex(prev => (prev < filtered.length ? prev + 1 : 0));
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (isOpen) {
                  setActiveIndex(prev => (prev > 0 ? prev - 1 : filtered.length));
                }
              } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                setIsOpen(false);
                setActiveIndex(-1);
                triggerRef.current?.focus();
              }
            }}
            className={`w-full h-12 bg-white border-2 ${
              hasError ? 'border-[#FF2E93]' : 'border-[#111116]'
            } rounded-xl px-3.5 flex items-center justify-between cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
          >
            <span className={`text-sm font-semibold truncate ${value ? 'text-[#111116]' : 'text-[#6B6B78]'}`}>
              {value || "Search or select your college..."}
            </span>
            <ChevronDown className={`w-4 h-4 text-[#111116] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {isOpen && (
            <div 
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1.5 bg-white border-2 border-[#111116] rounded-xl shadow-[4px_4px_0px_0px_#111116] z-50 max-h-64 flex flex-col overflow-hidden"
            >
              {/* Search box inside dropdown */}
              <div className="p-2 border-b border-[#111116]/10 bg-[#FAF9F5]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6B6B78] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setActiveIndex(-1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setActiveIndex(prev => (prev < filtered.length ? prev + 1 : 0));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setActiveIndex(prev => (prev > 0 ? prev - 1 : filtered.length));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (activeIndex >= 0 && activeIndex < filtered.length) {
                          const selected = filtered[activeIndex];
                          onChange(selected.name, selected.city, selected.state);
                          setIsOpen(false);
                          setActiveIndex(-1);
                          triggerRef.current?.focus();
                        } else if (activeIndex === filtered.length) {
                          onToggleOther(true);
                          setIsOpen(false);
                          setActiveIndex(-1);
                        } else if (filtered.length > 0) {
                          const selected = filtered[0];
                          onChange(selected.name, selected.city, selected.state);
                          setIsOpen(false);
                          setActiveIndex(-1);
                          triggerRef.current?.focus();
                        }
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsOpen(false);
                        setActiveIndex(-1);
                        triggerRef.current?.focus();
                      }
                    }}
                    placeholder="Type to filter colleges..."
                    className="w-full h-9 bg-white border border-[#111116]/20 rounded-lg pl-8 pr-3 text-xs font-medium text-[#111116] focus:outline-none focus:border-[#111116]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options list */}
              <div className="overflow-y-auto divide-y divide-[#111116]/5 p-1">
                {filtered.map((college, idx) => {
                  const isSelected = college.name === value;
                  const isFocused = activeIndex === idx;
                  return (
                    <div
                      key={college.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(college.name, college.city, college.state);
                        setIsOpen(false);
                        setActiveIndex(-1);
                        triggerRef.current?.focus();
                      }}
                      className={`p-2.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-[#FFE500] text-[#111116]' 
                          : isFocused 
                            ? 'bg-[#EAEAEA] text-[#111116]' 
                            : 'hover:bg-[#F4F4F6] text-[#111116]'
                      }`}
                    >
                      <div>
                        <div className="leading-tight">{college.name}</div>
                        <div className="font-mono text-[10px] text-[#6B6B78] mt-0.5">{college.city}, {college.state}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#111116] shrink-0" />}
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="p-3 text-center text-xs text-[#6B6B78]">
                    No matching college found.
                  </div>
                )}

                {/* Option to switch to custom other */}
                <div
                  role="option"
                  onClick={() => {
                    onToggleOther(true);
                    setIsOpen(false);
                    setActiveIndex(-1);
                  }}
                  className={`p-2.5 rounded-lg text-xs font-black text-[#0055FF] cursor-pointer flex items-center gap-1.5 border-t border-[#111116]/10 ${
                    activeIndex === filtered.length ? 'bg-[#0055FF]/10' : 'hover:bg-[#0055FF]/10'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>College not listed? Enter custom name...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
