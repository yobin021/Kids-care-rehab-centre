"use client";

import React, { useState, useEffect } from "react";
import { useDashboard, Child } from "@/context/DashboardContext";
import { ArrowLeft, Save, UserCheck } from "lucide-react";

export default function ChildEdit() {
  const { children, activeChildId, updateChild, setActiveTab } = useDashboard();

  const child: Child = children.find((c) => c.id === activeChildId) || children[0];

  const [childName, setChildName] = useState(child?.name || "Arsh Mohammed");
  const [dob, setDob] = useState(child?.dob || "2021-01-15");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">(child?.gender || "Male");
  const [diagnosis, setDiagnosis] = useState(child?.diagnosis || "ASD");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState(child?.provisionalDiagnosis || "ASD with Speech Delay");
  const [schoolName, setSchoolName] = useState(child?.schoolName || "St. Christopher's Academy");
  const [schoolClass, setSchoolClass] = useState(child?.schoolClass || "UKG");

  const [parentName, setParentName] = useState(child?.parentName || "Sirajudeen");
  const [relationship, setRelationship] = useState<"Father" | "Mother" | "Guardian">(child?.relationship || "Father");
  const [whatsapp, setWhatsapp] = useState(child?.whatsapp || "9841000001");
  const [email, setEmail] = useState(child?.email || "siraj@email.com");
  const [address, setAddress] = useState(child?.address || "T. Nagar, Chennai");

  const [referredBy, setReferredBy] = useState(child?.referredBy || "Self");
  const [assignedTherapist, setAssignedTherapist] = useState<"Priya" | "Meena">((child?.assignedTherapist as any) || "Priya");
  const [primaryConcern, setPrimaryConcern] = useState(child?.primaryConcern || "Poor eye contact and reduced social communication skills");

  const [previousTherapy, setPreviousTherapy] = useState(!!child?.previousTherapy);
  const [previousTherapyDetails, setPreviousTherapyDetails] = useState(child?.previousTherapyDetails || "OT 6 months");
  const [languagesSpoken, setLanguagesSpoken] = useState(child?.languagesSpoken || "Tamil, English, Urdu");
  const [schoolFeedback, setSchoolFeedback] = useState(child?.schoolFeedback || "Friendly with peers, needs prompt for table activities.");

  useEffect(() => {
    if (child) {
      setChildName(child.name);
      setDob(child.dob);
      setGender(child.gender);
      setDiagnosis(child.diagnosis);
      setProvisionalDiagnosis(child.provisionalDiagnosis || "");
      setSchoolName(child.schoolName);
      setSchoolClass(child.schoolClass);
      setParentName(child.parentName);
      setRelationship(child.relationship || "Father");
      setWhatsapp(child.whatsapp);
      setEmail(child.email || "");
      setAddress(child.address);
      setReferredBy(child.referredBy);
      setAssignedTherapist((child.assignedTherapist as any) || "Priya");
      setPrimaryConcern(child.primaryConcern || child.mainConcern);
      setPreviousTherapy(!!child.previousTherapy);
      setPreviousTherapyDetails(child.previousTherapyDetails || "");
      setLanguagesSpoken(child.languagesSpoken || "Tamil, English");
      setSchoolFeedback(child.schoolFeedback || "");
    }
  }, [child]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateChild(child.id, {
      name: childName,
      dob,
      gender,
      diagnosis,
      provisionalDiagnosis,
      schoolName,
      schoolClass,
      parentName,
      relationship,
      whatsapp,
      email,
      address,
      referredBy,
      assignedTherapist,
      primaryConcern,
      previousTherapy,
      previousTherapyDetails,
      languagesSpoken,
      schoolFeedback
    });

    setActiveTab("child-profile");
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("child-profile")}
            className="p-2 rounded-[8px] bg-white border border-[#D3D1C7] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">
              Editing — <span className="text-[#185FA5]">{child.name}</span> | <span className="font-mono text-[#5F5E5A]">{child.id}</span>
            </h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Update child profile details and parent contact information.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: CHILD DETAILS */}
        <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Child Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Child&apos;s Full Name <span className="text-[#993C1D]">*</span>
              </label>
              <input
                type="text"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Date of Birth <span className="text-[#993C1D]">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1.5">Gender</label>
              <div className="flex items-center gap-3">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <label key={g} className="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="accent-[#185FA5]"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Diagnosis / Condition</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Class / Grade</label>
              <input
                type="text"
                value={schoolClass}
                onChange={(e) => setSchoolClass(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PARENT DETAILS */}
        <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Parent / Guardian Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Parent Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("child-profile")}
            className="px-6 py-2.5 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>

      </form>
    </div>
  );
}
