import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { staffApi } from "../../api/staff";
import type { StaffProfile } from "../../types/staff.types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Widgets
import DoctorStatus from "./widgets/DoctorStatus";
import { PatientFeed } from "./widgets/InfoWidgets";
import AppointmentTrendChart from "./charts/AppointmentTrendChart";
import StatCards from "./StatCards";
import QuickActions from "./widgets/QuickActions";
import StatusDistribution from "./widgets/StatusDistribution";

// Pages
import VisitDetailsPage from './doctor/VisitDetailsPage';
import UserManagementList from "./users/UserManagementList";
import RegisterPatient from "./patients/RegisterPatient";
import RegisterStaff from "./staff/RegisterStaff";
import PatientProfileDetail from "./users/PatientProfileDetail";
import StaffProfilePage from "./staff/StaffProfilePage";
import EditPatientProfilePage from "./users/EditPatientProfilePage";
import ClinicsList from "./clinics/ClinicsList";
import ClinicDetails from "./clinics/ClinicDetails";
import EditClinic from "./clinics/EditClinic";
import AddClinic from "./clinics/AddClinic";
import LabCatalogPage from "./lapCatalog/LabCatalogPage";
import LabTestDetail from "./lapCatalog/TestDetails";
import AddLabTest from "./lapCatalog/AddLabTest";
import EditLabTest from "./lapCatalog/EditLabTest";
import DRSchedulePage from "./schedule/DrSchedulePage";
import AdminProfilePage from "./profile/AdminProfile";
import PatientVisitPage from "./nurse/PatientVisitPage";
import NurseDashboardOverview from "./nurse/NurseDashboardOverview";
import BookLabAppointment from "./nurse/BookLabAppointment";
import BookRadiologyAppointment from "./nurse/BookRadiologyAppointment";
import LabTechnicianDashboardOverview from "./lab/LabTechnicianDashboardOverview";
import RadiologistDashboardOverview from "./radiologist/RadiologistDashboardOverview";
import RadiologistPatientProfile from "./radiologist/RadiologistPatientProfile";
import RadiologistRequests from "./radiologist/RadiologistRequests";
import RadiologistExamRooms from "./radiologist/RadiologistExamRooms";
import RadiologistReporting from "./radiologist/RadiologistReporting";
import RadiologistResults from "./radiologist/RadiologistResults";
import RadiologistReviewReport from "./radiologist/RadiologistReviewReport";
import EditLabResultPage from "./lab/EditLabResultPage";
import VisitLabTestsPage from "./lab/VisitLabTestsPage";
import LabResultDetailsPage from "./lab/LabResultDetailsPage";
import LabApprovalPage from "./lab/LabApprovalPage";
import ApproveLabResultPage from "./lab/ApproveLabResultPage";
import LabOrdersPage from "./lab/LabOrdersPage";
import AppointmentManagementPage from "./appointments/AppointmentManagementPage";
import NewAppointmentPage from "./appointments/NewAppointmentPage";
import EditAppointmentPage from "./appointments/EditAppointmentPage";
import ReceptionistProfile from "./RECEPTIONIST/ReceptionistProfile";
import EditReceptionistProfile from "./RECEPTIONIST/EditReceptionistProfile";
import NurseDrSchedulePage from "./schedule/NurseDrSchedulePage";
import NurseDrScheduleDetails from "./schedule/NurseDrScheduleDetails";
import RadiologyPage from "./Radiology/RadiologyPage";
import AddRadiologyTest from "./Radiology/AddRadiologyTest";
import DoctorDashboardOverview from "./doctor/DoctorDashboardOverview";
import DoctorVisitsPage from "./doctor/DoctorVisitsPage";
import ActiveVisitPage from "./doctor/ActiveVisitPage";
import DoctorProfileDetail from "./users/DoctorProfileDetail";
import EditDoctorProfilePage from "./users/EditDoctorProfilePage";
import DoctorSchedulePage from "./users/Doctorschedulepage ";
import LabTechnicianProfile from "./lab/LabTechnicianProfile";
import EditLabTechnicianProfile from "./lab/EditLabTechnicianProfile";

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user, logout, isNurse, isDoctor, isLabTechnician, isRadiologist, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminProfile, setAdminProfile] = useState<StaffProfile | null>(null);
  const [receptionistProfile, setReceptionistProfile] = useState<StaffProfile | null>(null);

  // Fetch real display name for greeting
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id && isAdmin) {
        try {
          const data = await staffApi.getMyProfile(user.id, user.name, user?.role);
          if (data) setAdminProfile(data);
        } catch (error) {
          console.error("Failed to fetch admin profile for greeting:", error);
        }
      }
      if (user?.id && !isAdmin) {
        try {
          const data = await staffApi.getMyProfile(user.id, user.name, user?.role);
          if (data) setReceptionistProfile(data);
        } catch (error) {
          console.error("Failed to fetch receptionist profile for greeting:", error);
        }
      }
    };
    fetchProfile();
  }, [user?.id, isAdmin, user?.name, user?.role]);

  // Sync active tab with URL
  useEffect(() => {
    const path = location.pathname;
    const fromPath = (location.state as any)?.base || (location.state as any)?.from || "";
    if (path.includes("book-radiology")) setActiveTab("book-radiology");
    else if (path.includes("book-lab")) setActiveTab("lab-catalog");
    else if (path.includes("/users") || path.includes("/patients")) setActiveTab("users");
    else if (path.includes("/doctor-schedule")) setActiveTab("doctor-schedule");
    else if (path.includes("/appointments")) setActiveTab("appointments");
    else if (path.includes("/radiology/requests")) setActiveTab("requests");
    else if (path.includes("/radiology/exam-rooms")) setActiveTab("exam-rooms");
    else if (path.includes("/radiology/reporting")) setActiveTab("reporting");
    else if (path.includes("/radiology")) setActiveTab("radiology");
    else if (path.includes("/lab-catalog")) setActiveTab("lab-catalog");
    else if (path.includes("/clinics")) setActiveTab("clinics");
    else if (path.includes("/settings")) setActiveTab("settings");
    else if (path.includes("/profile")) setActiveTab("profile");
    else if (path.includes("/dr-schedule")) setActiveTab("dr-schedule");
    else if (path.includes("/patient-visit")) setActiveTab("patient-visit");
    else if (path.includes("/doctor-visits")) setActiveTab("doctor-visits");
    else if (path.includes("/lab-test-request") || (path.includes("/lab/") && fromPath.includes("/lab-test-request"))) setActiveTab("lab-orders");
    else if (path.includes("/lab-test") || path.includes("/lab/approve") || (path.includes("/lab/") && fromPath.includes("/lab-test"))) setActiveTab("lab-approval");
    else setActiveTab("dashboard");

    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate("/login");
    }
  };

  const handleProfileClick = () => {
      if (isAdmin) {
          navigate("/dashboard/profile");
      } else {
          navigate("/dashboard/profile"); // or receptionist-profile if you prefer
      }
  };

  const handleAddUser = (type: "patient" | "staff") => {
    navigate(
      type === "patient"
        ? "/dashboard/users/register-patient"
        : "/dashboard/users/register-staff"
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const effectiveRole = receptionistProfile?.role || adminProfile?.role || user?.role || "";
  const effectiveIsLabTechnician = isLabTechnician || effectiveRole.toLowerCase().replace(/[^a-z]/g, '') === 'labtechnician';
  const effectiveIsNurse = isNurse || effectiveRole.toLowerCase() === 'nurse';
  const effectiveIsDoctor = isDoctor || effectiveRole.toLowerCase() === 'doctor';
  const effectiveIsRadiologist = isRadiologist || effectiveRole.toLowerCase() === 'radiologist';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = (adminProfile?.name || receptionistProfile?.name || user?.name || "User").split(" ")[0];
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-700">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onLogout={handleLogout}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <Routes>
          {/* Dashboard Overview */}
          <Route
            index
            element={
              effectiveIsNurse ? (
                <NurseDashboardOverview
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onProfileClick={handleProfileClick}
                  onAddUserClick={handleAddUser}
                />
              ) : effectiveIsDoctor ? (
                <DoctorDashboardOverview
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onProfileClick={handleProfileClick}
                  onAddUserClick={handleAddUser}
                />
              ) : effectiveIsLabTechnician ? (
                <LabTechnicianDashboardOverview
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onProfileClick={handleProfileClick}
                />
              ) : effectiveIsRadiologist ? (
                <RadiologistDashboardOverview
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onProfileClick={handleProfileClick}
                />
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <TopBar
                    title="Dashboard Overview"
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onAddUserClick={handleAddUser}
                    onProfileClick={handleProfileClick}
                  />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-[1600px] mx-auto space-y-4">
                      <div className="mb-4">
                        <p className="text-slate-500 font-medium mb-1">{currentDate}</p>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {getGreeting()},{" "}
                          <span className="text-blue-600">{displayName}</span> 👋
                        </h2>
                      </div>
                      <StatCards />
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 space-y-4 min-w-0">
                          <AppointmentTrendChart />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QuickActions
                              onAction={(id) =>
                                id === "add_patient"
                                  ? handleAddUser("patient")
                                  : navigate(`/dashboard/${id}`)
                              }
                            />
                            <StatusDistribution />
                          </div>
                        </div>
                        <div className="w-full lg:w-[380px] space-y-4 shrink-0">
                          <DoctorStatus />
                          <PatientFeed />
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              )
            }
          />

          {/* User Management */}
          <Route path="users">
            <Route index element={<UserManagementList onMenuClick={() => setIsSidebarOpen(true)} onAddUserClick={handleAddUser} onProfileClick={handleProfileClick} />} />
            <Route path="register-patient" element={<RegisterPatient onSwitchView={() => navigate("/dashboard/users")} />} />
            <Route path="register-staff" element={<RegisterStaff onSwitchView={() => navigate("/dashboard/users")} />} />
            <Route path="patient/:id" element={<PatientProfileDetail onMenuClick={() => setIsSidebarOpen(true)} />} />
            <Route path="patient/edit/:id" element={<EditPatientProfilePage />} />
            <Route path="staff/:id" element={<StaffProfilePage onMenuClick={() => setIsSidebarOpen(true)} />} />
            <Route path="doctor/:id" element={<DoctorProfileDetail onMenuClick={() => setIsSidebarOpen(true)} />} />
            <Route path="staff/edit/:id" element={<EditDoctorProfilePage />} />
          </Route>

          {/* Clinics */}
          <Route path="clinics">
            <Route index element={<ClinicsList onAddClinic={() => navigate("/dashboard/clinics/add")} />} />
            <Route path="add" element={<AddClinic onCancel={() => navigate("/dashboard/clinics")} onSuccess={() => navigate("/dashboard/clinics")} />} />
            <Route path=":id" element={<ClinicDetails />} />
            <Route path="edit/:id" element={<EditClinic />} />
          </Route>

          {/* Lab Catalog */}
          <Route path="lab-catalog">
            <Route index element={<LabCatalogPage />} />
            <Route path=":id" element={<LabTestDetail />} />
            <Route path="add" element={<AddLabTest />} />
            <Route path="details/:id" element={<LabTestDetail />} />
            <Route path="edit/:id" element={<EditLabTest />} />
          </Route>

          {/* Lab Technician Flow */}
          <Route path="lab-test-request" element={<LabOrdersPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
          <Route path="lab-test" element={<LabApprovalPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
          <Route path="lab">
            <Route path="edit/:id" element={<EditLabResultPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
            <Route path="approve/:id" element={<ApproveLabResultPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
            <Route path="visit/:id" element={<VisitLabTestsPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
            <Route path="result/:id" element={<LabResultDetailsPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
          </Route>

          {/* Appointments (admin / nurse / receptionist) */}
          <Route path="appointments">
            <Route
              index
              element={
                <div className="flex-1 flex flex-col min-h-0">
                  <TopBar title="Appointments" onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} showAddUser={false} />
                  <AppointmentManagementPage />
                </div>
              }
            />
            <Route path="new" element={<NewAppointmentPage />} />
            <Route path="edit/:id" element={<EditAppointmentPage />} />
          </Route>

          {/* Doctor's own schedule */}
          <Route
            path="doctor-schedule"
            element={
              <DoctorSchedulePage
                onMenuClick={() => setIsSidebarOpen(true)}
                onProfileClick={handleProfileClick}
              />
            }
          />

          {/* Radiology */}
          <Route path="radiology" element={<div className="flex-1 overflow-y-auto h-full bg-[#F8FAFC]"><RadiologyPage /></div>} />
          <Route path="radiology/add" element={<div className="flex-1 overflow-y-auto h-full bg-[#F8FAFC]"><AddRadiologyTest /></div>} />
          <Route path="radiology/requests" element={<RadiologistRequests onMenuClick={() => setIsSidebarOpen(true)} />} />
          <Route path="radiology/exam-rooms" element={<RadiologistExamRooms onMenuClick={() => setIsSidebarOpen(true)} />} />
          <Route path="radiology/reporting" element={<RadiologistReporting onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
          <Route path="radiology/patient/:id" element={<RadiologistPatientProfile onMenuClick={() => setIsSidebarOpen(true)} />} />
          <Route path="radiology/results" element={<RadiologistResults onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} /> 
          <Route path="radiology/results/review/:queueId" element={<RadiologistReviewReport onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />          

          {/* Nurse patients alias */}
          <Route path="patients" element={<UserManagementList onMenuClick={() => setIsSidebarOpen(true)} onAddUserClick={handleAddUser} onProfileClick={handleProfileClick} />} />

          {/* DR Schedule (admin / nurse view — all doctors) */}
          <Route
            path="dr-schedule"
            element={
              isNurse ? (
                <NurseDrSchedulePage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />
              ) : (
                <DRSchedulePage onMenuClick={() => setIsSidebarOpen(true)} onAddUserClick={handleAddUser} onProfileClick={handleProfileClick} />
              )
            }
          />
          <Route path="dr-schedule/details/:id" element={<NurseDrScheduleDetails onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />

          {/* Profile */}
          <Route
            path="profile"
            element={
              isAdmin ? (
                <AdminProfilePage />
              ) : isDoctor ? (
                <DoctorProfileDetail onMenuClick={() => setIsSidebarOpen(true)} />
              ) : effectiveIsLabTechnician ? (
                <LabTechnicianProfile onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />
              ) : (
                <ReceptionistProfile />
              )
            }
          />
          <Route
            path="profile/edit"
            element={
              isAdmin ? (
                <AdminProfilePage />
              ) : isDoctor ? (
                <EditDoctorProfilePage />
              ) : effectiveIsLabTechnician ? (
                <EditLabTechnicianProfile onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />
              ) : (
                <EditReceptionistProfile />
              )
            }
          />

          {/* Doctor Visits */}
          <Route path="doctor-visits" element={<DoctorVisitsPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
          <Route path="visit-details" element={<VisitDetailsPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />

          {/* Patient Visit */}
          <Route
            path="patient-visit"
            element={
              isDoctor ? (
                <ActiveVisitPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />
              ) : (
                <PatientVisitPage onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />
              )
            }
          />
          
          {/* Nurse specific pages */}
          <Route path="nurse/book-lab-appointment" element={<BookLabAppointment onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
          <Route path="nurse/book-radiology-appointment" element={<BookRadiologyAppointment onMenuClick={() => setIsSidebarOpen(true)} onProfileClick={handleProfileClick} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;