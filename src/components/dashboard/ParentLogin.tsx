"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Heart, AlertCircle, Phone } from "lucide-react";

export default function ParentLogin() {
  const { parentLogin } = useDashboard();
  const [phone, setPhone] = useState("9841000001");
  const [password, setPassword] = useState("parent123");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const res = parentLogin(phone, password);
    if (!res.success) {
      setErrorMsg(res.message || "Incorrect phone number or password. Please check with your therapist.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F8F6] p-4 text-[#2C2C2A]">
      <div className="w-[420px] max-w-full bg-[#FFFFFF] p-8 rounded-[16px] border border-[#D3D1C7] shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-6">
        
        {/* Header Logo & Tagline */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center mx-auto">
            <Heart className="h-6 w-6 fill-[#185FA5]/20" />
          </div>
          <h1 className="text-2xl font-black text-[#185FA5] tracking-tight">
            Kids Care Rehab Centre
          </h1>
          <p className="text-xs font-bold text-[#0F6E56]">
            &quot;Your child&apos;s progress, in your hands.&quot;
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded-[8px] bg-[#993C1D]/10 border border-[#993C1D]/30 text-[#993C1D] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-[#2C2C2A] mb-1">
              Registered Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your registered phone number"
              className="w-full h-11 px-3.5 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5] transition-colors"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2C2C2A] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-11 px-3.5 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#185FA5] hover:bg-[#12487e] text-white rounded-[8px] text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
          >
            Login to Parent Portal
          </button>
        </form>

        {/* Help Footer */}
        <div className="pt-4 border-t border-[#D3D1C7]/60 text-center space-y-1">
          <p className="text-[11px] text-[#5F5E5A]">
            Login details were provided by your child&apos;s therapist.
          </p>
          <p className="text-[11px] font-bold text-[#185FA5] flex items-center justify-center gap-1">
            <Phone className="h-3 w-3" />
            If you need help, contact Kids Care Rehab Centre: 044-28353136
          </p>
        </div>

        {/* Quick Helper for Demo Credentials */}
        <div className="pt-2 text-[10px] text-slate-400 text-center">
          Demo Parent Login: <strong className="text-[#2C2C2A]">9841000001</strong> / <strong className="text-[#2C2C2A]">parent123</strong>
        </div>

      </div>
    </div>
  );
}
