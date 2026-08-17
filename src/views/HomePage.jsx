"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  GraduationCap,
  Activity,
  HeartHandshake,
  ArrowRight,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Users,
  CalendarCheck,
  TrendingUp,
  BrainCircuit,
  Lock,
  ChevronRight
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isParent } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-[#185FA5] selection:text-white">
      {/* ─── Top Navigation Bar ─── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="KIDS CARE 360 Logo"
              className="h-11 w-11 rounded-xl object-cover border border-blue-600/20 shadow-xs"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#185FA5] tracking-tight">KIDS CARE 360</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#185FA5] border border-blue-200/60 uppercase">Clinical & IEP</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">Neurodiversity Clinical &amp; Therapy Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate(isParent ? "/parent/home" : "/dashboard")}
                className="px-4 py-2 rounded-lg bg-[#185FA5] hover:bg-[#134D87] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate("/parent/login")}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-[#185FA5] bg-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <HeartHandshake className="h-4 w-4 text-[#0F6E56]" />
                  <span>Parent Portal</span>
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg bg-[#185FA5] hover:bg-[#134D87] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Staff Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#185FA5] text-xs font-bold shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assess • Plan • Intervene • Track • Progress</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Empowering Neurodiverse Children with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#185FA5] to-[#0F6E56]">Precision Care</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              A comprehensive clinical management platform unifying <strong>IEP Special School assessment cycles</strong> and <strong>specialized therapy pathways</strong> with automated 3-month reporting and interactive parent tracking.
            </p>

            {/* Primary Action Portals */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {/* Staff Portal Button Card */}
              <div
                onClick={() => navigate("/login")}
                className="group p-5 rounded-2xl bg-white border-2 border-blue-500/20 hover:border-[#185FA5] shadow-sm hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185FA5] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Therapists &amp; Admin</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#185FA5] transition-colors">Staff &amp; Clinical Portal</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Access diagnostic assessments, IEP sheets, and report publishing.</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#185FA5] pt-1">
                  <span>Sign In as Staff</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Parent Portal Button Card */}
              <div
                onClick={() => navigate("/parent/login")}
                className="group p-5 rounded-2xl bg-white border-2 border-emerald-500/20 hover:border-[#0F6E56] shadow-sm hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#0F6E56] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Parents &amp; Families</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F6E56] transition-colors">Parent Portal</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">View published 3-month progress reports &amp; daily home exercises.</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#0F6E56] pt-1">
                  <span>Parent Phone Login</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Two Distinct Dedicated Care Programs ─── */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#185FA5] uppercase tracking-wider">Dual Specialized Structure</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Separate Programs for Targeted Development</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              IEP Special School students and Therapy children are managed through independent clinical workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Program 1: IEP Special School */}
            <div className="p-7 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border border-blue-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#185FA5] text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#185FA5] uppercase">Program 1</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">IEP — Special School</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Dedicated for children registered under the special education school curriculum with comprehensive functional skill tracking.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#185FA5] shrink-0 mt-0.5" />
                  <span><strong>24-Section Clinical Form:</strong> Full competency mapping across self-care, communication, sensory, and academics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#185FA5] shrink-0 mt-0.5" />
                  <span><strong>3-Month Evaluation Cycles:</strong> Quarterly baseline comparisons and individualized growth targets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#185FA5] shrink-0 mt-0.5" />
                  <span><strong>Competency Radar Graph:</strong> Visual 8-axis domain capability profile for parent reviews.</span>
                </li>
              </ul>
            </div>

            {/* Program 2: Therapy */}
            <div className="p-7 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 border border-emerald-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#0F6E56] text-white flex items-center justify-center shadow-xs">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F6E56] uppercase">Program 2</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">Therapy Pathways</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Dedicated clinical therapy tracks focusing on targeted intervention, clinic sessions, and daily parent-led home routines.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { name: "ASD", desc: "Autism Spectrum Disorder" },
                  { name: "ADHD", desc: "Attention & Hyperactivity" },
                  { name: "Developmental Delay", desc: "Milestone Intervention" },
                  { name: "Learning Disability", desc: "Cognitive & Academic Support" }
                ].map((cat, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                    <span className="font-bold text-[#0F6E56] block">{cat.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{cat.desc}</span>
                  </div>
                ))}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0F6E56] shrink-0 mt-0.5" />
                  <span><strong>Interactive Home Exercise Program:</strong> Step-by-step guidance with daily parent completion check-ins.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5-Stage Clinical Care Cycle ─── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#185FA5] uppercase tracking-wider">End-to-End Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">The 5 Pillars of KIDS CARE 360</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "01", title: "Assess", desc: "Diagnostic evaluation & 24-section functional competency mapping.", color: "from-blue-500 to-blue-600" },
              { num: "02", title: "Plan", desc: "Quarterly individualized education & therapy intervention blueprints.", color: "from-sky-500 to-sky-600" },
              { num: "03", title: "Intervene", desc: "Structured clinic therapy & therapist-prescribed home activities.", color: "from-teal-500 to-teal-600" },
              { num: "04", title: "Track", desc: "Daily parent activity check-ins and clinical progress logs.", color: "from-emerald-500 to-emerald-600" },
              { num: "05", title: "Progress", desc: "Multi-cycle radar graph comparison & admin-verified reports.", color: "from-indigo-500 to-indigo-600" }
            ].map((p, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
                <div className={`text-xs font-black px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${p.color} w-fit`}>
                  {p.num}
                </div>
                <h4 className="text-base font-bold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">Ready to get started?</h3>
            <p className="text-xs text-slate-500 font-medium">Select your portal to access diagnostic records and reports.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 rounded-xl bg-[#185FA5] hover:bg-[#134D87] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Staff &amp; Admin Sign In</span>
            </button>
            <button
              onClick={() => navigate("/parent/login")}
              className="px-6 py-3 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Parent Portal Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="Logo"
              className="h-7 w-7 rounded-lg object-cover bg-white p-0.5"
            />
            <span className="font-bold text-white">KIDS CARE 360 — Neurodiversity Clinical System</span>
          </div>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Kids Care Rehab Centre. All clinical information is confidential.
          </p>
        </div>
      </footer>
    </div>
  );
}
