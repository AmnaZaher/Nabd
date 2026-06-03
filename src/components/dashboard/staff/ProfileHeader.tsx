// src/components/dashboard/staff/ProfileHeader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Pencil } from 'lucide-react';
import { Card, Badge, Button } from '../../ui';
import { PATHS } from '../../../routes/routePaths';
import type { StaffProfile } from '../../../types/staff.types';

interface ProfileHeaderProps {
  user: StaffProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 lg:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative">
      <Button
        variant="outline"
        size="sm"
        icon={<Pencil size={14} />}
        className="absolute top-6 right-6"
        onClick={() => navigate(`${PATHS.EDIT_STAFF}/${user.id}`)}
      >
        Edit
      </Button>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-2 border-2 border-blue-50">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=200`}
            alt={user.name}
            className="w-full h-full object-cover rounded-full bg-slate-100"
          />
        </div>
        {user.status === 'Active' && (
          <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {user.name}
          </h1>
          <Badge variant="info" className="uppercase tracking-wider font-black text-xs px-3 py-1.5">
            {user.role}
          </Badge>
        </div>

        <p className="text-base text-slate-400 font-bold mb-6">
          {user.department} <span className="mx-2">&bull;</span> Medical License ID: {user.licenseId}
        </p>

        <div className="flex flex-wrap flex-col md:flex-row items-center justify-center md:justify-start gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-sm font-bold text-slate-600 truncate">{user.location}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-sm font-bold text-slate-600 truncate">{user.email}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;