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
  ChevronRight,
  Baby
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isParent } = useAuth();

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* ─── Animated Background ─── */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-400/20 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-400/20 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* ─── Top Navigation Bar ─── */}
      <header className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition-opacity" />
              <img
                src="/kids_care_rehab_center_logo.jpg"
                alt="KIDS CARE 360 Logo"
                className="relative h-12 w-12 rounded-xl object-cover border-2 border-white shadow-md"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black gradient-text-blue tracking-tight">KIDS CARE 360</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase shadow-sm">Clinical System</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 hidden sm:block">Neurodiversity Assessment &amp; Therapy Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+18001234567"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/60 bg-white/70 hover:bg-white text-slate-600 text-[13px] font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.44 2 2 0 0 1 3.6 2.26h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.1 6.1l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+1 (800) 123-4567</span>
            </a>
            <a
              href="mailto:info@kidscare360.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-blue text-white text-[13px] font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span>Contact Us</span>
            </a>
          </div>
        </div>
      </header>


      {/* ─── Hero Section ─── */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-slide-up">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white shadow-sm text-blue-700 text-xs font-bold backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Assess • Plan • Intervene • Track • Progress</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Empowering Neurodiverse <br className="hidden sm:block"/> Children with <span className="gradient-text-teal relative inline-block">Precision Care<div className="absolute -bottom-2 left-0 right-0 h-3 bg-emerald-400/20 -z-10 rounded-full blur-sm"/></span>
            </h1>

            {/* Sub-headline */}
            <p className="text-[15px] sm:text-[17px] text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              A comprehensive clinical management platform unifying <strong className="text-violet-700">IEP Special School assessment cycles</strong> and <strong className="text-emerald-700">specialized therapy pathways</strong> with automated 3-month reporting and interactive parent tracking.
            </p>

            {/* Primary Action Portals */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              
              {/* Staff Portal Button Card */}
              <div
                onClick={() => navigate("/login")}
                className="group p-6 rounded-2xl bg-white border border-white shadow-sm hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-blue text-white flex items-center justify-center shadow-inner shadow-blue-400/30">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">Therapists &amp; Admin</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Staff &amp; Clinical Portal</h3>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">Access diagnostic assessments, IEP sheets, and publish reports.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-blue-700 pt-4 mt-auto">
                    <span>Sign In as Staff</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Parent Portal Button Card */}
              <div
                onClick={() => navigate("/parent/login")}
                className="group p-6 rounded-2xl bg-white border border-white shadow-sm hover:shadow-[0_20px_40px_rgba(5,150,105,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-emerald text-white flex items-center justify-center shadow-inner shadow-emerald-400/30">
                      <HeartHandshake className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Parents &amp; Families</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Parent Portal</h3>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">View published 3-month progress reports &amp; daily home exercises.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 pt-4 mt-auto">
                    <span>Parent Phone Login</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Two Distinct Dedicated Care Programs ─── */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl -skew-y-2 origin-top-left border-y border-white" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Dual Specialized Structure</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Separate Programs for Targeted Development</h2>
            <p className="text-[15px] text-slate-600 font-medium">
              IEP Special School students and Therapy children are managed through independent clinical workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Program 1: IEP Special School */}
            <div className="p-8 lg:p-10 rounded-3xl bg-white border border-white shadow-[0_8px_32px_rgba(124,58,237,0.1)] hover:shadow-[0_16px_48px_rgba(124,58,237,0.15)] transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-violet text-white flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 uppercase tracking-widest shadow-sm">Program 1</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">IEP — Special School</h3>
                  </div>
                </div>

                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                  Dedicated for children registered under the special education school curriculum with comprehensive functional skill tracking.
                </p>

                <ul className="space-y-4 text-[13px] text-slate-700 font-medium pt-2">
                  <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="p-1 bg-violet-100 rounded-md shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                    </div>
                    <span><strong className="text-slate-900">24-Section Clinical Form:</strong> Full competency mapping across self-care, communication, sensory, and academics.</span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="p-1 bg-violet-100 rounded-md shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                    </div>
                    <span><strong className="text-slate-900">3-Month Evaluation Cycles:</strong> Quarterly baseline comparisons and individualized growth targets.</span>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="p-1 bg-violet-100 rounded-md shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                    </div>
                    <span><strong className="text-slate-900">Competency Radar Graph:</strong> Visual 8-axis domain capability profile for parent reviews.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Program 2: Therapy */}
            <div className="p-8 lg:p-10 rounded-3xl bg-white border border-white shadow-[0_8px_32px_rgba(5,150,105,0.1)] hover:shadow-[0_16px_48px_rgba(5,150,105,0.15)] transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-emerald text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest shadow-sm">Program 2</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1.5">Therapy Pathways</h3>
                  </div>
                </div>

                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                  Dedicated clinical therapy tracks focusing on targeted intervention, clinic sessions, and daily parent-led home routines.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { name: "ASD", desc: "Autism Spectrum Disorder" },
                    { name: "ADHD", desc: "Attention & Hyperactivity" },
                    { name: "Developmental Delay", desc: "Milestone Intervention" },
                    { name: "Learning Disability", desc: "Cognitive Support" }
                  ].map((cat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                      <span className="font-bold text-emerald-700 block text-[13px]">{cat.name}</span>
                      <span className="text-[11px] font-medium text-slate-500 block truncate mt-0.5">{cat.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mt-4">
                  <div className="p-1 bg-emerald-100 rounded-md shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-[13px] text-emerald-900 font-medium leading-relaxed">
                    <strong>Interactive Home Exercise Program:</strong> Step-by-step guidance with daily parent completion check-ins, fully monitored by staff.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5-Stage Clinical Care Cycle ─── */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">End-to-End Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">The 5 Pillars of KIDS CARE 360</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
            {[
              { num: "01", title: "Assess", desc: "Diagnostic evaluation & 24-section functional mapping.", color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20" },
              { num: "02", title: "Plan", desc: "Quarterly individualized education & therapy blueprints.", color: "from-sky-500 to-sky-600", shadow: "shadow-sky-500/20" },
              { num: "03", title: "Intervene", desc: "Structured clinic therapy & prescribed home activities.", color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20" },
              { num: "04", title: "Track", desc: "Daily parent activity check-ins and clinical progress logs.", color: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/20" },
              { num: "05", title: "Progress", desc: "Multi-cycle radar graph comparison & admin-verified reports.", color: "from-violet-500 to-violet-600", shadow: "shadow-violet-500/20" }
            ].map((p, idx) => (
              <div key={idx} className="group p-6 rounded-2xl bg-white border border-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col">
                <div className={`text-sm font-black px-3 py-1 rounded-full text-white bg-gradient-to-r ${p.color} w-fit shadow-md ${p.shadow} mb-4`}>
                  {p.num}
                </div>
                <h4 className="text-[17px] font-bold text-slate-900 mb-2">{p.title}</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium mt-auto">{p.desc}</p>
                
                {/* Decorative background number */}
                <div className="absolute -bottom-6 -right-4 text-9xl font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                  {p.num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─── */}
      <section className="py-20 relative z-10">
        <div className="absolute inset-0 bg-slate-900 -skew-y-2 origin-bottom-right" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10 py-12">
          <div className="space-y-3">
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ready to access your portal?</h3>
            <p className="text-[15px] text-slate-400 font-medium">Select your role to view diagnostic records, therapy paths, and reports.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-xl bg-gradient-blue hover:brightness-110 text-white font-bold text-[14px] transition-all shadow-[0_8px_24px_rgba(37,99,235,0.4)] hover:-translate-y-1 flex items-center gap-2 cursor-pointer border-0"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Staff &amp; Admin Sign In</span>
            </button>
            <button
              onClick={() => navigate("/parent/login")}
              className="px-8 py-4 rounded-xl bg-gradient-emerald hover:brightness-110 text-white font-bold text-[14px] transition-all shadow-[0_8px_24px_rgba(5,150,105,0.4)] hover:-translate-y-1 flex items-center gap-2 cursor-pointer border-0"
            >
              <HeartHandshake className="h-5 w-5" />
              <span>Parent Portal Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-auto bg-[#0F172A] text-slate-400 py-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px]">
          <div className="flex items-center gap-4">
            <img
              src="/kids_care_rehab_center_logo.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-xl object-cover border-2 border-slate-700"
            />
            <div>
              <span className="font-bold text-white text-[15px] block">KIDS CARE 360</span>
              <span className="text-slate-500 font-medium">Neurodiversity Clinical System</span>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-center md:text-right">
            © {new Date().getFullYear()} Kids Care Rehab Centre. <br className="md:hidden" /> All clinical information is confidential.
          </p>
        </div>
      </footer>
    </div>
  );
}
