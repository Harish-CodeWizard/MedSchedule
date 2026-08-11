import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  LogOut, 
  Home, 
  Settings, 
  Heart, 
  Shield, 
  Stethoscope, 
  Pill, 
  Activity, 
  FileText, 
  Menu,
  X 
} from "lucide-react";
import userStore from "../store/userStore";

function HomePage() {
  const { logoutUser, user } = userStore();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      clearTimeout(timer);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/persona-select");
  };

  const handleDashboard = () => {
    switch (user.role) {
      case "Admin": navigate("/admin-dashboard"); break;
      case "Reception": navigate("/reception-dashboard"); break;
      case "Doctor": navigate("/doctor-dashboard"); break;
      case "Lab": navigate("/lab-dashboard"); break;
      case "X-Ray": navigate("/xray-dashboard"); break;
      case "Pharmacy": navigate("/pharmacy-dashboard",{ state: {name:user.name  } }); break;
      case "Patient": navigate("/patient-dashboard"); break;
      default: navigate("/"); 
    }
    setIsMobileMenuOpen(false);
  };

  const roleConfig = {
    "Admin": { icon: <Shield className="w-5 h-5" />, color: "from-purple-500 to-pink-500" },
    "Reception": { icon: <FileText className="w-5 h-5" />, color: "from-blue-500 to-cyan-500" },
    "Doctor": { icon: <Stethoscope className="w-5 h-5" />, color: "from-green-500 to-teal-500" },
    "Lab": { icon: <Activity className="w-5 h-5" />, color: "from-amber-500 to-orange-500" },
    "X-Ray": { icon: <Activity className="w-5 h-5" />, color: "from-amber-500 to-orange-500" },
    "Pharmacy": { icon: <Pill className="w-5 h-5" />, color: "from-red-500 to-rose-500" },
    "Patient": { icon: <Heart className="w-5 h-5" />, color: "from-green-500 to-emerald-500" },
  };

  const config = roleConfig[user?.role] || { 
    icon: <User className="w-5 h-5" />, 
    color: "from-gray-500 to-slate-500" 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Top Navbar - Mobile Optimized */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-3 shadow-xl md:px-6 md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Menu Button */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
            <h1 className="text-lg font-bold md:text-2xl md:tracking-tight">
              MediCare Hospital
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isMobile ? (
              <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${config.color}`}>
                {React.cloneElement(config.icon, { className: "w-5 h-5" })}
              </div>
            ) : (
              <>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm`}>
                  <div className={`p-2 rounded-full bg-gradient-to-r ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="hidden md:block text-white">
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-sm opacity-80">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex btn btn-sm bg-white/20 hover:bg-white/30 border-0 text-white items-center gap-2 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile User Info Bar */}
        {isMobile && (
          <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center">
            <div className="text-white">
              <div className="font-semibold text-sm">{user?.name}</div>
              <div className="text-xs opacity-80">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown via menu */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform' : 'relative'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
          w-64 bg-white/95 backdrop-blur-md shadow-xl p-6 flex flex-col gap-6
          border-r border-slate-200 md:translate-x-0 md:relative md:flex
          ${isMobile && 'overflow-y-auto'}
        `}>
          {/* Close button for mobile */}
          {isMobile && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Navigation</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}

          {!isMobile && (
            <h2 className="text-xl font-bold text-slate-800 mb-4">Navigation</h2>
          )}

          <button
            className="btn btn-lg bg-gradient-to-r from-indigo-500 to-purple-600 border-0 text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 shadow-lg w-full"
            onClick={handleDashboard}
          >
            <Home className="w-5 h-5" /> Go to Dashboard
          </button>
          
          <button
            className="btn btn-outline border-slate-300 hover:text-amber-50 text-slate-700 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 w-full"
            onClick={() => {
              navigate("profile");
              setIsMobileMenuOpen(false);
            }}
          >
            <Settings className="w-5 h-5" /> Profile
          </button>

          {!isMobile && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg shadow-inner">
              <h3 className="text-sm font-semibold text-indigo-700 mb-2">Quick Info</h3>
              <p className="text-slate-700 text-sm mb-1">Role: {user?.role}</p>
              <p className="text-slate-700 text-sm">Access your dashboard for more details</p>
            </div>
          )}
        </aside>

        {/* Overlay for mobile menu */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 animate-pulse">
              <div className="h-6 md:h-8 bg-slate-200 rounded w-1/2 md:w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 md:w-2/3 mb-6"></div>
              <div className="h-10 md:h-12 bg-slate-200 rounded w-1/2 md:w-1/4"></div>
            </div>
          ) : (
            <>
              {/* Welcome Card - Mobile Optimized */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border border-white/50 animate-fadeInUp">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg`}>
                    {React.cloneElement(config.icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                      Welcome back, <span className="text-indigo-700">{user?.name}</span>
                    </h2>
                    <p className="text-slate-600 text-sm md:text-base mt-2">
                      You're logged in as <span className="font-semibold text-indigo-600">{user?.role}</span>
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 mb-6 text-sm md:text-base">
                  Use the menu to navigate to your dashboard or profile settings.
                </p>

                {/* Mobile Quick Actions - Only on mobile */}
                {isMobile && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={handleDashboard}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                    >
                      <Home className="w-5 h-5" /> Dashboard
                    </button>
                    <button
                      onClick={() => navigate("profile")}
                      className="bg-white border border-slate-300 text-slate-700 font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-5 h-5" /> Profile
                    </button>
                  </div>
                )}

                <button
                  onClick={handleDashboard}
                  className="btn btn-lg bg-gradient-to-r from-indigo-600 to-purple-700 border-0 text-white w-full md:w-auto px-6 py-4 font-semibold rounded-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  <Home className="w-5 h-5 mr-2 inline" /> 
                  {isMobile ? 'Open Dashboard' : 'Launch My Dashboard'}
                </button>
              </div>

              {/* Mobile Navigation Hint */}
              {isMobile && !isMobileMenuOpen && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500">
                    Tap the menu button in top-left for more options
                  </p>
                </div>
              )}

              <div className="mt-8 text-center text-slate-500 text-xs md:text-sm">
                MediCare Hospital © {new Date().getFullYear()} • Secure & Compliant
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Alternative */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 shadow-2xl">
          <div className="flex justify-around">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center p-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Menu className="w-5 h-5 mb-1" />
              <span className="text-xs">Menu</span>
            </button>
            <button
              onClick={handleDashboard}
              className="flex flex-col items-center p-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs">Dashboard</span>
            </button>
            <button
              onClick={() => navigate("profile")}
              className="flex flex-col items-center p-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;


