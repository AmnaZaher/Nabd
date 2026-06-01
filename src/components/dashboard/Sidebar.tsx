import React from 'react';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CalendarClock,
    Microscope,
    FlaskConical,
    Building2,
    Settings,
    LogOut,
    X,
    Activity,
    ClipboardList,
    ClipboardCheck,
    Contact,
    DoorOpen,
    FileEdit,
    type LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout as apiLogout } from '../../api/auth';
import { PATHS } from '../../routes/routePaths';

interface NavItem {
    id: string;
    icon: LucideIcon;
    label: string;
    path: string;
}

const getNavItems = (isNurse: boolean, isDoctor: boolean, isLabTechnician: boolean, isRadiologist: boolean): NavItem[] => {
    if (isDoctor) {
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview', path: PATHS.DASHBOARD },
            { id: 'doctor-visits', icon: Users, label: 'Visits', path: PATHS.DOCTOR_VISITS },
            // { id: 'patient-visit',   icon: Activity,        label: 'Active Visit', path: PATHS.PATIENT_VISIT   },
            // Points to the new doctor-only schedule page, NOT the shared appointments page
            { id: 'doctor-schedule', icon: CalendarClock, label: 'Schedule', path: PATHS.DOCTOR_SCHEDULE },
        ];
    }
    if (isNurse) {
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: PATHS.DASHBOARD },
            { id: 'users', icon: Users, label: 'Patients', path: PATHS.USER_MANAGEMENT },
            { id: 'appointments', icon: CalendarCheck, label: 'Appointments', path: PATHS.APPOINTMENTS },
            { id: 'patient-visit', icon: Activity, label: 'Patient Visit', path: PATHS.PATIENT_VISIT },
            { id: 'dr-schedule', icon: CalendarClock, label: 'DR. Schedule', path: PATHS.DR_SCHEDULE },
            { id: 'book-radiology', icon: Microscope, label: 'Radiology', path: PATHS.NURSE_BOOK_RADIOLOGY },
            { id: 'lab-catalog', icon: FlaskConical, label: 'Lab Catalog', path: PATHS.NURSE_BOOK_LAB },
        ];
    }
    if (isLabTechnician) {
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: PATHS.DASHBOARD },
            { id: 'lab-orders', icon: ClipboardList, label: 'Lab orders', path: PATHS.LAB_TEST_REQUEST },
            { id: 'lab-approval', icon: ClipboardCheck, label: 'Lab approval', path: PATHS.LAB_TEST },
        ];
    }
    if (isRadiologist) {
        return [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: PATHS.DASHBOARD },
            { id: 'requests', icon: Contact, label: 'Requests', path: PATHS.RADIOLOGY_REQUESTS },
            { id: 'exam-rooms', icon: DoorOpen, label: 'Exam Rooms', path: PATHS.RADIOLOGY_EXAM_ROOMS },
            { id: 'reporting', icon: FileEdit, label: 'Reporting', path: PATHS.RADIOLOGY_REPORTING },
            { id: 'results', icon: Microscope, label: 'Results', path: PATHS.RADIOLOGY_RESULTS },
        ];
    }
    return [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: PATHS.DASHBOARD },
        { id: 'users', icon: Users, label: 'User Management', path: PATHS.USER_MANAGEMENT },
        { id: 'appointments', icon: CalendarCheck, label: 'Appointments', path: PATHS.APPOINTMENTS },
        { id: 'dr-schedule', icon: CalendarClock, label: 'DR. Schedule', path: PATHS.DR_SCHEDULE },
        { id: 'radiology', icon: Microscope, label: 'Radiology', path: PATHS.RADIOLOGY },
        { id: 'lab-catalog', icon: FlaskConical, label: 'Lab Catalog', path: PATHS.LAB_CATALOG },
        { id: 'clinics', icon: Building2, label: 'Clinics', path: PATHS.CLINICS },
    ];
};

interface SidebarProps {
    isOpen: boolean;
    activeTab?: string;
    onClose: () => void;
    onLogout: () => void;
    onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    activeTab = 'dashboard',
    onClose,
    onLogout,
    onTabChange,
}) => {
    const navigate = useNavigate();
    const { logout, isNurse, isDoctor, isLabTechnician, isRadiologist } = useAuth();

    const currentNavItems = getNavItems(isNurse, isDoctor, isLabTechnician, isRadiologist);

    const handleNavClick = (item: NavItem) => {
        onTabChange?.(item.id);
        navigate(item.path);
        onClose();
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await apiLogout(refreshToken);
            }
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            logout();
            onLogout();
        }
    };

    return (
        <aside
            className={`
                w-[100px] flex flex-col items-center py-4 text-white
                h-screen shrink-0 shadow-lg z-50 transition-transform duration-300
                absolute md:relative
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                top-0 left-0
            `}
            style={{
                background: 'linear-gradient(180deg, #5BB8F5 0%, #1A6FC4 40%, #0D4A8A 100%)',
            }}
        >
            {/* Close button for mobile */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 md:hidden text-white/70 hover:text-white"
            >
                <X size={20} />
            </button>

            {/* Navigation Items */}
            <nav className="flex-1 w-full flex flex-col overflow-y-auto mt-2 scrollbar-none">
                {currentNavItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item)}
                        className={`
                            flex flex-col items-center justify-center w-full py-2.5 gap-1 transition-all shrink-0
                            ${activeTab === item.id
                                ? 'opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4)_0%,transparent_70%)]'
                                : 'opacity-90 hover:opacity-100 hover:bg-white/15'
                            }
                        `}
                    >
                        <item.icon size={22} strokeWidth={1.5} />
                        <span className="text-[9px] uppercase font-bold tracking-wider leading-tight text-center px-1">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center w-full py-3 opacity-60 hover:opacity-100 hover:text-red-300 transition-colors shrink-0 cursor-pointer"
            >
                <LogOut size={22} strokeWidth={1.5} />
                <span className="text-[9px] uppercase font-bold tracking-wider mt-1">
                    Log out
                </span>
            </button>
        </aside>
    );
};

export default Sidebar;