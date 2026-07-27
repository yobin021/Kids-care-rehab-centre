"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ArrowLeft, Save, UserCheck } from "lucide-react";

export default function ChildRegistration() {
  const { addChild, setActiveTab, prefillRegistrationData, setPrefillRegistrationData } = useDashboard();

  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("2020-06-15");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [diagnosis, setDiagnosis] = useState("");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolClass, setSchoolClass] = useState("");

  const [parentName, setParentName] = useState("");
  const [relationship, setRelationship] = useState<"Father" | "Mother" | "Guardian">("Father");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [referredBy, setReferredBy] = useState("");
  const [dateOfRegistration, setDateOfRegistration] = useState(new Date().toISOString().split("T")[0]);
  const [assignedTherapist, setAssignedTherapist] = useState<"Priya" | "Meena">("Priya");
  const [primaryConcern, setPrimaryConcern] = useState("");

  const [previousTherapy, setPreviousTherapy] = useState(false);
  const [previousTherapyDetails, setPreviousTherapyDetails] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState("Tamil, English");
  const [schoolFeedback, setSchoolFeedback] = useState("");

  // Populate from prefill if converted from enquiry
  useEffect(() => {
    if (prefillRegistrationData) {
      if (prefillRegistrationData.name) setChildName(prefillRegistrationData.name);
      if (prefillRegistrationData.parentName) setParentName(prefillRegistrationData.parentName);
      if (prefillRegistrationData.whatsapp) setWhatsapp(prefillRegistrationData.whatsapp);
      if (prefillRegistrationData.address) setAddress(prefillRegistrationData.address);
      if (prefillRegistrationData.primaryConcern) setPrimaryConcern(prefillRegistrationData.primaryConcern);
      setPrefillRegistrationData(null);
    }
  }, [prefillRegistrationData, setPrefillRegistrationData]);

  // Calculate age helper
  const calculateAgeStr = (dobDate: string) => {
    if (!dobDate) return "";
    const birth = new Date(dobDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months > 0 ? months + "m" : ""}`.trim();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!childName || !dob || !parentName || !whatsapp || !assignedTherapist) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    const calculatedAge = calculateAgeStr(dob) || "5y";

    addChild({
      name: childName,
      dob,
      age: calculatedAge,
      gender,
      parentName,
      relationship,
      whatsapp,
      email,
      address,
      diagnosis: diagnosis || "Speech Delay",
      provisionalDiagnosis,
      profile: "Profile B",
      assignedTherapist,
      schoolName,
      schoolClass,
      referredBy,
      dateOfRegistration,
      lastSessionDate: new Date().toISOString().split("T")[0],
      status: "Active",
      primaryConcern,
      previousTherapy,
      previousTherapyDetails,
      languagesSpoken,
      schoolFeedback
    });

    setActiveTab("children");
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("children")}
            className="p-2 rounded-[8px] bg-white border border-[#D3D1C7] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">Child Registration Form</h2>
            <p className="text-xs font-semibold text-[#5F5E5A]">Register a new child patient to the clinic database.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: CHILD DETAILS */}
        <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Section 1 — Child Details
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
                placeholder="Full Name"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Date of Birth <span className="text-[#993C1D]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="flex-1 h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
                />
                <div className="h-10 px-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[8px] flex items-center text-xs font-bold text-[#185FA5]">
                  Age: {calculateAgeStr(dob)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1.5">
                Gender <span className="text-[#993C1D]">*</span>
              </label>
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
                placeholder="e.g. ASD, Speech Delay, ADHD"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Provisional Diagnosis</label>
              <input
                type="text"
                value={provisionalDiagnosis}
                onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                placeholder="Provisional observations"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Name of school"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Class / Grade</label>
              <input
                type="text"
                value={schoolClass}
                onChange={(e) => setSchoolClass(e.target.value)}
                placeholder="e.g. LKG, UKG, Class 1"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PARENT / GUARDIAN DETAILS */}
        <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Section 2 — Parent / Guardian Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Parent Name <span className="text-[#993C1D]">*</span>
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Relationship to Child</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-bold outline-none focus:border-[#185FA5] bg-white cursor-pointer"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Phone Number / WhatsApp <span className="text-[#993C1D]">*</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Mobile number"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Email Address (for login access)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@email.com"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full residential address"
                className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: REFERRAL + REGISTRATION */}
        <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Section 3 — Referral + Registration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Referred By</label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="Pediatrician or school reference"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Date of Registration <span className="text-[#993C1D]">*</span>
              </label>
              <input
                type="date"
                required
                value={dateOfRegistration}
                onChange={(e) => setDateOfRegistration(e.target.value)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">
                Assigned Therapist <span className="text-[#993C1D]">*</span>
              </label>
              <select
                value={assignedTherapist}
                onChange={(e) => setAssignedTherapist(e.target.value as any)}
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-bold outline-none focus:border-[#185FA5] bg-white cursor-pointer"
              >
                <option value="Priya">Priya (Senior Therapist)</option>
                <option value="Meena">Meena (Occupational Therapist)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Primary Concern</label>
              <textarea
                rows={3}
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                placeholder="Main developmental or behavioural concerns reported by parents"
                className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: ADDITIONAL INFO */}
        <div className="bg-white p-6 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-4">
          <h3 className="text-sm font-extrabold text-[#185FA5] uppercase tracking-wider border-b border-[#D3D1C7]/40 pb-2">
            Section 4 — Additional Info
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-2">Previous Therapy Taken?</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviousTherapy(true)}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-bold border transition-colors cursor-pointer ${
                    previousTherapy ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-[#2C2C2A] border-[#D3D1C7]"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setPreviousTherapy(false)}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-bold border transition-colors cursor-pointer ${
                    !previousTherapy ? "bg-[#185FA5] text-white border-[#185FA5]" : "bg-white text-[#2C2C2A] border-[#D3D1C7]"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {previousTherapy && (
              <div>
                <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Specify Therapy Type & Duration</label>
                <textarea
                  rows={2}
                  value={previousTherapyDetails}
                  onChange={(e) => setPreviousTherapyDetails(e.target.value)}
                  placeholder="e.g. Speech therapy 1 year at local clinic"
                  className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">Languages Spoken at Home</label>
              <input
                type="text"
                value={languagesSpoken}
                onChange={(e) => setLanguagesSpoken(e.target.value)}
                placeholder="e.g. Tamil, English"
                className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2C2C2A] block mb-1">School Feedback</label>
              <textarea
                rows={2}
                value={schoolFeedback}
                onChange={(e) => setSchoolFeedback(e.target.value)}
                placeholder="Teacher feedback or classroom concerns"
                className="w-full p-3 border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("children")}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#D3D1C7] hover:bg-slate-100 text-[#2C2C2A] text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#185FA5] hover:bg-[#12487e] text-white text-xs font-bold rounded-[8px] transition-colors inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <UserCheck className="h-4 w-4" />
            <span>Save + Register Child</span>
          </button>
        </div>

      </form>
    </div>
  );
}
