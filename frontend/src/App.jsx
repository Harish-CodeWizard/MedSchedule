import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import userStore from "./store/userStore";

// Pages
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotEmailPage from "./pages/ForgotEmailPage";
import NewPasswordPage from "./pages/NewPasswordPage";
import VerifyForgotPage from "./pages/VerifyForgotPage";
import PersonaSelect from "./pages/PersonaSelect";

// Dashboards
import Doctor from "./pages/Dashboards/Doctor";
import Admin from "./pages/Dashboards/Admin";
import Reception from "./pages/Dashboards/Reception";
import Lab from "./pages/Dashboards/Lab";
import Xray from "./pages/Dashboards/Xray";
import Pharmacy from "./pages/Dashboards/Pharmacy";
import Patient from "./pages/Dashboards/Patient";
import Medicine from "./pages/supportivePages/Medicine";
import RecommendTest from "./pages/supportivePages/RecommendTest";
import RecommendXray from "./pages/supportivePages/RecommendXray";
import PharmacyRecords from "./pages/Dashboards/PharmacyRecords";
import WalkInPharmacyRecords from "./pages/supportivePages/WalkInPatientMedicine";
import LabTest from "./pages/supportivePages/LabTest";
import XrayTest from "./pages/supportivePages/XrayTest";
import PatientDetailsByDoctor from "./pages/supportivePages/PatientDetailsByDoctor";
import XrayPatientRegistration from "./pages/supportivePages/XrayPatientRegistration";
import WalkInXrayRecords from "./pages/supportivePages/XrayWalkInRecord";

const normalizeRole = (role) => {
  const map = {
    Admin: "ADMIN/RECEPTIONIST",
    Reception: "ADMIN/RECEPTIONIST",
    Doctor: "DOCTOR",
    Pharmacy: "PHARMACIST",
    Patient: "PATIENT",
    Lab: "LAB",
    "X-Ray": "XRAY",
  };

  return map[role] || role;
};

// ProtectedRoute component (role + auth based)
const ProtectedRoute = ({ isAuth, userRole, allowedRoles, children }) => {
  const normalizedRole = normalizeRole(userRole);
  if (!isAuth) return <Navigate to="/" />;
  if (!allowedRoles.includes(normalizedRole)) return <Navigate to="/" />;
  return children;
};

function App() {
  const { isAuth, checkAuth, isCheckingAuth, user } = userStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !isAuth)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme="retro">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!isAuth ? <PersonaSelect /> : <HomePage />} />
        <Route path="/signup" element={!isAuth ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/verify-email" element={!isAuth ? <VerifyEmailPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuth ? <ForgotEmailPage /> : <Navigate to="/" />} />
        <Route path="/verify-forgot" element={!isAuth ? <VerifyForgotPage /> : <Navigate to="/" />} />
        <Route path="/new-password" element={!isAuth ? <NewPasswordPage /> : <Navigate to="/" />} />
        <Route path="/persona-select" element={!isAuth ? <PersonaSelect /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['ADMIN/RECEPTIONIST','DOCTOR','LAB','XRAY','PHARMACIST','PATIENT']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['ADMIN/RECEPTIONIST']}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['ADMIN/RECEPTIONIST']}>
              <Reception />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['DOCTOR']}>
              <Doctor />
            </ProtectedRoute>
          }
        />

   <Route
  path="/medicine"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['DOCTOR']}
    >
      <Medicine />
    </ProtectedRoute>
  }
/>
   <Route
  path="/recommendTest"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['DOCTOR']}
    >
      <RecommendTest />
    </ProtectedRoute>
  }
/>
   <Route
  path="/recommendXray"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['DOCTOR']}
    >
      <RecommendXray />
    </ProtectedRoute>
  }
/>
   <Route
  path="/pharmacyRecords"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['PHARMACIST']}
    >
      <PharmacyRecords />
    </ProtectedRoute>
  }
/>
   <Route
  path="/WalkInRecords"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['PHARMACIST']}
    >
      <WalkInPharmacyRecords />
    </ProtectedRoute>
  }
/>
   <Route
  path="/labTest"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['LAB']}
    >
      <LabTest />
    </ProtectedRoute>
  }
/>
 
   <Route
  path="/xrayTest"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['XRAY']}
    >
      <XrayTest />
    </ProtectedRoute>
  }
/>
 
   <Route
  path="/patientDetailsByDoctor"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['DOCTOR']}
    >
      <PatientDetailsByDoctor />
    </ProtectedRoute>
  }
/>
 
   <Route
  path="/walkin-registration"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['XRAY']}
    >
      <XrayPatientRegistration />
    </ProtectedRoute>
  }
/>
 
   <Route
  path="/walkin-record"
  element={
    <ProtectedRoute
      isAuth={isAuth}
      userRole={user?.role}
      allowedRoles={['XRAY']}
    >
      <WalkInXrayRecords />
    </ProtectedRoute>
  }
/>
 


        <Route
          path="/lab-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['LAB']}>
              <Lab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/xray-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['XRAY']}>
              <Xray />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pharmacy-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['PHARMACIST']}>
              <Pharmacy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['PATIENT']}>
              <Patient />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
