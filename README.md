# 🏥 Nabd — Hospital Management System

> A comprehensive, role-based hospital management web application built as a graduation project. **Nabd** streamlines hospital operations by providing tailored dashboards and workflows for every medical staff role — from doctors and nurses to radiologists and lab technicians.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Application Routes](#application-routes)
- [Team](#team)

---

## Overview

**Nabd** is a full-featured Hospital Information System (HIS) designed to digitize and unify hospital workflows. The platform supports multiple staff roles, each with a dedicated interface tailored to their specific responsibilities — eliminating the need for separate systems while ensuring data security through role-based access control.

The application communicates with a RESTful backend API hosted at `https://nabd.runasp.net/api` and uses JWT-based authentication to enforce per-role access.

---

## ✨ Features

### 🔐 Authentication & Security
- Secure login with JWT access & refresh tokens
- Forgot password flow with OTP email verification
- Reset password with full validation
- Automatic session restoration on page refresh
- Token expiry detection with auto-logout

### 🎛️ Role-Based Dashboards
Each role has a fully customized dashboard with:
- Personalized sidebar navigation
- Live statistics and charts (powered by Recharts)
- Role-specific modules (see [User Roles](#user-roles))

### 👨‍⚕️ Doctor Module
- View and manage patient visits
- Access patient medical history
- Write clinical notes and referrals
- View personal schedule

### 🩺 Radiology Module
- Manage radiology exam queues and requests
- Start, scan, and report on radiology exams
- Draft and finalize radiology reports
- Review and sign off on completed results
- Manage exam room assignments

### 🧪 Lab Module
- Browse lab test catalog
- Process lab test requests
- View and manage lab orders

### 👩‍⚕️ Nurse Module
- Book lab and radiology appointments for patients
- Monitor active patient visits

### 🏥 Receptionist Module
- Register and manage patients
- Manage appointments

### 🔧 Admin Module
- Full user management (add, edit, remove staff & patients)
- Clinic management
- Schedule management
- System-wide statistics

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/) |
| **Routing** | [React Router DOM v6](https://reactrouter.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Auth** | JWT via [jwt-decode](https://github.com/auth0/jwt-decode) |
| **HTTP Client** | Native `fetch` API with a custom `fetchApi` wrapper |
| **Linting** | ESLint + TypeScript ESLint |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
src/
├── api/                    # API service functions per domain
│   ├── auth.ts             # Login, forgot password, OTP, reset
│   ├── staff.ts            # Staff CRUD operations
│   ├── patient.ts          # Patient management
│   ├── appointments.ts     # Appointment booking & management
│   ├── schedules.ts        # Doctor schedule APIs
│   ├── clinics.ts          # Clinic management
│   ├── labs.ts             # Lab test catalog & orders
│   ├── radiology*.ts       # Radiology workflow (exam, scan, report)
│   ├── visit.ts            # Patient visit management
│   ├── profile.ts          # Staff profile APIs
│   └── config.ts           # Base URL & shared fetchApi wrapper
│
├── components/
│   ├── AuthLayout.tsx       # Shared auth page wrapper
│   ├── LoginForm.tsx        # Login form component
│   ├── ForgotPasswordForm.tsx
│   ├── OtpVerificationForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── SuccessScreen.tsx
│   └── dashboard/          # All dashboard UI components
│       ├── Dashboard.tsx   # Main dashboard shell (sidebar + topbar)
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       ├── StatCards.tsx
│       ├── doctor/         # Doctor-specific components
│       ├── nurse/          # Nurse-specific components
│       ├── Radiology/      # Radiology workflow components
│       ├── radiologist/    # Radiologist profile components
│       ├── lab/            # Lab technician components
│       ├── lapCatalog/     # Lab catalog management
│       ├── RECEPTIONIST/   # Receptionist components
│       ├── appointments/   # Appointment management
│       ├── patients/       # Patient management
│       ├── staff/          # Staff management
│       ├── users/          # User management
│       ├── clinics/        # Clinic management
│       ├── schedule/       # Schedule management
│       ├── profile/        # Staff profile pages
│       ├── charts/         # Chart components
│       ├── widgets/        # Reusable widgets
│       └── shared/         # Shared UI components
│
├── context/
│   └── AuthContext.tsx     # Auth state, JWT decode, role flags
│
├── hooks/                  # Custom React hooks
├── layouts/
│   └── AuthLayout.tsx      # Auth pages layout wrapper
│
├── pages/
│   └── auth/               # Auth page components (Login, OTP, etc.)
│
├── routes/
│   ├── AppRoutes.tsx       # Main router with protected routes
│   ├── ProtectedRoute.tsx  # Auth guard HOC
│   └── routePaths.ts       # Centralized route constants
│
├── store/
│   ├── store.ts            # Redux store configuration
│   ├── hooks.ts            # Typed useAppDispatch / useAppSelector
│   └── api/                # RTK Query API slices
│
├── types/                  # Shared TypeScript types & interfaces
└── utils/                  # Utility/helper functions
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AmnaZaher/Nabd.git
cd Nabd

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 👥 User Roles

The system supports **5 distinct staff roles**, each with dedicated access and UI:

| Role | Access Level | Key Capabilities |
|---|---|---|
| **Admin** | Full system access | User management, clinic config, statistics |
| **Doctor** | Clinical workflows | Patient visits, medical records, schedules |
| **Nurse** | Coordination tasks | Book lab & radiology appointments, patient monitoring |
| **Radiologist** | Imaging workflows | Exam queues, scanning, drafting & finalizing reports |
| **Lab Technician** | Lab workflows | Process test orders, manage lab catalog |
| **Receptionist** | Front desk | Patient registration, appointment booking |

Role detection is handled automatically from the decoded JWT token at login. The sidebar navigation and available routes adjust dynamically based on the logged-in user's role.

---

## 🗺️ Application Routes

### Public (Auth) Routes
| Path | Description |
|---|---|
| `/` | Login page |
| `/forgot-password` | Request password reset via email |
| `/verify-otp` | Enter OTP code sent to email |
| `/reset-password` | Set a new password |
| `/success` | Password reset confirmation screen |

### Protected Dashboard Routes
| Path | Description |
|---|---|
| `/dashboard` | Main dashboard with role-specific widgets |
| `/dashboard/users` | User management (Admin) |
| `/dashboard/users/staff` | Staff profile detail |
| `/dashboard/users/patient` | Patient profile detail |
| `/dashboard/appointments` | Appointment management |
| `/dashboard/dr-schedule` | Doctor schedule (Admin view) |
| `/dashboard/doctor-schedule` | Doctor's own schedule |
| `/dashboard/radiology/*` | Full radiology workflow |
| `/dashboard/lab-catalog` | Lab test catalog |
| `/dashboard/lab-test` | Lab test management |
| `/dashboard/lab-test-request` | Lab test orders |
| `/dashboard/clinics` | Clinic management |
| `/dashboard/profile` | Staff profile |
| `/dashboard/patient-visit` | Patient visit management |
| `/dashboard/receptionist-profile` | Receptionist profile |
| `/dashboard/doctor-visits` | Doctor's patient visits |
| `/dashboard/nurse/book-lab-appointment` | Nurse: book lab appointment |
| `/dashboard/nurse/book-radiology-appointment` | Nurse: book radiology appointment |

---

## 👨‍💻 Team

This project is a graduation project developed by a team of dedicated students.

**Frontend Development** — Built with React, TypeScript & Tailwind CSS  
**Backend Development** — RESTful API at `https://nabd.runasp.net/api`

---

## 📄 License

© 2025 AmnaZaher and Nabd Team. All Rights Reserved.

This project is developed for academic purposes as a graduation project. You may not copy, modify, distribute, or use this code without explicit permission.

---

<div align="center">
  <p>Made with ❤️ as a Graduation Project</p>
</div>
