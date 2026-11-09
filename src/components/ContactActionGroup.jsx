import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';

export default function ContactActionGroup({ 
  name, 
  role, 
  phone, 
  email, 
  showWhatsApp = false,
  callColor = "bg-[#FFE500]",
  callTitle = "Call Coordinator"
}) {
  const cleanDigits = (phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="flex items-center justify-between p-3.5 bg-[#F4F4F6] rounded-xl border-2 border-[#111116] gap-3">
      <div className="min-w-0 pr-2">
        <div className="font-bold text-sm text-[#111116] truncate">{name}</div>
        <div className="font-mono text-xs text-[#111116]/65 mt-0.5 leading-snug">{role}</div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {phone && (
          <a
            href={`tel:${phone}`}
            className={`${callColor} hover:brightness-95 text-[#111116] p-2.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center`}
            title={callTitle}
            aria-label={callTitle}
          >
            <Phone className="w-4 h-4 text-[#111116]" />
          </a>
        )}

        {showWhatsApp && cleanDigits && (
          <a
            href={`https://wa.me/${cleanDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#B6FF00] hover:bg-[#B6FF00]/90 text-[#111116] p-2.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
            title={`WhatsApp ${name}`}
            aria-label={`WhatsApp ${name}`}
          >
            <MessageSquare className="w-4 h-4 text-[#111116]" />
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-[#111116] p-2.5 rounded-lg border-2 border-[#111116] shadow-[2px_2px_0px_0px_#111116] hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center"
            title={`Email ${name}`}
            aria-label={`Email ${name}`}
          >
            <Mail className="w-4 h-4 text-[#111116]" />
          </a>
        )}
      </div>
    </div>
  );
}

