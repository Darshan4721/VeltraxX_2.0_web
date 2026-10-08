import React, { useState } from 'react';
import CollegeSearchSelect from './CollegeSearchSelect';
import { 
  Crown, 
  User, 
  ChevronDown, 
  CheckCircle, 
  Building, 
  Briefcase, 
  GraduationCap, 
  AlertCircle,
  Copy
} from 'lucide-react';

const DEGREE_OPTIONS = ["B.E.", "B.Tech", "B.Sc", "BCA", "M.E.", "M.Tech", "M.Sc", "MCA", "MBA", "Diploma", "Ph.D.", "Other"];
const LEVEL_OPTIONS = ["UG", "PG", "Research scholar", "Working professional"];
const DEPT_OPTIONS = ["ECE", "EEE", "VLSI / Microelectronics", "CSE", "IT", "AI&DS", "Mechanical", "Mechatronics", "Other"];
const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "Final-year passed out", "Not applicable"];

export default function MemberCard({
  index, // 0 for Leader, 1-3 for Members
  member,
  leaderData,
  onChange,
  errors = {}
}) {
  const isLeader = index === 0;
  const memberNum = index + 1;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Card border & shadow color mapping
  const shadowClasses = [
    'shadow-[6px_6px_0px_0px_#FFE500]', // 0: Leader Yellow
    'shadow-[6px_6px_0px_0px_#FF2E93]', // 1: Member 2 Magenta
    'shadow-[6px_6px_0px_0px_#0055FF]', // 2: Member 3 Cobalt
    'shadow-[6px_6px_0px_0px_#B6FF00]', // 3: Member 4 Lime
  ];

  const headerColors = [
    'bg-[#FFE500] text-[#111116]',
    'bg-[#FF2E93] text-[#111116]',
    'bg-[#0055FF] text-white',
    'bg-[#B6FF00] text-[#111116]',
  ];

  // Helper updater
  const updateField = (field, val) => {
    onChange({ ...member, [field]: val });
  };

  const isComplete = 
    member.name?.trim()?.length > 1 && 
    member.email?.trim()?.includes('@') && 
    member.phone?.trim()?.length >= 10;

  const isWorkingProf = member.level === 'Working professional';

  return (
    <div className={`bg-white rounded-3xl border-3 border-[#111116] ${shadowClasses[index]} transition-all mb-6 overflow-hidden`}>
      
      {/* Card Header Strip */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#111116]/10 bg-[#FAF9F5] cursor-pointer hover:bg-[#F5F4EE] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs border border-[#111116] ${headerColors[index]}`}>
            {isLeader ? <Crown className="w-4 h-4" /> : `0${memberNum}`}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-[#111116]">
                {isLeader ? "TEAM LEADER (PRIMARY SUBMITTER)" : `TEAM MEMBER 0${memberNum}`}
              </span>
              {isComplete && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>FILLED</span>
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-[#111116]">
              {member.name || (isLeader ? "Designated Team Leader" : `Member ${memberNum} Details`)}
              {isComplete && member.department && (
                <span className="text-[#6B6B78] font-normal text-xs ml-2">
                  ({member.department} · {member.college_name || leaderData?.college_name || 'Host Institute'})
                </span>
              )}
            </div>
          </div>
        </div>

        <button 
          type="button"
          aria-label={isCollapsed ? `Expand Member ${memberNum} card` : `Collapse Member ${memberNum} card`}
          className="w-12 h-12 rounded-xl bg-white border border-[#111116]/20 flex items-center justify-center font-bold text-[#111116] shrink-0 hover:bg-[#FAF9F5] transition-colors cursor-pointer"
        >
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Card Body */}
      {!isCollapsed && (
        <div className="p-5 sm:p-7 space-y-5">
          
          {/* Dual "Same as leader" switches for Members 2, 3, 4 */}
          {!isLeader && (
            <div className="bg-[#F4F4F6] p-4 rounded-2xl border-2 border-[#111116]/20 space-y-3">
              <div className="font-mono text-[11px] font-black uppercase text-[#111116] flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-[#0055FF]" />
                <span>QUICK-FILL TOGGLES (Same details as Leader)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Switch 1: Same College */}
                <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#111116]/15 cursor-pointer hover:border-[#111116] transition-colors">
                  <input
                    type="checkbox"
                    checked={member.same_college ?? true}
                    onChange={(e) => updateField('same_college', e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#111116] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#111116] block">Same college as Leader</span>
                    <span className="text-[#6B6B78] text-[11px]">
                      {leaderData?.college_name || "Locks to Leader's institution"}
                    </span>
                  </div>
                </label>

                {/* Switch 2: Same Department, Degree & Year */}
                <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#111116]/15 cursor-pointer hover:border-[#111116] transition-colors">
                  <input
                    type="checkbox"
                    checked={member.same_academics ?? true}
                    onChange={(e) => updateField('same_academics', e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#111116] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#111116] block">Same dept & year as Leader</span>
                    <span className="text-[#6B6B78] text-[11px]">
                      {leaderData?.department ? `${leaderData.department} · ${leaderData.year_of_study || '3rd'}` : "Locks to Leader's academic batch"}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Compact 3-Column Always-Typed Row: Name, Email, Phone (+91) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Full Name (As on College ID) *
              </label>
              <input
                type="text"
                autoComplete="name"
                value={member.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={isLeader ? "e.g. Arunachalam S" : `e.g. Teammate ${memberNum} Name`}
                className={`w-full h-12 bg-white border-2 ${
                  errors[`m${index}_name`] ? 'border-[#FF2E93]' : 'border-[#111116]'
                } rounded-xl px-3.5 text-base font-semibold text-[#111116] placeholder:text-[#111116]/30 focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
              />
              {errors[`m${index}_name`] && (
                <span className="text-[11px] font-bold text-[#FF2E93] mt-1 block">
                  {errors[`m${index}_name`]}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                autoComplete="email"
                value={member.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@college.edu.in"
                className={`w-full h-12 bg-white border-2 ${
                  errors[`m${index}_email`] ? 'border-[#FF2E93]' : 'border-[#111116]'
                } rounded-xl px-3.5 text-base font-semibold text-[#111116] placeholder:text-[#111116]/30 focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
              />
              {errors[`m${index}_email`] && (
                <span className="text-[11px] font-bold text-[#FF2E93] mt-1 block">
                  {errors[`m${index}_email`]}
                </span>
              )}
            </div>

            {/* Phone Number (+91 WhatsApp) */}
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                WhatsApp Phone (+91) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-[#111116]/60">
                  +91
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={member.phone?.replace(/^\+91/, '') || ''}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    updateField('phone', clean);
                  }}
                  placeholder="9876543210"
                  className={`w-full h-12 bg-white border-2 ${
                    errors[`m${index}_phone`] ? 'border-[#FF2E93]' : 'border-[#111116]'
                  } rounded-xl pl-12 pr-3.5 text-base font-mono font-semibold text-[#111116] placeholder:text-[#111116]/30 focus:outline-none focus:ring-2 focus:ring-[#FFE500]`}
                />
              </div>
              {errors[`m${index}_phone`] && (
                <span className="text-[11px] font-bold text-[#FF2E93] mt-1 block">
                  {errors[`m${index}_phone`]}
                </span>
              )}
            </div>

          </div>

          {/* Academic / Organization Profile Section */}
          <div className="pt-2 border-t border-[#111116]/10">
            
            {/* Level selection chips */}
            <div className="mb-4">
              <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-2">
                Participant Category / Level *
              </label>
              <div className="flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((lvl) => {
                  const isSelected = (member.level || 'UG') === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateField('level', lvl)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#111116] text-[#FFE500] border-[#111116] shadow-[2px_2px_0px_0px_#FFE500]' 
                          : 'bg-white text-[#111116] border-[#111116]/20 hover:border-[#111116]'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Professional Branch: Company & Designation */}
            {isWorkingProf ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F4F4F6] p-4 rounded-2xl border-2 border-[#111116]">
                <div>
                  <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={member.organisation || ''}
                    onChange={(e) => updateField('organisation', e.target.value)}
                    placeholder="e.g. Texas Instruments / Qualcomm"
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                    Designation / Role *
                  </label>
                  <input
                    type="text"
                    value={member.designation || ''}
                    onChange={(e) => updateField('designation', e.target.value)}
                    placeholder="e.g. Physical Design Engineer"
                    className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                  />
                </div>
              </div>
            ) : (
              /* Student Academic Profile */
              <div className="space-y-4">
                
                {/* College Selector (Unlocked only if Leader OR member.same_college is false) */}
                {(isLeader || member.same_college === false) ? (
                  <CollegeSearchSelect
                    value={member.college_name || ''}
                    onChange={(name, city, state) => {
                      onChange({
                        ...member,
                        college_name: name,
                        college_city: city,
                        college_state: state,
                        is_other_college: false
                      });
                    }}
                    customCollege={{
                      name: member.custom_college_name || '',
                      city: member.custom_college_city || '',
                      state: member.custom_college_state || ''
                    }}
                    onCustomCollegeChange={(custom) => {
                      onChange({
                        ...member,
                        custom_college_name: custom.name,
                        custom_college_city: custom.city,
                        custom_college_state: custom.state,
                        college_name: custom.name,
                        is_other_college: true
                      });
                    }}
                    isOtherSelected={member.is_other_college || false}
                    onToggleOther={(isOther) => updateField('is_other_college', isOther)}
                    id={`college-${index}`}
                    hasError={!!errors[`m${index}_college`]}
                  />
                ) : (
                  <div className="p-3 bg-[#FAF9F5] border-2 border-[#111116]/15 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#0055FF]" />
                      <span className="font-bold text-[#111116]">
                        Inherited College: {leaderData?.college_name || 'Host Institute (SIET)'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6B6B78] uppercase font-bold">LOCKED TO LEADER</span>
                  </div>
                )}

                {/* Academic Trio: Degree, Department, Year (Unlocked if Leader OR member.same_academics is false) */}
                {(isLeader || member.same_academics === false) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Degree */}
                    <div>
                      <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                        Degree *
                      </label>
                      <select
                        value={member.degree || 'B.E.'}
                        onChange={(e) => updateField('degree', e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                      >
                        {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                        Department / Branch *
                      </label>
                      <select
                        value={member.department || 'ECE'}
                        onChange={(e) => updateField('department', e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                      >
                        {DEPT_OPTIONS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>

                    {/* Year of Study */}
                    <div>
                      <label className="block font-mono text-xs font-black uppercase text-[#111116] mb-1.5">
                        Year of Study *
                      </label>
                      <select
                        value={member.year_of_study || '3rd'}
                        onChange={(e) => updateField('year_of_study', e.target.value)}
                        className="w-full h-12 bg-white border-2 border-[#111116] rounded-xl px-3.5 text-base font-semibold text-[#111116] focus:outline-none focus:ring-2 focus:ring-[#FFE500]"
                      >
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y} Year</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FAF9F5] border-2 border-[#111116]/15 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#FF2E93]" />
                      <span className="font-bold text-[#111116]">
                        Inherited Academics: {leaderData?.department || 'ECE'} · {leaderData?.degree || 'B.E.'} ({leaderData?.year_of_study || '3rd'} Year)
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6B6B78] uppercase font-bold">LOCKED TO LEADER</span>
                  </div>
                )}

                {/* Roll No / Register No (Optional) */}
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#6B6B78] uppercase mb-1">
                    College Register / Roll Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={member.roll_no || ''}
                    onChange={(e) => updateField('roll_no', e.target.value)}
                    placeholder="e.g. 714021106042"
                    className="w-full h-11 bg-white border-2 border-[#111116]/40 rounded-xl px-3 text-sm font-mono text-[#111116] focus:outline-none focus:border-[#111116]"
                  />
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
