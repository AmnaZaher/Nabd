// src/components/dashboard/staff/helpers/InfoRow.tsx
import React from 'react';

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-[#b0bec5] mb-1">{label}</p>
    <p className="text-base font-bold text-slate-900 break-all">{value?.trim() ? value : 'N/A'}</p>
  </div>
);

export default InfoRow;