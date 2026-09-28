"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function StaffLogin() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginStaff(username, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.error || "Invalid username or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF] p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-500/20 rounded-full blur-[100px] animate-float pointer-events-none" />
      
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-[0_24px_64px_rgba(37,99,235,0.12)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-white">
        
        {/* Left Side: Branding / Info Panel */}
        <div className="w-full md:w-5/12 bg-gradient-blue p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-sm font-bold mb-12">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="Logo"
              className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg mb-6"
            />
            
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] mb-4">
              Clinical &amp; <br/>Staff Portal
            </h1>
            <p className="text-blue-100 text-[15px] font-medium leading-relaxed max-w-sm">
              Access the secure dashboard to manage IEP cycles, track therapy pathways, and publish progress reports.
            </p>
          </div>

          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-blue-200 shrink-0" />
              <div>
                <h4 className="font-bold text-[13px] text-white">HIPAA Compliant System</h4>
                <p className="text-[11px] text-blue-200 font-medium mt-1">All clinical records and assessment data are securely encrypted.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-14 lg:p-16 bg-white flex items-center justify-center relative">
          <div className="w-full max-w-[380px] space-y-8 animate-fade-in">
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-[14px] text-slate-500 font-medium mt-1.5">Enter your staff credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Staff Username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr.radha"
                error={error ? " " : ""} // Suppress text, let border show
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  error={error}
                  icon={Lock}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-[34px] p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth size="xl" loading={loading}>
                  Access Portal
                </Button>
              </div>
            </form>

            <div className="text-center space-y-2">
              <p className="text-[13px] text-slate-500 font-medium">
                Trouble logging in? <button className="text-blue-600 font-bold hover:underline cursor-pointer">Contact IT Support</button>
              </p>
              <p className="text-[13px] text-slate-500 font-medium">
                Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline cursor-pointer">Register here</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
