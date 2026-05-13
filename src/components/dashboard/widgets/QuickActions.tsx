import React from "react";
import { UserPlus, Calendar, Users, FlaskConical, Boxes } from "lucide-react";

const actions = [
  { id: "add_patient", label: "ADD PATIENT", icon: UserPlus },
  { id: "dr_schedule", label: "DR. SCHEDULE", icon: Calendar },
  { id: "users", label: "USERS", icon: Users },
  { id: "lab_request", label: "LAB REQUEST", icon: FlaskConical },
  { id: "radiology", label: "RADIOLOGY", icon: Boxes },
];

interface QuickActionsProps {
  onAction?: (id: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  return (
    <div className="bg-gradient-to-r from-[#0057B8] to-[#00A3FF] rounded-[24px] p-5 shadow-xl shadow-blue-500/10 h-fit">
      <h3 className="text-lg font-bold text-white mb-4 tracking-tight">Quick Actions</h3>
      <div className="grid grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className="flex flex-col items-center justify-center py-4 px-1 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all border border-white/5 group backdrop-blur-[2px] w-full"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-white bg-white/10 group-hover:bg-white/20 transition-all shrink-0">
              <action.icon size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-black text-white/90 tracking-wider text-center leading-tight break-words w-full">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};



export default QuickActions;
