import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/dashboard/Sidebar";
import TopBar from "../../components/dashboard/TopBar";
import StatCards from "../../components/dashboard/StatCards";

import AppointmentTrendChart from "./charts/AppointmentTrendChart";

import { PatientFeed } from "./widgets/InfoWidgets";
import StatusDistribution from "./widgets/StatusDistribution";
import QuickActions from "./widgets/QuickActions";
import DoctorStatus from "./widgets/DoctorStatus";
import RegisterPatient from "./patients/RegisterPatient";
import RegisterStaff from "./staff/RegisterStaff";
import UserManagementList from "./users/UserManagementList";
import UserProfileDetail from "./users/UserProfileDetail";
import PatientProfileDetail from "./users/PatientProfileDetail";
import LabResultDetail from "./users/LabResultDetail";
import DrSchedulePage from "./schedule/DrSchedulePage";
import RadiologyReportDetail from "./users/RadiologyReportDetail";
import PrescriptionDetail from "./users/PrescriptionDetail";
import ClinicsContainer from "./clinics/ClinicsContainer";
import ClinicDetails from "./clinics/ClinicDetails";
import EditClinic from "./clinics/EditClinic";
import AssignStaff from "./clinics/AssignStaff";
import AppointmentManagementPage from "./appointments/AppointmentManagementPage";
import EditAppointmentPage from "./appointments/EditAppointmentPage";
import EditPatientProfilePage from "./users/EditPatientProfilePage";
import EditDoctorProfilePage from "./users/EditDoctorProfilePage";
import AdminProfile from "./profile/AdminProfile";
import LabCatalogPage from "./lapCatalog/LabCatalogPage";
import AddLabTest from "./lapCatalog/AddLabTest";
import EditLabTest from "./lapCatalog/EditLabTest";
import TestDetails from "./lapCatalog/TestDetails";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

interface DashboardProps {
  onLogout?: () => void;
  //onAddUserClick?: (type: 'patient' | 'staff', role?: string) => void;
}


const Dashboard = ({ onLogout }: DashboardProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAdmin, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [userViewMode, setUserViewMode] = useState<"list" | "register">("list");
  const [registerMode, setRegisterMode] = useState<"patient" | "staff">(
    "patient",
  );
  const [registerRole, setRegisterRole] = useState<string>("Doctor");
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    // حالات خاصة للمسارات التفصيلية
    if (
      path.includes("/dashboard/clinics/details") ||
      path.includes("/dashboard/clinics/WWD")
    )
      return "Clinic Details";
    if (path.includes("/dashboard/clinics/edit")) return "Edit Clinic";
    if (path.includes("/dashboard/clinics/assign")) return "Assign Staff";
    if (path.includes("/dashboard/users/patient/edit")) return "Edit Patient Profile";
    if (path.includes("/dashboard/users/patient/")) return "Patient Profile";
    if (path.includes("/dashboard/users/staff/edit")) return "Edit Doctor Profile";
    if (path.includes("/dashboard/users/staff/")) return "Staff Profile";
    if (path.includes("/dashboard/appointments")) return "Appointments";
    if (path.includes("/dashboard/appointments/edit")) return "Appointment Management";
    if (path.includes("/dashboard/profile")) return "Admin Profile";

    // حالات الـ Tabs الأساسية
    switch (activeTab) {
      case "users":
        return "User Management";
      case "clinics":
        return "Clinics Management";
      case "appointments":
        return "Appointments";
      case "dr-schedule":
        return "Doctor Schedule";
      case "radiology":
        return "Radiology Center";
      case "lab-catalog":
        return "Lab Catalog";
      case "settings":
        return "Settings";
      default:
        return "Dashboard Overview";
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard/users")) {
      setActiveTab("users");
    } else if (path.includes("/dashboard/appointments")) {
      setActiveTab("appointments");
    } else if (path.includes("/dashboard/dr-schedule")) {
      setActiveTab("dr-schedule");
    } else if (path.includes("/dashboard/radiology")) {
      setActiveTab("radiology");
    } else if (path.includes("/dashboard/lab-catalog")) {
      setActiveTab("lab-catalog");
    } else if (path.includes("/dashboard/clinics")) {
      setActiveTab("clinics");
    } else if (path.includes("/dashboard/settings")) {
      setActiveTab("settings");
    } else if (path.includes("/dashboard/profile")) {
      setActiveTab("profile");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good Morning" : "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans p-4 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-slate-500 mb-8">
            {!user ? "No authentication token found. Please log in." : "This dashboard is for administrative use only."}
          </p>
          <button
            onClick={() => {
              onLogout?.();
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => {
          onLogout?.();
        }}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "users") {
            setUserViewMode("list");
          }
        }}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {activeTab !== "users" &&
          !location.pathname.includes("/dashboard/users") &&
          !location.pathname.includes("/dashboard/dr-schedule") &&
          //!location.pathname.includes("/dashboard/appointments") &&
          !location.pathname.includes("/dashboard/users/patient/edit") && (
            <TopBar
              title={getPageTitle()}
              onMenuClick={() => setIsSidebarOpen(true)}
              onAddUserClick={(type, role) => {
                setActiveTab("users");
                setUserViewMode("register");
                setRegisterMode(type);
                if (role) setRegisterRole(role);
                navigate("/dashboard/users");
              }}
              showAddUser={true}
            />
          )}

        <Routes>
          {/* Staff Profile */}
          <Route
            path="users/staff/edit/:id"
            element={<EditDoctorProfilePage />}
          />

          <Route
            path="users/staff/:id"
            element={
              <UserProfileDetail onMenuClick={() => setIsSidebarOpen(true)} />
            }
          />

          {/* Edit Patient Profile - Move above detail to ensure specificity */}
          <Route
            path="users/patient/edit/:id"
            element={<EditPatientProfilePage />}
          />

          {/* Patient Profile */}
          <Route
            path="users/patient/:id"
            element={
              <PatientProfileDetail
                onMenuClick={() => setIsSidebarOpen(true)}
              />
            }
          />

          {/* Lab Result Detail */}
          <Route
            path="users/patient/:id/lab/:labId"
            element={
              <LabResultDetail onMenuClick={() => setIsSidebarOpen(true)} />
            }
          />

          {/* Radiology Report Detail */}
          <Route
            path="users/patient/:id/radiology/:radiologyId"
            element={
              <RadiologyReportDetail
                onMenuClick={() => setIsSidebarOpen(true)}
              />
            }
          />

          {/* Prescription Detail */}
          <Route
            path="users/patient/:id/prescription/:prescriptionId"
            element={
              <PrescriptionDetail onMenuClick={() => setIsSidebarOpen(true)} />
            }
          />

          {/* User Management List + Register */}
          <Route
            path="users"
            element={
              <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
                {userViewMode === "list" ? (
                  <UserManagementList
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onAddUserClick={(type, role) => {
                      setUserViewMode("register");
                      setRegisterMode(type);
                      if (role) setRegisterRole(role);
                    }}
                  />
                ) : (
                  <div className="flex-1 overflow-y-auto w-full">
                    {registerMode === "patient" ? (
                      <RegisterPatient
                        onSwitchView={(type, role) => {
                          setRegisterMode(type);
                          if (role) setRegisterRole(role);
                        }}
                      />
                    ) : (
                      <RegisterStaff
                        initialRole={registerRole}
                        onSwitchView={(type, role) => {
                          setRegisterMode(type);
                          if (role) setRegisterRole(role);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            }
          />

          {/* Appointments */}
          <Route
            path="appointments"
            element={
              <div className="flex-1 overflow-y-auto w-full h-full">
                <AppointmentManagementPage />
              </div>
            }
          />

          <Route
            path="appointments/edit/:id"
            element={
              <div className="flex-1 overflow-y-auto w-full h-full">
                <EditAppointmentPage />
              </div>
            }
          />

          {/* Clinics */}
          <Route path="clinics" element={<ClinicsContainer />} />
          <Route path="clinics/:id" element={<ClinicDetails />} />

          <Route path="clinics/edit/:id" element={<EditClinic />} />

          <Route path="clinics/assign/:id" element={<AssignStaff />} />

          {/* DR. Schedule */}
          <Route
            path="dr-schedule"
            element={
              <div className="flex-1 overflow-y-auto w-full h-full">
                <DrSchedulePage
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onAddUserClick={() => {}}
                />
              </div>
            }
          />

          {/* Admin Profile */}
          <Route path="profile" element={<AdminProfile />} />

          {/* Lab Catalog */}
          <Route path="lab-catalog" element={<LabCatalogPage />} />
          <Route path="lab-catalog/add" element={<AddLabTest />} />
          <Route path="lab-catalog/edit/:id" element={<EditLabTest />} />
          <Route path="lab-catalog/details/:id" element={<TestDetails />} />

          {/* Dashboard Home */}
          <Route
            path="*"
            element={
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-[1600px] mx-auto space-y-4">
                  <div className="mb-4">
                    <p className="text-slate-500 font-medium mb-1">
                      {currentDate}
                    </p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {getGreeting()} {user.name}
                    </h2>
                  </div>

                  <StatCards />

                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Left Column: Chart & Quick Actions */}
                    <div className="flex-1 space-y-4 min-w-0">
                      <AppointmentTrendChart />
                      <QuickActions />
                    </div>

                    {/* Right Column: Widgets */}
                    <div className="w-full lg:w-[350px] shrink-0 space-y-4">
                      <StatusDistribution />
                      <DoctorStatus />
                      <PatientFeed />
                    </div>
                  </div>
                </div>
              </main>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
