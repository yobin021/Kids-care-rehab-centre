"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FlameKindling, ArrowRight, Sparkles } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50 to-indigo-50/40 py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 px-3 py-2 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
          <FlameKindling className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">
            Kids Care
          </h1>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none block mt-1.5">
            Rehab Centre
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-[420px] max-w-full bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] animate-scale-in">
        
        {/* Role Switcher Pill */}
        <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl mb-7 border border-slate-200/20">
          {(["Admin", "Staff", "Parent"] as const).map((roleVal) => (
            <button
              key={roleVal}
              type="button"
              onClick={() => handleRoleChange(roleVal)}
              className={`flex-1 h-9 rounded-xl font-extrabold text-xs cursor-pointer transition-all duration-300 ${
                role === roleVal
                  ? "bg-white text-slate-850 shadow-sm border border-slate-200/10"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {roleVal}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLogin} id="loginForm" className="space-y-[18px]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-3 w-3" />
                {role} Console
              </div>
              <h2 id="loginTitle" className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                Welcome Back
              </h2>
              <p className="text-xs font-semibold text-slate-450">Please enter your credentials below.</p>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white bg-slate-50/50"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center gap-2 border-none rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-md shadow-blue-500/10 mt-4 group"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            <p className="mt-5 text-center text-slate-500 text-xs font-bold">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(true);
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Sign Up
              </a>
            </p>

            {/* Test Credentials Helper Card */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/50 text-[11px] font-semibold text-slate-600">
              <span className="font-extrabold text-blue-750 uppercase tracking-wider block mb-1">Demo Account Credentials:</span>
              <div className="space-y-1 mt-2 text-slate-500">
                <div className="flex justify-between border-b border-blue-100/20 pb-1">
                  <span>Username:</span>
                  <code className="bg-white/80 px-1.5 py-0.5 rounded border border-blue-150/30 text-[10px] font-bold text-slate-750">{creds.email}</code>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Password:</span>
                  <code className="bg-white/80 px-1.5 py-0.5 rounded border border-blue-150/30 text-[10px] font-bold text-slate-750">{creds.pass}</code>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(creds.email);
                  setPassword(creds.pass);
                }}
                className="mt-3 w-full text-center text-blue-600 hover:text-blue-800 font-extrabold hover:underline cursor-pointer"
              >
                Auto-fill credentials
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} id="registerForm" className="space-y-[18px]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
                Create Account
              </div>
              <h2 id="registerTitle" className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                Get Started
              </h2>
              <p className="text-xs font-semibold text-slate-450">Join Kids Care Rehab Centre today.</p>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white bg-slate-50/50"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white bg-slate-50/50"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white bg-slate-50/50"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 flex items-center justify-center gap-2 border-none rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-md shadow-blue-500/10 mt-4"
            >
              Create Account
            </button>

            <p className="mt-5 text-center text-slate-500 text-xs font-bold">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(false);
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
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
