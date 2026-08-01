"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";

export default function StaffLogin() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await loginStaff(username, password);
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#EEF4FB] p-4 text-[#2C2C2A]">
      <div className="w-[400px] max-w-full bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
        
        {/* Logo & Subtitle */}
        <div className="text-center">
          <h1 className="text-[22px] font-bold text-[#185FA5] tracking-tight">
            Kids Care Rehab Centre
          </h1>
          <p className="text-[#9B9A96] text-[14px] font-medium mt-0.5">
            Physio Care
          </p>
        </div>

        <hr className="border-[#D3D1C7]/60" />

        <h2 className="text-[16px] font-bold text-[#2C2C2A]">Staff Login</h2>

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
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
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
                placeholder="Password"
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
            Login
          </Button>
        </form>

        <p className="text-[12px] text-[#9B9A96] text-center">
          Forgot your login? Contact administrator.
        </p>

        <div className="flex items-center gap-2 my-2">
          <hr className="flex-1 border-[#D3D1C7]/60" />
          <span className="text-xs text-[#9B9A96] font-bold">Parent?</span>
          <hr className="flex-1 border-[#D3D1C7]/60" />
        </div>

        <Button
          variant="ghost"
          fullWidth
          onClick={() => navigate("/parent/login")}
          className="text-xs font-bold text-[#185FA5]"
        >
          Go to Parent Portal →
        </Button>

        {/* Demo Helper */}
        <div className="pt-2 text-[10px] text-[#9B9A96] border-t border-[#D3D1C7]/40 space-y-0.5">
          <p className="font-bold text-[#185FA5]">Demo Credentials:</p>
          <div className="flex justify-between">
            <span>Admin: <strong>admin / admin123</strong></span>
            <span>Staff: <strong>priya / staff123</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
