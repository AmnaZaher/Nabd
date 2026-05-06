import React from 'react';
import { Menu, Search, User as UserIcon } from 'lucide-react';
import { AddUserButton } from './shared/AddUserButton';
import { useAuth } from '../../context/AuthContext';
import { staffApi } from '../../api/staff';
import type { StaffProfile } from '../../types/staff.types';

interface TopBarProps {
    onProfileClick?: () => void;
    title?: React.ReactNode;
    onMenuClick: () => void;
    onAddUserClick?: (type: 'patient' | 'staff', role?: string) => void;
    onSearch?: (query: string) => void;         // kept for compatibility
    searchPlaceholder?: string;                  // kept for compatibility
    showAddUser?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
    title = 'Dashboard',
    onMenuClick,
    onProfileClick,
    onAddUserClick,
    onSearch,
    searchPlaceholder,
    showAddUser = true,
}) => {
    const { user } = useAuth();
    const [profile, setProfile] = React.useState<StaffProfile | null>(null);

    React.useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    // user.id = JWT nameidentifier (internal DB id)
                    // user.name = JWT name/unique_name (often the national ID / username)
                    const data = await staffApi.getMyProfile(user.id, user.name);
                    if (data) setProfile(data);
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            }
        };

        fetchProfile();
    }, [user?.id]);

    const displayUser = profile || user;

    return (
        <header className="px-4 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10 w-full overflow-visible">
            {/* Left Side */}
            <div className="flex items-center gap-4 min-w-0">
                {/* Mobile Menu Button */}
                <button
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden shrink-0"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>

                {/* Title */}
                <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight shrink-0 truncate">
                    {title}
                </h1>
            </div>

            {/* Search Part - Only if onSearch is provided */}
            {onSearch && (
                <div className="hidden md:flex flex-1 max-w-2xl mx-10">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            placeholder={searchPlaceholder || "Search..."}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-3 md:gap-6 shrink-0 ml-auto">
                {/* Mobile Search Button (Optional, not requested but good for UX) */}
                {/* {onSearch && <button className="p-2 text-slate-400 md:hidden"><Search size={22} /></button>} */}
                
                {/* Add User Button */}
                {showAddUser && onAddUserClick && (
                    <AddUserButton
                        onClick={(type, role) => {
                            onAddUserClick(type, role);
                        }}
                    />
                )}

                {/* Profile Section */}
                <div 
                    className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-100 ml-2 md:ml-4 cursor-pointer hover:opacity-80 transition-opacity group/profile"
                    onClick={onProfileClick}
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-tight group-hover/profile:text-blue-600 transition-colors">
                            {displayUser?.name || user?.name || 'User'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium capitalize">
                            {displayUser?.role || user?.role || 'Staff'}
                        </p>
                    </div>
                    
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-slate-50 flex items-center justify-center shrink-0">
                        {displayUser?.avatar ? (
                            <img 
                                src={displayUser.avatar} 
                                alt={displayUser.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = ''; // Fallback to icon
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <UserIcon size={20} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;