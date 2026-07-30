"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, Save, Send, CheckCircle2, ArrowLeft, Plus, X, Eye } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { mockDefaultReport, mockExercises } from "../data/mockData";

export default function ReportGenerationEditor() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { childrenList, updateChildDetails, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === childId) || childrenList[1] || childrenList[0];

  // Loading AI Generation State
  const [isGenerating, setIsGenerating] = useState(true);
  const [genStep, setGenStep] = useState(0);

  // Active Tab: therapist | parent | exercises
  const [activeTab, setActiveTab] = useState("therapist");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);

  // Therapist Report Form State
  const [therapistReport, setTherapistReport] = useState({
    background: `${child?.name} is a ${child?.age} ${child?.gender} presenting with ${child?.primaryConcern}. Evaluated using ISAA protocol.`,
    findings: "ISAA score of 94 indicates Mild Autism Spectrum Disorder. Primary deficits observed in receptive/expressive communication and social reciprocity.",
    concerns: "Speech delay, poor eye contact, auditory sensory sensitivity, sitting tolerance 5-10 minutes.",
    diagnosis: `${child?.diagnosis} — Profile B (ASD High Functioning)`,
    recommendations: "Speech therapy 2x/week, Occupational therapy with sensory integration 2x/week, Parent guidance program."
  });

  // Parent Report Form State
  const [parentReport, setParentReport] = useState({
    aboutYourChild: mockDefaultReport.aboutYourChild,
    strengths: [...mockDefaultReport.strengths],
    supportAreas: [...mockDefaultReport.supportAreas],
    planType: mockDefaultReport.plan.type,
    planFrequency: mockDefaultReport.plan.frequency,
    planDuration: mockDefaultReport.plan.duration,
    planNextReview: mockDefaultReport.plan.nextReview,
    homeAdvice: mockDefaultReport.homeAdvice,
    homeSuggestions: [...mockDefaultReport.homeSuggestions],
    encouragement: mockDefaultReport.encouragement
  });

  // Exercise Assignments State
  const [clinicEx, setClinicEx] = useState([
    "Brain Gym Exercises",
    "Sensory Integration Activities",
    "Speech Therapy Exercises",
    "Communication Cards",
    "Social Skills Training"
  ]);

  const [homeEx, setHomeEx] = useState([
    "Brain Gym Exercises",
    "Communication Cards",
    "Sensory Integration Activities"
  ]);

  // Simulated AI Generation Steps
  useEffect(() => {
    const steps = [
      "Analyzing ISAA assessment ratings...",
      "Mapping domain scores & clinical profile...",
      "Generating clinical recommendations...",
      "Translating to parent-friendly language...",
      "Finalizing report draft..."
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setGenStep(current);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const handlePublish = () => {
    const pubDate = new Date().toISOString().split("T")[0];

    const fullPublishedData = {
      childId: child.id,
      childName: child.name,
      publishedDate: pubDate,
      therapistReport,
      parentReport,
      clinicEx,
      homeEx
    };

    // Save to localStorage
    localStorage.setItem(`report_published_${child.id}`, JSON.stringify(fullPublishedData));

    // Update child details in context
    updateChildDetails(child.id, {
      reportsCount: (child.reportsCount || 0) + 1,
      lastReportDate: pubDate
    });

    setShowPublishModal(false);
    setIsPublishedSuccess(true);
    showToast(`Report published successfully for ${child.name}!`, "success");
  };

  if (isGenerating) {
    const steps = [
      "Analyzing ISAA assessment ratings...",
      "Mapping domain scores & clinical profile...",
      "Generating clinical recommendations...",
      "Translating to parent-friendly language...",
      "Finalizing report draft..."
    ];

    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="bg-white p-8 rounded-[16px] border border-[#D3D1C7] shadow-lg space-y-6">
          <div className="h-16 w-16 bg-[#185FA5]/10 text-[#185FA5] rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 animate-spin text-[#185FA5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#2C2C2A]">Generating Report for {child?.name}</h2>
            <p className="text-xs font-semibold text-[#185FA5]">{steps[genStep]}</p>
          </div>

          <div className="w-full bg-[#F8F8F6] rounded-full h-3 overflow-hidden border border-[#D3D1C7]">
            <div
              className="h-full bg-[#185FA5] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((genStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-[#9B9A96]">Drafting both Therapist Clinical Report and Parent Simple Report...</p>
        </div>
      </div>
    );
  }

  if (isPublishedSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="bg-white p-8 rounded-[16px] border border-[#D3D1C7] shadow-lg space-y-4">
          <div className="h-16 w-16 bg-[#3B6D11]/10 text-[#3B6D11] rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#2C2C2A]">Report Published Successfully!</h2>
          <p className="text-sm text-[#5F5E5A] font-semibold">
            {child?.parent?.name} can now view {child?.name}&apos;s report and daily exercises on the Parent Portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#D3D1C7]/60">
            <Button variant="secondary" icon={Eye} onClick={() => navigate("/parent/report")}>
              Preview Parent View
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] pb-12">
      
      {/* Top Header Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/assessment/${child?.id}/results`)}
            className="p-1.5 rounded-[8px] border border-[#D3D1C7] hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#2C2C2A]">{child?.name}</h2>
              <Badge label="Report Draft" variant="amber" size="sm" />
            </div>
            <p className="text-[11px] text-[#5F5E5A] font-semibold">Clinical & Parent Report Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" icon={Save} onClick={() => showToast("Report draft saved.", "success")}>
            Save Draft
          </Button>
          <Button size="sm" icon={Send} onClick={() => setShowPublishModal(true)}>
            Publish Report
          </Button>
        </div>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("therapist")}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "therapist" ? "bg-[#185FA5] text-white shadow-xs" : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6]"
          }`}
        >
          Therapist Report (Clinical)
        </button>

        <button
          onClick={() => setActiveTab("parent")}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "parent" ? "bg-[#0F6E56] text-white shadow-xs" : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6]"
          }`}
        >
          Parent Report (Simple Language)
        </button>

        <button
          onClick={() => setActiveTab("exercises")}
          className={`px-4 py-2 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "exercises" ? "bg-[#3C3489] text-white shadow-xs" : "bg-transparent text-[#5F5E5A] hover:bg-[#F8F8F6]"
          }`}
        >
          Assigned Exercises & Tools
        </button>
      </div>

      {/* TAB 1: THERAPIST REPORT */}
      {activeTab === "therapist" && (
        <Card title="Clinical Developmental Assessment Report">
          <div className="space-y-4">
            <Input
              label="Clinical Background"
              type="textarea"
              rows={3}
              value={therapistReport.background}
              onChange={(e) => setTherapistReport({ ...therapistReport, background: e.target.value })}
            />

            <Input
              label="Assessment Findings & ISAA Observations"
              type="textarea"
              rows={3}
              value={therapistReport.findings}
              onChange={(e) => setTherapistReport({ ...therapistReport, findings: e.target.value })}
            />

            <Input
              label="Primary Clinical Concerns"
              type="textarea"
              rows={2}
              value={therapistReport.concerns}
              onChange={(e) => setTherapistReport({ ...therapistReport, concerns: e.target.value })}
            />

            <Input
              label="Provisional Diagnosis & Profile Classification"
              value={therapistReport.diagnosis}
              onChange={(e) => setTherapistReport({ ...therapistReport, diagnosis: e.target.value })}
            />

            <Input
              label="Therapist Recommendations"
              type="textarea"
              rows={3}
              value={therapistReport.recommendations}
              onChange={(e) => setTherapistReport({ ...therapistReport, recommendations: e.target.value })}
            />
          </div>
        </Card>
      )}

      {/* TAB 2: PARENT REPORT */}
      {activeTab === "parent" && (
        <Card title="Parent Report (Simple & Reassuring Language)">
          <div className="space-y-4">
            <Input
              label="About Your Child Summary"
              type="textarea"
              rows={3}
              value={parentReport.aboutYourChild}
              onChange={(e) => setParentReport({ ...parentReport, aboutYourChild: e.target.value })}
            />

            {/* Strengths List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#3B6D11]">✨ Child&apos;s Strengths (Bulleted Checklist)</label>
              {parentReport.strengths.map((str, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={str}
                    onChange={(e) => {
                      const next = [...parentReport.strengths];
                      next[idx] = e.target.value;
                      setParentReport({ ...parentReport, strengths: next });
                    }}
                    className="flex-1 h-9 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] outline-none"
                  />
                  <button
                    onClick={() => {
                      const next = parentReport.strengths.filter((_, i) => i !== idx);
                      setParentReport({ ...parentReport, strengths: next });
                    }}
                    className="text-[#993C1D] hover:bg-red-50 p-1.5 rounded cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() => setParentReport({ ...parentReport, strengths: [...parentReport.strengths, "New Strength"] })}
              >
                + Add Strength
              </Button>
            </div>

            {/* Support Areas List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#185FA5]">📌 Areas We Are Supporting</label>
              {parentReport.supportAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => {
                      const next = [...parentReport.supportAreas];
                      next[idx] = e.target.value;
                      setParentReport({ ...parentReport, supportAreas: next });
                    }}
                    className="flex-1 h-9 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-medium text-[#2C2C2A] outline-none"
                  />
                  <button
                    onClick={() => {
                      const next = parentReport.supportAreas.filter((_, i) => i !== idx);
                      setParentReport({ ...parentReport, supportAreas: next });
                    }}
                    className="text-[#993C1D] hover:bg-red-50 p-1.5 rounded cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() => setParentReport({ ...parentReport, supportAreas: [...parentReport.supportAreas, "New Focus Area"] })}
              >
                + Add Support Area
              </Button>
            </div>

            <Input
              label="Home Advice Paragraph"
              type="textarea"
              rows={2}
              value={parentReport.homeAdvice}
              onChange={(e) => setParentReport({ ...parentReport, homeAdvice: e.target.value })}
            />

            <Input
              label="Encouraging Message for Parents"
              type="textarea"
              rows={2}
              value={parentReport.encouragement}
              onChange={(e) => setParentReport({ ...parentReport, encouragement: e.target.value })}
            />
          </div>
        </Card>
      )}

      {/* TAB 3: ASSIGNED EXERCISES */}
      {activeTab === "exercises" && (
        <div className="space-y-6">
          <Card title="Clinic Prescribed Exercises">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {clinicEx.map((ex, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-[#185FA5]/10 text-[#185FA5] border border-[#185FA5]/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span>{ex}</span>
                    <button onClick={() => setClinicEx(clinicEx.filter((_, i) => i !== idx))} className="hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Home Parent Exercises">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {homeEx.map((ex, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-[#0F6E56]/10 text-[#0F6E56] border border-[#0F6E56]/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span>{ex}</span>
                    <button onClick={() => setHomeEx(homeEx.filter((_, i) => i !== idx))} className="hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PUBLISH CONFIRMATION MODAL */}
      <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Publish Assessment Report">
        <div className="space-y-4 text-xs font-semibold">
          <p className="text-[#2C2C2A]">
            Publish this report for <strong>{child?.name}</strong>? It will immediately become visible to {child?.parent?.name} on the Parent Portal.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D3D1C7]">
            <Button variant="outlined" onClick={() => setShowPublishModal(false)}>Cancel</Button>
            <Button onClick={handlePublish}>Yes, Publish Report</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
