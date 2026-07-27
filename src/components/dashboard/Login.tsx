"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const { login } = useDashboard();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const res = login(username, password);
    if (!res.success) {
      setErrorMessage("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F8F6] p-4 text-[#2C2C2A] font-sans">
      <div className="w-[400px] max-w-full bg-[#FFFFFF] p-8 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <h1 className="text-[20px] font-extrabold text-[#185FA5] tracking-tight leading-tight">
            Kids Care Rehab Centre
          </h1>
          <p className="text-[13px] font-semibold text-[#5F5E5A] mt-1">
            Clinic Management System
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-[8px] bg-[#993C1D]/10 border border-[#993C1D]/30 text-[#993C1D] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C2C2A] mb-1">
              Username / Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C2C2A] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-[#185FA5] hover:bg-[#12487e] text-white rounded-[8px] text-xs font-extrabold transition-colors cursor-pointer"
          >
            Login
          </button>
        </form>

        {/* Helper Footer */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#5F5E5A]">
            Forgot your login? Contact your administrator.
          </p>
        </div>

        {/* Quick Helper for Demo Credentials */}
        <div className="mt-6 pt-4 border-t border-[#D3D1C7]/60 text-[11px] text-[#5F5E5A] space-y-1">
          <p className="font-bold text-[#185FA5]">Mock Credentials for Demo:</p>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => { setUsername("admin"); setPassword("admin123"); }}
              className="text-left p-1 bg-[#F8F8F6] rounded hover:bg-slate-200 border border-[#D3D1C7]/50"
            >
              <strong className="block text-[#2C2C2A]">Admin:</strong> admin / admin123
            </button>
            <button
              type="button"
              onClick={() => { setUsername("priya"); setPassword("staff123"); }}
              className="text-left p-1 bg-[#F8F8F6] rounded hover:bg-slate-200 border border-[#D3D1C7]/50"
            >
              <strong className="block text-[#2C2C2A]">Staff (Priya):</strong> priya / staff123
            </button>
            <button
              type="button"
              onClick={() => { setUsername("meena"); setPassword("staff456"); }}
              className="text-left p-1 bg-[#F8F8F6] rounded hover:bg-slate-200 border border-[#D3D1C7]/50"
            >
              <strong className="block text-[#2C2C2A]">Staff (Meena):</strong> meena / staff456
            </button>
            <button
              type="button"
              onClick={() => { setUsername("parent@email.com"); setPassword("parent123"); }}
              className="text-left p-1 bg-[#F8F8F6] rounded hover:bg-slate-200 border border-[#D3D1C7]/50"
            >
              <strong className="block text-[#2C2C2A]">Parent:</strong> parent@email.com / parent123
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
