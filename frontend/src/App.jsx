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

// ProtectedRoute component (role + auth based)
const ProtectedRoute = ({ isAuth, userRole, allowedRoles, children }) => {
  if (!isAuth) return <Navigate to="/" />;
  if (!allowedRoles.includes(userRole)) return <Navigate to="/" />;
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
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Admin','Reception','Doctor','Lab','X-Ray','Pharmacy','Patient']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Admin']}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reception-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Reception']}>
              <Reception />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Doctor']}>
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
      allowedRoles={['Doctor']}
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
      allowedRoles={['Doctor']}
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
      allowedRoles={['Doctor']}
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
      allowedRoles={['Pharmacy']}
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
      allowedRoles={['Pharmacy']}
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
      allowedRoles={['Lab']}
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
      allowedRoles={['X-Ray']}
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
      allowedRoles={['Doctor']}
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
      allowedRoles={['X-Ray']}
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
      allowedRoles={['X-Ray']}
    >
      <WalkInXrayRecords />
    </ProtectedRoute>
  }
/>
 


        <Route
          path="/lab-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Lab']}>
              <Lab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/xray-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['X-Ray']}>
              <Xray />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pharmacy-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Pharmacy']}>
              <Pharmacy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} userRole={user?.role} allowedRoles={['Patient']}>
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
