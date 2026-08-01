"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Phone } from "lucide-react";
import Button from "../components/ui/Button";

export default function ParentLogin() {
  const { loginParent } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("9841000001");
  const [password, setPassword] = useState("parent123");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await loginParent(phone, password);
    if (res.success) {
      navigate("/parent/home");
    } else {
      setError(res.error || "Incorrect phone number or password. Please check with your therapist.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8] p-4 text-[#2C2C2A]">
      <div className="w-[400px] max-w-full bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
        
        {/* Logo & Tagline */}
        <div className="text-center">
          <h1 className="text-[20px] font-bold text-[#185FA5] tracking-tight">
            Kids Care Rehab Centre
          </h1>
          <p className="text-[#9B9A96] italic text-[13px] font-medium mt-0.5">
            &quot;Your child&apos;s progress, in your hands.&quot;
          </p>
        </div>

        <hr className="border-[#D3D1C7]/60" />

        <h2 className="text-[16px] font-bold text-[#2C2C2A]">Parent Portal Login</h2>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-[8px] bg-[#993C1D]/10 border border-[#993C1D]/30 text-[#993C1D] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C2C2A] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C2C2A] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-10 pl-3 pr-10 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-[#5F5E5A] hover:text-[#2C2C2A] cursor-pointer"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth className="h-[44px] text-sm">
            Login to Parent Portal
          </Button>
        </form>

        <div className="text-[12px] text-[#5F5E5A] text-center space-y-1 pt-1">
          <p>Your login details were given to you by your child&apos;s therapist.</p>
          <p className="font-bold text-[#185FA5] flex items-center justify-center gap-1">
            <Phone className="h-3 w-3" />
            Need help? Call us: 044-28353136
          </p>
        </div>

        <div className="pt-2 text-center border-t border-[#D3D1C7]/40">
          <Link to="/login" className="text-xs text-[#9B9A96] hover:text-[#2C2C2A] font-bold">
            ← Back to Staff Login
          </Link>
        </div>

        <div className="pt-1 text-[10px] text-[#9B9A96] text-center">
          Mock Parent Login: <strong>9841000001 / parent123</strong>
        </div>

      </div>
    </div>
  );
}
