// src/components/dashboard/staff/WorkAccountCard.tsx
import React from 'react';
import { Calendar, ShieldCheck, History } from 'lucide-react';
import { Card, Button } from '../../ui';
import AccountInfoItem from './helpers/AccountInfoItem';
import type { StaffProfile } from '../../../types/staff.types';

interface WorkAccountCardProps {
  user: StaffProfile;
  onToggleStatus: () => void;
}

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WORKING_DAYS = 5;

const formatDateTime = (raw: string | null | undefined): string => {
    if (!raw || raw === 'N/A' || raw.startsWith('0001-01-01')) return 'N/A';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return raw;
    }
};

const WorkAccountCard: React.FC<WorkAccountCardProps> = ({ user, onToggleStatus }) => {
  const isActive = user.status === 'Active';

  return (
    <Card className="overflow-hidden flex flex-col !p-0">
      <div className="px-8 py-6 border-b border-slate-100/60">
        <h2 className="text-xl font-extrabold text-slate-900 text-center tracking-tight">
          Work & Account Info
        </h2>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
        {/* Weekly Schedule */}
        <div className="bg-[#f8fbff] rounded-[20px] p-6 border border-blue-50/50">
          <h3 className="text-sm font-black text-blue-600 tracking-widest uppercase mb-4">
            WEEKLY SCHEDULE
          </h3>
          <div className="flex justify-between items-center mb-4 px-2">
            {WEEK_DAYS.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-xs font-black text-[#b0bec5]">{day}</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < WORKING_DAYS ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-slate-500">Morning Shift (8 AM - 4 PM)</p>
        </div>

        <AccountInfoItem
          icon={<Calendar className="w-5 h-5 text-slate-400" />}
          label="NEXT SHIFT"
          value="Tomorrow, 08:00 AM"
        />
        <AccountInfoItem
          icon={<ShieldCheck className="w-5 h-5 text-slate-400" />}
          label="ACCOUNT STATUS"
          value={
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">{user.status}</span>
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
          }
        />
        <AccountInfoItem
          icon={<History className="w-5 h-5 text-slate-400" />}
          label="LAST LOGIN"
          value={formatDateTime(user.lastLogin)}
        />

        <div className="mt-auto pt-6">
          <Button
            variant={isActive ? 'danger' : 'primary'}
            fullWidth
            size="lg"
            className="uppercase tracking-wide"
            onClick={onToggleStatus}
          >
            {isActive ? 'Deactivate Account' : 'Activate Account'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkAccountCard;