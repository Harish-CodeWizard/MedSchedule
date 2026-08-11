import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Clipboard, Stethoscope, Activity, Box, Camera, Pill, Heart, Zap } from "lucide-react"; // All icons
import AuthImagePattern from "../components/AuthImagePattern";

function PersonaSelect() {
  const navigate = useNavigate();

  
const roles = [
  { name: "Admin", icon: User },            
  { name: "Reception", icon: Clipboard },  
  { name: "Doctor", icon: Stethoscope },    
  { name: "Lab", icon: Activity },     
  { name: "X-Ray", icon: Zap },        
  { name: "Pharmacy", icon: Pill },   
  { name: "Patient", icon: Heart },   
];

  const handleRoleSelect = (role) => {
    navigate("/signup", { state: { role } });
  };
   const handle = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Role selection */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 group">
            <div
              className="size-12 rounded-xl bg-primary/10 flex items-center justify-center
              group-hover:bg-primary/20 transition-colors"
            >
              <User className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mt-2">Welcome to HMS</h1>
            <p className="text-base-content/60 text-center">
              Select your role to continue
            </p>
          </div>
          <div className="text-center">
<p className="text-base-content/60">
Already have an account?{" "}
<span onClick={() => handle()} className="link link-primary">
Sign in
</span>
</p>
</div>

          {/* Role Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
            {roles.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => handleRoleSelect(name)}
                className="flex flex-col items-center justify-center gap-2 p-6 border rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Icon className="w-8 h-8 text-primary" />
                <span className="font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Pattern */}
      <AuthImagePattern
        title="Hospital Management System"
        subtitle="Select your role and access your personalized dashboard securely."
      />
    </div>
  );
}

export default PersonaSelect;
