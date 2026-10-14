"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, HeartHandshake, ArrowLeft, Phone, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ParentLogin() {
  const { loginParent } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginParent(phone, password);
      if (res.success) {
        navigate("/parent/home");
      } else {
        setError(res.error || "Incorrect phone number or password. Please check with your therapist.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF] p-4 sm:p-8 font-sans selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-emerald-500/20 rounded-full blur-[100px] animate-float pointer-events-none" />
      
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-[0_24px_64px_rgba(5,150,105,0.12)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-white">
        
        {/* Left Side: Branding / Info Panel */}
        <div className="w-full md:w-5/12 bg-gradient-emerald p-6 sm:p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-100 hover:text-white transition-colors text-sm font-bold mb-6 sm:mb-12">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg mb-4 sm:mb-6"
            />
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] mb-2 sm:mb-4">
              Parent <br className="hidden sm:inline" />Family Portal
            </h1>
            <p className="text-emerald-100 text-xs sm:text-[15px] font-medium leading-relaxed max-w-sm">
              Stay connected with your child's progress. Access IEP milestones, therapy reports, and daily home exercises all in one place.
            </p>
          </div>

          <div className="relative z-10 mt-6 sm:mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-200 shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-[13px] text-white">Partnering in Care</h4>
                <p className="text-[10px] sm:text-[11px] text-emerald-100 font-medium mt-0.5 sm:mt-1">Your involvement makes a difference. Track exercises and view clinical feedback instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 md:p-14 lg:p-16 bg-white flex items-center justify-center relative">
          <div className="w-full max-w-[380px] space-y-6 sm:space-y-8 animate-fade-in">
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Parent Login</h2>
              <p className="text-[14px] text-slate-500 font-medium mt-1.5">Sign in to view your child's dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Registered Phone Number"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                error={error ? " " : ""} // Suppress text, let border show
                icon={Phone}
              />

              <div className="relative">
                <Input
                  label="Secure Password"
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
                <Button type="submit" variant="secondary" fullWidth size="xl" loading={loading}>
                  Enter Portal
                </Button>
              </div>
            </form>

            <div className="text-center space-y-2">
              <p className="text-[12px] text-slate-500 font-medium">
                Login details are provided by your therapist during registration.
              </p>
              <p className="text-[13px] font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <Phone className="h-4 w-4" />
                Need help? Call: 044-28353136
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
