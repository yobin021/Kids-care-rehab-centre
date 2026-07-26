"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FlameKindling } from "lucide-react";

export default function Login() {
  const { setIsLoggedIn, setUserRole, setActiveTab } = useDashboard();
  const [role, setRole] = useState<"Admin" | "Staff" | "Parent">("Admin");
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRoleChange = (selectedRole: "Admin" | "Staff" | "Parent") => {
    setRole(selectedRole);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map UI role to context userRole
    let mappedRole: "admin" | "therapist" | "parent" = "admin";
    if (role === "Staff") mappedRole = "therapist";
    if (role === "Parent") mappedRole = "parent";
    
    setUserRole(mappedRole);
    
    // Select default active tab based on role
    if (mappedRole === "admin") {
      setActiveTab("dashboard");
    } else if (mappedRole === "parent") {
      setActiveTab("parent-home");
    } else {
      setActiveTab("therapist-home");
    }
    
    setIsLoggedIn(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Registration is a UI Demo. Please use the Login form to sign in.");
    setIsRegister(false);
  };

  // Helper to suggest test credentials for demo purposes
  const getSuggestedCredentials = () => {
    switch (role) {
      case "Admin":
        return { email: "admin@kidscare.com", pass: "admin123" };
      case "Staff":
        return { email: "ananya.das@kidscare.com", pass: "staff123" };
      case "Parent":
        return { email: "vikram.patel@kidscare.com", pass: "parent123" };
      default:
        return { email: "admin@kidscare.com", pass: "admin123" };
    }
  };

  const creds = getSuggestedCredentials();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f7fb] py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <FlameKindling className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">
            Kids Care
          </h1>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none block mt-1">
            Rehab Centre
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-[420px] max-w-full bg-white p-[30px] rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        {/* Role Buttons */}
        <div className="flex gap-2.5 mb-[25px]">
          {(["Admin", "Staff", "Parent"] as const).map((roleVal) => (
            <button
              key={roleVal}
              type="button"
              onClick={() => handleRoleChange(roleVal)}
              className={`flex-1 h-[45px] border-none rounded-lg font-semibold text-[15px] cursor-pointer transition-all duration-300 ${
                role === roleVal
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-[#e5e7eb] text-[#333] hover:bg-[#d1d5db]"
              }`}
            >
              {roleVal}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLogin} id="loginForm" className="space-y-[18px]">
            <h2 id="loginTitle" className="text-[30px] font-bold text-[#111827] mb-[20px] leading-tight">
              {role} Login
            </h2>

            <div className="space-y-[18px]">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[48px] border border-[#d1d5db] rounded-lg px-[15px] text-[15px] outline-none transition-all duration-300 focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] border border-[#d1d5db] rounded-lg px-[15px] text-[15px] outline-none transition-all duration-300 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] border-none rounded-lg bg-[#6d4aff] hover:bg-[#5a3be0] text-white font-semibold text-base cursor-pointer transition-all duration-300 shadow-sm mt-2"
            >
              Login
            </button>

            <p className="mt-[18px] text-center text-[#6b7280] text-[15px]">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(true);
                }}
                className="text-[#6d4aff] font-semibold hover:underline transition-colors"
              >
                Sign Up
              </a>
            </p>

            {/* Test Credentials Helper Card */}
            <div className="mt-6 p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-600">
              <span className="font-bold text-blue-800 uppercase tracking-wider block mb-1">Demo Credentials:</span>
              <div className="flex justify-between mt-1 text-[11px] sm:text-xs gap-1 flex-wrap">
                <span>Email: <code className="bg-white px-1 py-0.5 rounded border">{creds.email}</code></span>
                <span>Pass: <code className="bg-white px-1 py-0.5 rounded border">{creds.pass}</code></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(creds.email);
                  setPassword(creds.pass);
                }}
                className="mt-2 w-full text-center text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
              >
                Auto-fill credentials
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} id="registerForm" className="space-y-[18px]">
            <h2 id="registerTitle" className="text-[30px] font-bold text-[#111827] mb-[20px] leading-tight">
              {role} Register
            </h2>

            <div className="space-y-[18px]">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-[48px] border border-[#d1d5db] rounded-lg px-[15px] text-[15px] outline-none transition-all duration-300 focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[48px] border border-[#d1d5db] rounded-lg px-[15px] text-[15px] outline-none transition-all duration-300 focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] border border-[#d1d5db] rounded-lg px-[15px] text-[15px] outline-none transition-all duration-300 focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[48px] border border-[#d1d5db] rounded-lg px-[15px] text-[15px] outline-none transition-all duration-300 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] border-none rounded-lg bg-[#6d4aff] hover:bg-[#5a3be0] text-white font-semibold text-base cursor-pointer transition-all duration-300 shadow-sm mt-2"
            >
              Register
            </button>

            <p className="mt-[18px] text-center text-[#6b7280] text-[15px]">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(false);
                }}
                className="text-[#6d4aff] font-semibold hover:underline transition-colors"
              >
                Login
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
