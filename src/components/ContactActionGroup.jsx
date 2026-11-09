import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Check, Copy } from 'lucide-react';

export default function ContactActionGroup({ 
  name, 
  role, 
  phone, 
  email, 
  showWhatsApp = false,
  callColor = "bg-[#FFE500]",
  callTitle = "Call Coordinator"
}) {
  const [copied, setCopied] = useState(false);

  // Mask middle digits to protect against simple bot scraping (e.g. +91 96295 •••••)
  const formatMasked = (rawPhone) => {
    if (!rawPhone) return '';
    const clean = rawPhone.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} •••••`;
    }
    if (clean.length === 12 && clean.startsWith('91')) {
      return `+91 ${clean.slice(2, 7)} •••••`;
    }
    return rawPhone;
  };

  const cleanDigits = (phone || '').replace(/[^0-9]/g, '');

  const handleCopy = (e) => {
    e.preventDefault();
    if (navigator?.clipboard?.writeText && phone) {
      navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#F4F4F6] rounded-xl border-2 border-[#111116] gap-3">
      <div>
        <div className="font-bold text-sm text-[#111116]">{name}</div>
        <div className="font-mono text-xs text-[#111116]/60 mt-0.5">{role}</div>
        {phone && (
          <div className="font-mono text-[11px] text-[#111116]/70 mt-1 flex items-center gap-1.5">
            <span className="font-bold">{formatMasked(phone)}</span>
            <button 
              onClick={handleCopy}
              className="text-[#0055FF] hover:underline cursor-pointer inline-flex items-center gap-0.5 text-[10px]"
              title="Copy number to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {phone && (
          <a
            href={`tel:${phone}`}
            className={`${callColor} hover:brightness-95 text-[#111116] p-2.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center`}
            title={callTitle}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}

        {showWhatsApp && cleanDigits && (
          <a
            href={`https://wa.me/${cleanDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] p-2.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
            title={`WhatsApp ${name}`}
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] p-2.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
            title={`Email ${name}`}
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

