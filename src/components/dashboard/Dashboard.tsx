import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
import UserManagementList from "./users/UserManagementList";
import RegisterPatient from "./patients/RegisterPatient";
import RegisterStaff from "./staff/RegisterStaff";
import PatientProfileDetail from "./users/PatientProfileDetail";
import StaffProfilePage from "./staff/StaffProfilePage";
import DoctorProfileDetail from "./users/DoctorProfileDetail";
import EditPatientProfilePage from "./users/EditPatientProfilePage";
import EditDoctorProfilePage from "./users/EditDoctorProfilePage";
import ClinicsList from "./clinics/ClinicsList";
import ClinicDetails from "./clinics/ClinicDetails";
import EditClinic from "./clinics/EditClinic";
import AddClinic from "./clinics/AddClinic";
import LabCatalogPage from "./lapCatalog/LabCatalogPage";
import LabTestDetail from "./lapCatalog/TestDetails";
import EditLabTest from "./lapCatalog/EditLabTest";
import DRSchedulePage from "./schedule/DrSchedulePage";
import AdminProfilePage from "./profile/AdminProfile";
import PatientVisitPage from "./nurse/PatientVisitPage";
import NurseDashboardOverview from "./nurse/NurseDashboardOverview";
import AppointmentManagementPage from "./appointments/AppointmentManagementPage";
import NewAppointmentPage from "./appointments/NewAppointmentPage";
import EditAppointmentPage from "./appointments/EditAppointmentPage";
import ReceptionistProfile from "./RECEPTIONIST/ReceptionistProfile";
import EditReceptionistProfile from "./RECEPTIONIST/EditReceptionistProfile";
import NurseDrSchedulePage from "./schedule/NurseDrSchedulePage";
import NurseDrScheduleDetails from "./schedule/NurseDrScheduleDetails";

const Dashboard: React.FC = () => {
  const { user, logout, isNurse, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sync active tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/users") || path.includes("/patients")) setActiveTab("users");
    else if (path.includes("/appointments")) setActiveTab("appointments");
    else if (path.includes("/radiology")) setActiveTab("radiology");
    else if (path.includes("/lab-catalog")) setActiveTab("lab-catalog");
    else if (path.includes("/clinics")) setActiveTab("clinics");
    else if (path.includes("/settings")) setActiveTab("settings");
    else if (path.includes("/profile")) setActiveTab("profile");
    else if (path.includes("/dr-schedule")) setActiveTab("dr-schedule");
    else if (path.includes("/patient-visit")) setActiveTab("patient-visit");
    else setActiveTab("dashboard");

    // Close sidebar on route change (mobile)
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user?.name || "User";
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
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <Routes>
          {/* Dashboard Overview */}
          <Route
            index
            element={
              isNurse ? (
                <NurseDashboardOverview
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onProfileClick={handleProfileClick}
                  onAddUserClick={handleAddUser}
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
                        <p className="text-slate-500 font-medium mb-1">
                          {currentDate}
                        </p>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {getGreeting()},{" "}
                          <span className="text-blue-600">{displayName}</span> 👋
                        </h2>
                      </div>

                      <StatCards />

                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Left Column: Chart & Quick Actions */}
                        <div className="flex-1 space-y-4 min-w-0">
                          <AppointmentTrendChart />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QuickActions onAction={(id) => id === 'add_patient' ? handleAddUser('patient') : navigate(`/dashboard/${id}`)} />
                            <StatusDistribution />
                          </div>
                        </div>

                        {/* Right Column: Feeds & Status */}
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
            <Route
              index
              element={
                <UserManagementList
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onAddUserClick={handleAddUser}
                  onProfileClick={handleProfileClick}
                />
              }
            />
            <Route
              path="register-patient"
              element={
                <RegisterPatient
                  onSwitchView={() => navigate("/dashboard/users")}
                />
              }
            />
            <Route
              path="register-staff"
              element={
                <RegisterStaff
                  onSwitchView={() => navigate("/dashboard/users")}
                />
              }
            />
            <Route
              path="patient/:id"
              element={
                <PatientProfileDetail
                  onMenuClick={() => setIsSidebarOpen(true)}
                />
              }
            />
            <Route
              path="patient/edit/:id"
              element={<EditPatientProfilePage />}
            />
            <Route
              path="staff/:id"
              element={
                <StaffProfilePage onMenuClick={() => setIsSidebarOpen(true)} />
              }
            />
            <Route
              path="doctor/:id"
              element={
                <DoctorProfileDetail
                  onMenuClick={() => setIsSidebarOpen(true)}
                />
              }
            />
            <Route path="staff/edit/:id" element={<EditDoctorProfilePage />} />
          </Route>

          {/* Clinics */}
          <Route path="clinics">
            <Route
              index
              element={
                <ClinicsList
                  onAddClinic={() => navigate("/dashboard/clinics/add")}
                />
              }
            />
            <Route
              path="add"
              element={<AddClinic onCancel={() => navigate("/dashboard/clinics")} onSuccess={() => navigate("/dashboard/clinics")} />}
            />
            <Route
              path=":id"
              element={
                <ClinicDetails />
              }
            />
            <Route
              path="edit/:id"
              element={<EditClinic />}
            />
          </Route>

          {/* Lab Catalog */}
          <Route path="lab-catalog">
            <Route
              index
              element={
                <LabCatalogPage />
              }
            />
            <Route
              path=":id"
              element={
                <LabTestDetail />
              }
            />
            <Route
              path="edit/:id"
              element={
                <EditLabTest />
              }
            />
          </Route>

          {/* Appointments */}
          <Route path="appointments">
            <Route
              index
              element={
                <div className="flex-1 flex flex-col min-h-0">
                  <TopBar
                    title="Appointments"
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onProfileClick={handleProfileClick}
                    showAddUser={false}
                  />
                  <AppointmentManagementPage />
                </div>
              }
            />
            <Route
              path="new"
              element={<NewAppointmentPage />}
            />
            <Route
              path="edit/:id"
              element={<EditAppointmentPage />}
            />
          </Route>

          {/* Nurse Patients alias */}
          <Route
            path="patients"
            element={
              <UserManagementList
                onMenuClick={() => setIsSidebarOpen(true)}
                onAddUserClick={handleAddUser}
                onProfileClick={handleProfileClick}
              />
            }
          />

          {/* Other Routes */}
        <Route
            path="dr-schedule"
            element={
              isNurse ? (
                <NurseDrSchedulePage
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onProfileClick={handleProfileClick}
                />
              ) : (
                <DRSchedulePage
                  onMenuClick={() => setIsSidebarOpen(true)}
                  onAddUserClick={handleAddUser}
                  onProfileClick={handleProfileClick}
                />
              )
            }
          />
          <Route
            path="dr-schedule/details/:id"
            element={
              <NurseDrScheduleDetails
                onMenuClick={() => setIsSidebarOpen(true)}
                onProfileClick={handleProfileClick}
              />
            }
          />

          {/* User Profile */}
          <Route
            path="profile"
            element={
              user?.role === 'Admin' ? <AdminProfilePage /> : <ReceptionistProfile />
            }
          />
          <Route
            path="profile/edit"
            element={
              user?.role === 'Admin' ? <AdminProfilePage /> : <EditReceptionistProfile />
            }
          />

          {/* Nurse Specific Routes */}
          <Route
            path="patient-visit"
            element={
              <PatientVisitPage
                onMenuClick={() => setIsSidebarOpen(true)}
                onProfileClick={handleProfileClick}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
