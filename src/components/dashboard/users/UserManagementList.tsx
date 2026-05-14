import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import TopBar from '../TopBar';
import { Badge } from '../../ui';
import { DataTable, TableFilters } from '../../table';
import type { Column, FilterConfig } from '../../table';
import type { StaffMember } from '../../../types/staff.types';
import type { PatientListItem } from '../../../types/patient.types';
import { staffApi } from '../../../api/staff';
import { patientApi } from '../../../api/patient';
import { EditUserModal } from './EditUserModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface UserManagementListProps {
    onMenuClick: () => void;
    onAddUserClick: (type: 'patient' | 'staff', role?: string) => void;
    onProfileClick?: () => void;
}

// ==================== Filter Configs ====================
const staffFilterConfig: FilterConfig[] = [
    {
        key: 'role',
        label: 'Role',
        type: 'select',
        placeholder: 'All Roles',
        options: [
            { value: '1', label: 'Admin' },
            { value: '2', label: 'Doctor' },
            { value: '3', label: 'Nurse' },
            { value: '6', label: 'Lab Technician' },
            { value: '5', label: 'Radiologist' },
            { value: '4', label: 'Pharmacist' },
        ],
    },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All Statuses',
        options: [
            { value: 'Active', label: 'Active' },
            { value: 'Disabled', label: 'Disabled' },
        ],
    },
    {
        key: 'sort',
        label: 'Sort By',
        type: 'select',
        placeholder: 'Newest First',
        options: [
            { value: 'Newest', label: 'Newest' },
            { value: 'Oldest', label: 'Oldest' },
            { value: 'Name A→Z', label: 'Name A→Z' },
            { value: 'Name Z→A', label: 'Name Z→A' },
        ],
        hidePlaceholder: true,
    },
    
];

const patientFilterConfig: FilterConfig[] = [
    {
        key: 'gender',
        label: 'Gender',
        type: 'select',
        placeholder: 'All Genders',
        options: [
            { value: 'Female', label: 'Female' },
            { value: 'Male', label: 'Male' },
        ],
    },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        placeholder: 'All Statuses',
        options: [
            { value: 'Active', label: 'Active' },
            { value: 'Disabled', label: 'Disabled' },
        ],
    },
    { key: 'lastVisit', label: 'Last Visit', type: 'date', placeholder: 'mm / dd / yy' },
    {
        key: 'sort',
        label: 'Sort By',
        type: 'select',
        placeholder: 'Newest First',
        options: [
            { value: 'Newest', label: 'Newest' },
            { value: 'Oldest', label: 'Oldest' },
            { value: 'Name A→Z', label: 'Name A→Z' },
            { value: 'Name Z→A', label: 'Name Z→A' },
        ],
        hidePlaceholder: true,
    },
];

// ==================== Helpers ====================
const formatDate = (raw: string | null | undefined): string => {
    if (!raw || raw === 'N/A' || raw.startsWith('0001-01-01')) return 'N/A';
    try {
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw; // return as-is if unparseable
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return raw;
    }
};

// ==================== Column Definitions ====================
const getStaffColumns = (onEdit: (staff: StaffMember) => void, onDelete: (staff: StaffMember) => void): Column<StaffMember>[] => [
    {
        key: 'name',
        header: 'STAFF NAME',
        render: (staff) => (
            <div className="flex items-center gap-3">
                <img src={staff.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name || 'U')}&background=random`} alt={staff.name || 'Staff'} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{staff.name || 'Unnamed Staff'}</span>
                    <span className="text-xs text-slate-400 font-medium">{staff.subtitle || staff.username || 'No ID'}</span>
                </div>
            </div>
        ),
    },
    {
        key: 'username',
        header: 'USERNAME',
        render: (staff) => <span className="font-extrabold text-slate-900">{staff.username}</span>,
    },
    {
        key: 'role',
        header: 'ROLE',
        render: (staff) => (
            <span className={`font-bold ${staff.role === 'Doctor' ? 'text-blue-500' : 'text-emerald-500'}`}>
                {staff.role}
            </span>
        ),
    },
    {
        key: 'lastLogin',
        header: 'LAST LOGIN',
        render: (staff) => <span className="font-bold text-slate-900">{staff.lastLogin || 'N/A'}</span>,
    },
    {
        key: 'dept',
        header: 'DEPT',
        render: (staff) => <span className="font-bold text-slate-900">{staff.dept || 'General'}</span>,
    },
    {
        key: 'status',
        header: 'STATUS',
        render: (staff) => (
            <Badge variant={staff.status === 'Active' ? 'success' : 'default'}>
                {staff.status}
            </Badge>
        ),
    },
    {
        key: 'actions',
        header: 'ACTIONS',
        render: (staff) => (
            <div className="flex flex-col gap-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(staff); }} className="text-blue-500 hover:text-blue-700 font-bold text-sm transition-colors text-left">
                    Edit
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(staff); }} className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors text-left">
                    Delete
                </button>
            </div>
        ),
    },
];

const getPatientColumns = (onEdit: (patient: PatientListItem) => void, onDelete: (patient: PatientListItem) => void): Column<PatientListItem>[] => [
    {
        key: 'name',
        header: 'PATIENT NAME',
        render: (patient) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs font-bold">
                    {(patient.name || 'P')[0]}
                </div>
                <span className="font-extrabold text-slate-900">{patient.name || 'Unnamed Patient'}</span>
            </div>
        ),
    },
    {
        key: 'patientId',
        header: 'ID',
        render: (patient) => (
            <div className="flex flex-col">
                <span className="font-extrabold text-slate-900">{patient.patientId}</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider">{patient.subtitle}</span>
            </div>
        ),
    },
    {
        key: 'demographics',
        header: 'DEMOGRAPHICS',
        render: (patient) => <span className="font-bold text-slate-900">{patient.demographics}</span>,
    },
    {
        key: 'lastVisit',
        header: 'LAST VISIT',
        render: (patient) => <span className="font-extrabold text-slate-900">{formatDate(patient.lastVisit)}</span>,
    },
    {
        key: 'upcoming',
        header: 'UPCOMING',
        render: (patient) => (
            <span className={`font-bold ${patient.upcoming && patient.upcoming !== '-' ? 'text-blue-500' : 'text-slate-400'}`}>
                {patient.upcoming && patient.upcoming !== '-' ? formatDate(patient.upcoming) : '-'}
            </span>
        ),
    },
    {
        key: 'status',
        header: 'STATUS',
        render: (patient) => (
            <Badge variant={patient.status === 'Active' ? 'success' : 'default'} size="sm">
                {patient.status}
            </Badge>
        ),
    },
    {
        key: 'actions',
        header: 'ACTIONS',
        render: (patient) => (
            <div className="flex flex-col gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); onEdit(patient); }} className="text-blue-600 hover:text-blue-800 font-extrabold text-xs transition-colors text-left uppercase tracking-wide">
                    Edit
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(patient); }} className="text-red-500 hover:text-red-700 font-extrabold text-xs transition-colors text-left uppercase tracking-wide">
                    Delete
                </button>
            </div>
        ),
    },
];

// ==================== Component ====================
const UserManagementList = ({ onMenuClick, onAddUserClick, onProfileClick }: UserManagementListProps) => {
    const { isNurse } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'patient' | 'staff'>(
        (location.state as any)?.activeTab || (isNurse ? 'patient' : 'staff')
    );

    // Sync activeTab with isNurse role (handles async auth loading)
    useEffect(() => {
        if (isNurse) {
            setActiveTab('patient');
        }
    }, [isNurse]);
    const [staffFilters, setStaffFilters] = useState<Record<string, string>>({});
    const [patientFilters, setPatientFilters] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [staffData, setStaffData] = useState<StaffMember[]>([]);
    const [patientData, setPatientData] = useState<PatientListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentStaffPage, setCurrentStaffPage] = useState(1);
    const [currentPatientPage, setCurrentPatientPage] = useState(1);
    
    // Modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [modalUserType, setModalUserType] = useState<'patient' | 'staff'>('staff');

    const navigate = useNavigate();

    const handleEdit = useCallback((userType: 'patient' | 'staff', id: string) => {
        if (userType === 'staff') {
            const staff = staffData.find(s => s.id === id);
            if (staff?.role === 'Doctor') {
                navigate(`/dashboard/users/staff/edit/${id}`);
                return;
            }
        }
        setModalUserType(userType);
        setSelectedUserId(id);
        setEditModalOpen(true);
    }, [staffData, navigate]);

    const handleDelete = useCallback((userType: 'patient' | 'staff', id: string, name: string) => {
        setModalUserType(userType);
        setSelectedUserId(id);
        setSelectedUserName(name);
        setDeleteModalOpen(true);
    }, []);

    const onModalSuccess = useCallback(() => {
        if (modalUserType === 'staff') {
            fetchStaff();
        } else {
            fetchPatients();
        }
    }, [modalUserType]); // will add fetchStaff/fetchPatients to dependency array further below if needed, or disable rules 

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            // Map Sort string to integer
            const sortMap: Record<string, number> = {
                'Newest': 0,
                'Oldest': 1,
                'Name A→Z': 2,
                'Name Z→A': 3
            };

            const data = await staffApi.getStaffs({
                SearchKey: searchQuery,
                Role: staffFilters.role,
                IsActive: staffFilters.status === 'Active' ? true : staffFilters.status === 'Disabled' ? false : undefined,
                sort: staffFilters.sort ? sortMap[staffFilters.sort] : undefined,
                LastLoginFrom: staffFilters.lastLoginFrom,
                LastLoginTo: staffFilters.lastLoginTo,
                PageIndex: currentStaffPage - 1,
                PageSize: 5
            });
            const list = data?.staffs || (data as any)?.items || (data as any)?.data || (Array.isArray(data) ? data : []);
            
            if (list && list.length > 0) {
                const mappedStaff = list.map((item: any) => {
                    const rolesMap: Record<string, string> = {
                        '1': 'Admin', '2': 'Doctor', '3': 'Nurse', '4': 'Pharmacist', '5': 'Radiologist', '6': 'Lab Technician',
                        'Admin': 'Admin', 'Doctor': 'Doctor', 'Nurse': 'Nurse', 'Pharmacist': 'Pharmacist', 'Radiologist': 'Radiologist', 'Lab Technician': 'Lab Technician', 'LabTechnician': 'Lab Technician'
                    };
                    
                    // Comprehensive search for role
                    const findRole = () => {
                        const direct = item.role ?? item.Role ?? item.roleId ?? item.RoleId ?? item.staffRole ?? item.StaffRole ?? item.roleName ?? item.RoleName;
                        if (direct !== undefined && direct !== null) {
                            if (typeof direct === 'object') return direct.name ?? direct.Name ?? rolesMap[direct.id ?? direct.Id] ?? 'Staff';
                            const s = String(direct);
                            return rolesMap[s] ?? (isNaN(parseInt(s)) ? s : 'Staff');
                        }
                        // Search all keys for "role"
                        for (const k in item) {
                            if (k.toLowerCase().includes('role')) {
                                const val = item[k];
                                if (val !== undefined && val !== null) {
                                    if (typeof val === 'object') return val.name ?? val.Name ?? rolesMap[val.id ?? val.Id] ?? 'Staff';
                                    const s = String(val);
                                    return rolesMap[s] ?? (isNaN(parseInt(s)) ? s : 'Staff');
                                }
                            }
                        }
                        return item.specialization ?? item.Specialization ?? 'Staff';
                    };

                    const roleVal = findRole();

                    // Comprehensive search for dept
                    const findDept = () => {
                        const direct = item.dept ?? item.department ?? item.deptName ?? item.Dept ?? item.Department ?? item.departmentName ?? item.DepartmentName;
                        if (direct !== undefined && direct !== null) {
                            if (typeof direct === 'object') return direct.name ?? direct.Name ?? 'General';
                            return String(direct);
                        }
                        for (const k in item) {
                            if (k.toLowerCase().includes('dept') || k.toLowerCase().includes('depart')) {
                                const val = item[k];
                                if (val) return typeof val === 'object' ? (val.name ?? val.Name) : String(val);
                            }
                        }
                        return item.specialization ?? item.Specialization ?? 'General';
                    };
                    const deptVal = findDept();

                    return {
                        id: item.id || item.Id || item.nationalId || item.NationalId || '',
                        name: item.name || item.fullNameEnglish || item.FullNameEnglish || 'Unknown',
                        subtitle: item.nationalId || item.NationalId || item.specialization || '',
                        username: item.username || item.userName || item.Email || item.email || '',
                        role: roleVal,
                        lastLogin: item.lastLogin || item.LastLogin || item.lastLoginDate || item.LastLoginDate || item.lastSeen || 'N/A',
                        dept: deptVal,
                        status: item.isActive === false || item.status === 'Inactive' ? 'Disabled' : (item.status || 'Active'),
                        avatar: item.avatar || item.PersonalPhotos || '',
                    };
                });
                setStaffData(mappedStaff);
                if (data?.totalCount !== undefined) {
                    setTotalItems(data.totalCount);
                } else if (currentStaffPage === 1) {
                    setTotalItems(mappedStaff.length);
                }
            } else {
                setStaffData([]); 
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Failed to fetch staff:', error);
            setStaffData([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, staffFilters, currentStaffPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentStaffPage(1);
    }, [searchQuery, staffFilters]);

    useEffect(() => {
        setCurrentPatientPage(1);
    }, [searchQuery, patientFilters]);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const sortMap: Record<string, number> = {
                'Newest': 0,
                'Oldest': 1,
                'Name A→Z': 2,
                'Name Z→A': 3
            };

            const data = await patientApi.getPatients({
                SearchKey: searchQuery,
                Gender: patientFilters.gender,
                IsActive: patientFilters.status === 'Active' ? true : patientFilters.status === 'Disabled' ? false : undefined,
                LastVisit: patientFilters.lastVisit,
                sort: patientFilters.sort ? sortMap[patientFilters.sort] : undefined,
                PageIndex: currentPatientPage - 1, // API is 0-indexed
                PageSize: 5
            });
            const list = data?.patients || (data as any)?.items || (data as any)?.data || (Array.isArray(data) ? data : []);
            
            if (list && list.length > 0) {
                const mappedPatients = list.map((item: any) => {
                    const userGuid = item.userId ? String(item.userId) : (item.id ? String(item.id) : '');
                    
                    const isMinDate = (d: any) => !d || d.toString().startsWith('0001-01-01');
                    
                    const rawLastVisit = item.lastVisitDate || item.LastVisitDate || item.lastVisit || item.LastVisit;
                    const rawUpcoming = item.upComingAppointment || item.UpComingAppointment || item.UpcomingAppointment || item.upcomingAppointment || item.upcoming || item.Upcoming;
                    
                    return {
                        id: userGuid,
                        userId: userGuid,
                        patientId: item.fileNumber || item.nationalId || userGuid,
                        name: item.name || 'Unknown',
                        subtitle: item.fileNumber || '',
                        demographics: item.demographicData || item.demographics || '',
                        lastVisit: isMinDate(rawLastVisit) ? 'N/A' : rawLastVisit,
                        upcoming: isMinDate(rawUpcoming) ? '-' : rawUpcoming,
                        status: item.isActive === false || item.status === 'Inactive' ? 'Disabled' : (item.status || 'Active'),
                        avatar: item.avatar || item.PersonalPhotos || '',
                        prescriptions: item.prescriptions || [],
                        prescriptionSummary: item.prescriptionSummary || { totalPrescriptions: 0, activeTreatmentNote: '', recentNote: '' },
                    };
                });

                setPatientData(mappedPatients);
                if (data?.totalCount !== undefined) {
                    setTotalItems(data.totalCount);
                } else if (currentPatientPage === 1) {
                    setTotalItems(mappedPatients.length);
                }
            } else {
                setPatientData([]);
                setTotalItems(0);
            }
        } catch (error: any) {
            if (error?.message !== 'Access forbidden.') {
                console.error('Failed to fetch patients:', error);
            }
            setPatientData([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, patientFilters, currentPatientPage]);


    useEffect(() => {
        if (activeTab === 'staff') {
            fetchStaff();
        } else {
            fetchPatients();
        }
    }, [activeTab, fetchStaff, fetchPatients]);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative font-sans">
            <TopBar
                title={isNurse ? "Patients" : "User Management"}
                searchPlaceholder={
                    activeTab === 'patient'
                        ? 'Search patients by name, ID or phone...'
                        : 'Search staff by name, username or ID...'
                }
                onMenuClick={onMenuClick}
                onAddUserClick={onAddUserClick}
                onSearch={setSearchQuery}
                onProfileClick={onProfileClick}
                isNurse={isNurse}
            />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
                    {/* Tabs */}
                    <div className="flex items-center w-full max-w-[320px] bg-[#5390D9]/20 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('patient')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'patient'
                                    ? 'bg-[#5390D9] text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Patients
                        </button>
                        {!isNurse && (
                            <button
                                onClick={() => setActiveTab('staff')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'staff'
                                        ? 'bg-[#5390D9] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                Hospital Staff
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    {activeTab === 'staff' ? (
                        <TableFilters
                            filters={staffFilterConfig}
                            values={staffFilters}
                            onChange={(key, value) =>
                                setStaffFilters((prev) => ({ ...prev, [key]: value }))
                            }
                        />
                    ) : (
                        <TableFilters
                            filters={patientFilterConfig}
                            values={patientFilters}
                            onChange={(key, value) =>
                                setPatientFilters((prev) => ({ ...prev, [key]: value }))
                            }
                        />
                    )}

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center p-20 bg-white rounded-3xl border border-slate-100">
                            <div className="flex flex-col items-center gap-4">
                               <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                               <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                                 {isNurse ? "Loading Patients..." : "Loading Users..."}
                               </p>
                           </div>
                        </div>
                    ) : activeTab === 'staff' ? (
                        <DataTable<StaffMember>
                            columns={getStaffColumns(
                                (staff) => handleEdit('staff', staff.id),
                                (staff) => handleDelete('staff', staff.id, staff.name)
                            )}
                            data={staffData}
                            totalItems={totalItems}
                            currentPage={currentStaffPage}
                            onPageChange={setCurrentStaffPage}
                            onRowClick={(staff) => {
                                const routeId = staff.username || staff.id;
                                if (staff.role === 'Doctor') {
                                    navigate(`/dashboard/users/doctor/${routeId}`);
                                } else {
                                    navigate(`/dashboard/users/staff/${routeId}`);
                                }
                            }}
                        />
                    ) : (
                        <DataTable<PatientListItem>
                            columns={getPatientColumns(
                                (patient) => navigate(`/dashboard/users/patient/edit/${patient.id}`),
                                (patient) => handleDelete('patient', patient.id, patient.name)
                            )}
                            data={patientData}
                            totalItems={totalItems}
                            currentPage={currentPatientPage}
                            onPageChange={setCurrentPatientPage}
                            onRowClick={(patient) => navigate(`/dashboard/users/patient/${patient.id}`)}
                        />
                    )}
                </div>
            </div>

            <EditUserModal 
                isOpen={editModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                userType={modalUserType} 
                userId={selectedUserId} 
                onSuccess={onModalSuccess} 
            />

            <DeleteConfirmModal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                userType={modalUserType} 
                userId={selectedUserId} 
                userName={selectedUserName} 
                onSuccess={onModalSuccess} 
            />
        </div>
    );
};

export default UserManagementList;

