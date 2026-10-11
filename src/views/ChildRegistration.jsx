"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, UserCheck, Edit3, Brain, Zap, Clock, BookOpen, School, Activity } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";
import Badge from "../components/ui/Badge";
import { childrenService } from "../services/childrenService";
import { childAssignmentService } from "../services/childAssignmentService";
import { parentService } from "../services/parentService";
import { hashPassword } from "../services/passwordService";
import { THERAPY_CATEGORIES } from "../services/therapyService";

export default function ChildRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, addRegisteredChild, showToast } = useAuth();

  const programParam = searchParams.get("program");
  const categoryParam = searchParams.get("category");

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdChild, setCreatedChild] = useState(null);

  const [formData, setFormData] = useState({
    program_type: programParam === "therapy" ? "therapy" : "iep",
    therapy_category: categoryParam || "ASD",
    name: "",
    dob: "",
    gender: "Male",
    diagnosis: programParam === "therapy" ? (categoryParam || "ASD") : "IEP Special School",
    profile: programParam === "therapy" ? "Therapy" : "IEP",
    school: "",
    class: "",
    primaryConcern: "",
    referredBy: "Self",
    previousTherapy: false,
    previousTherapyDetails: "",
    parentName: "",
    relationship: "Father",
    phone: "",
    email: "",
    address: "",
    createParentAccess: true,
    parentPassword: ""
  });

  useEffect(() => {
    if (programParam === "therapy") {
      setFormData((prev) => ({
        ...prev,
        program_type: "therapy",
        therapy_category: categoryParam || "ASD",
        diagnosis: categoryParam || "ASD",
        profile: "Therapy"
      }));
    } else if (programParam === "iep") {
      setFormData((prev) => ({
        ...prev,
        program_type: "iep",
        therapy_category: null,
        diagnosis: "IEP Special School",
        profile: "IEP"
      }));
    }
  }, [programParam, categoryParam]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      showToast("Child full name is required.", "danger");
      return;
    }
    if (!formData.dob) {
      showToast("Child date of birth is required.", "danger");
      return;
    }
    if (!formData.parentName?.trim()) {
      showToast("Parent/Guardian full name is required.", "danger");
      return;
    }
    if (!formData.phone?.trim()) {
      showToast("Parent phone number is required.", "danger");
      return;
    }

    setIsSubmitting(true);
    const calculatedAge = calculateAge(formData.dob);

    const childPayload = {
      name: formData.name,
      dob: formData.dob,
      age: calculatedAge,
      gender: formData.gender,
      program_type: formData.program_type,
      therapy_category: formData.program_type === "therapy" ? formData.therapy_category : null,
      diagnosis: formData.program_type === "iep" ? "IEP Special School" : formData.therapy_category,
      profile: formData.program_type === "iep" ? "IEP" : formData.therapy_category,
      school: formData.school,
      class: formData.class,
      primaryConcern: formData.primaryConcern,
      referredBy: formData.referredBy,
      previousTherapy: formData.previousTherapy,
      previousTherapyDetails: formData.previousTherapyDetails
    };

    try {
      const res = await childrenService.create(childPayload, user?.id);

      // Create parent account in Supabase if parent info is provided
      const rawParentPass = formData.parentPassword || "parent123";
      const hashedParentPass = await hashPassword(rawParentPass);

      if (res?.id && formData.phone) {
        try {
          await parentService.createAccount(
            {
              parent_name: formData.parentName || "Parent",
              relationship: formData.relationship || "Parent",
              phone: formData.phone,
              email: formData.email || null,
              address: formData.address || null,
              password_hash: hashedParentPass
            },
            res.id,
            user?.id
          );
        } catch (pErr) {
          console.warn("Parent account creation notice:", pErr.message);
        }
      }

      const newChildObj = {
        ...res,
        registered_by: user?.id,
        parent: {
          name: formData.parentName,
          relationship: formData.relationship,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          portalActive: formData.createParentAccess,
          portalPassword: hashedParentPass
        }
      };

      if (user) {
        childAssignmentService.recordStaffRegistration(res?.id || newChildObj.id, user);
      }
      addRegisteredChild(newChildObj);
      setCreatedChild(newChildObj);
      showToast(`${formData.name} registered under ${formData.program_type === 'iep' ? 'IEP Special School' : `Therapy (${formData.therapy_category})`}!`, "success");
      setStep(5);
    } catch (err) {
      console.warn("Local child registration fallback:", err.message);
      const rawParentPass = formData.parentPassword || "parent123";
      const hashedParentPass = await hashPassword(rawParentPass);
      const mockId = `KCR-2026-${Math.floor(Math.random() * 900) + 100}`;
      const fallbackChildObj = {
        id: mockId,
        ...childPayload,
        registered_by: user?.id,
        registeredDate: new Date().toISOString().split("T")[0],
        reportsCount: 0,
        lastReportDate: null,
        parent: {
          name: formData.parentName,
          relationship: formData.relationship,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          portalActive: formData.createParentAccess,
          portalPassword: hashedParentPass
        }
      };
      if (user) {
        childAssignmentService.recordStaffRegistration(mockId, user);
      }
      addRegisteredChild(fallbackChildObj);
      setCreatedChild(fallbackChildObj);
      showToast(`${formData.name} registered successfully!`, "success");
      setStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
        </button>
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Student &amp; Child Registration</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Enroll a child into either the IEP (Special School) or Therapy program.</p>
        </div>
      </div>

      {/* Step Progress Indicator */}
      {step < 5 && (
        <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs flex items-center justify-between">
          {[
            { num: 1, name: "Program & Info" },
            { num: 2, name: "Pathway Details" },
            { num: 3, name: "Parent Info" },
            { num: 4, name: "Review & Confirm" }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s.num
                    ? "bg-[#185FA5] text-white shadow-xs"
                    : step > s.num
                    ? "bg-[#3B6D11] text-white"
                    : "bg-[#F8F8F6] text-[#5F5E5A] border border-[#D3D1C7]"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${step === s.num ? "text-[#185FA5]" : "text-[#5F5E5A]"}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Program Type & Basic Information */}
      {step === 1 && (
        <Card title="Step 1: Program Selection & Basic Information">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-6"
          >
            {/* Program Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2C2C2A] uppercase tracking-wider">
                Select Enrollment Program *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: IEP */}
                <div
                  onClick={() => {
                    updateField("program_type", "iep");
                    updateField("therapy_category", null);
                    updateField("diagnosis", "IEP Special School");
                  }}
                  className={`p-4 rounded-[10px] border-2 cursor-pointer transition-all ${
                    formData.program_type === "iep"
                      ? "bg-[#EEF4FB] border-[#185FA5] shadow-xs"
                      : "bg-white border-[#D3D1C7] hover:border-[#185FA5]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-[#185FA5]/10 flex items-center justify-center text-[#185FA5] shrink-0">
                      <School className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2C2C2A]">1. IEP – Special School</h4>
                      <p className="text-[11px] text-[#5F5E5A]">For special education students, 24-section IEP sheets &amp; 3-month review cycles.</p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Therapy */}
                <div
                  onClick={() => {
                    updateField("program_type", "therapy");
                    updateField("therapy_category", formData.therapy_category || "ASD");
                    updateField("diagnosis", formData.therapy_category || "ASD");
                  }}
                  className={`p-4 rounded-[10px] border-2 cursor-pointer transition-all ${
                    formData.program_type === "therapy"
                      ? "bg-[#E1F5EE] border-[#0F6E56] shadow-xs"
                      : "bg-white border-[#D3D1C7] hover:border-[#0F6E56]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-[#0F6E56]/10 flex items-center justify-center text-[#0F6E56] shrink-0">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2C2C2A]">2. Therapy Program</h4>
                      <p className="text-[11px] text-[#5F5E5A]">For therapy children across ASD, ADHD, Developmental Delay, or Learning Disability.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D3D1C7]/60">
              <Input
                label="Child Full Name *"
                required
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <Input
                label="Date of Birth *"
                type="date"
                required
                value={formData.dob}
                onChange={(e) => updateField("dob", e.target.value)}
              />
              <Input
                label="Calculated Age"
                value={calculateAge(formData.dob)}
                readOnly
                placeholder="Auto-calculated from DOB"
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2A]">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="School / Center Name"
                value={formData.school}
                onChange={(e) => updateField("school", e.target.value)}
              />
              <Input
                label="Class / Grade"
                value={formData.class}
                onChange={(e) => updateField("class", e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">Next: Pathway Details →</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 2: Pathway & Clinical Details */}
      {step === 2 && (
        <Card title={`Step 2: ${formData.program_type === 'iep' ? 'IEP Special School Pathway' : 'Therapy Category Pathway'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
            className="space-y-5"
          >
            {/* IF THERAPY: Select from the 4 categories */}
            {formData.program_type === "therapy" ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#2C2C2A]">
                  Select Therapy Category * (Select one of the 4 pathways)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {THERAPY_CATEGORIES.map((cat) => {
                    const isSelected = formData.therapy_category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          updateField("therapy_category", cat.id);
                          updateField("diagnosis", cat.id);
                          updateField("profile", cat.id);
                        }}
                        className={`p-3.5 rounded-[10px] border-2 cursor-pointer transition-all ${
                          isSelected
                            ? `${cat.bg} border-[${cat.color}] shadow-2xs`
                            : "bg-white border-[#D3D1C7] hover:border-[#185FA5]/40"
                        }`}
                        style={{ borderColor: isSelected ? cat.color : undefined }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#2C2C2A]">{cat.name}</h4>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {isSelected ? "Selected ✓" : "Choose"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5F5E5A] mt-1 line-clamp-1">{cat.fullName}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-[#ECFDF5] border border-[#86EFAC] rounded-[8px] text-[11px] text-[#085041] space-y-0.5">
                  <p className="font-bold">✓ Therapy Module Activated</p>
                  <p>Child will be enrolled in the therapy exercise system with daily home exercises and category-specific progress tracking.</p>
                </div>
              </div>
            ) : (
              /* IF IEP: Dedicated IEP info banner */
              <div className="space-y-4">
                <div className="p-4 bg-[#EEF4FB] border border-[#185FA5]/30 rounded-[10px] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge label="IEP Special School" variant="blue" />
                    <span className="text-xs font-bold text-[#185FA5]">Dedicated Special Education Track</span>
                  </div>
                  <p className="text-xs text-[#2C2C2A] font-medium leading-relaxed">
                    This child will be enrolled exclusively in the <strong>IEP Special School program</strong>.
                  </p>
                  <ul className="text-[11px] text-[#5F5E5A] space-y-1 list-disc list-inside">
                    <li>Will undergo the official 24-section IEP assessment protocol.</li>
                    <li>Evaluated across 3-month goal cycles with comprehensive progress reports.</li>
                    <li><strong>No Autism/ASD profile</strong> and <strong>no therapy exercises</strong> will be assigned.</li>
                  </ul>
                </div>

                <Input
                  label="Special Education Notes / Referral Reason"
                  type="textarea"
                  rows={2}
                  value={formData.primaryConcern}
                  onChange={(e) => updateField("primaryConcern", e.target.value)}
                  placeholder="Primary educational need or parent concern..."
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D3D1C7]/60">
              <Input
                label="Referred By"
                value={formData.referredBy}
                onChange={(e) => updateField("referredBy", e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2A]">Previous Therapy / Intervention</label>
                <select
                  value={formData.previousTherapy ? "yes" : "no"}
                  onChange={(e) => updateField("previousTherapy", e.target.value === "yes")}
                  className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]"
                >
                  <option value="no">No Previous Therapy</option>
                  <option value="yes">Yes (Has taken therapy before)</option>
                </select>
              </div>
            </div>

            {formData.previousTherapy && (
              <Input
                label="Previous Therapy Details"
                type="textarea"
                rows={2}
                value={formData.previousTherapyDetails}
                onChange={(e) => updateField("previousTherapyDetails", e.target.value)}
                placeholder="Details of previous interventions..."
              />
            )}

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outlined" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button type="submit">Next: Parent Info →</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 3: Parent Information */}
      {step === 3 && (
        <Card title="Step 3: Parent & Contact Details">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(4);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent / Guardian Name *"
                required
                value={formData.parentName}
                onChange={(e) => updateField("parentName", e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2A]">Relationship *</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => updateField("relationship", e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="Phone Number (used for Parent Portal Login) *"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="10-digit mobile number"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Residential Address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
            </div>

            {/* Parent Portal Access Toggle */}
            <div className="p-4 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#2C2C2A]">Create Parent Portal Access</h4>
                  <p className="text-[11px] text-[#5F5E5A]">Allow parent to log in using their phone number to view reports and progress.</p>
                </div>
                <Toggle
                  checked={formData.createParentAccess}
                  onChange={(v) => updateField("createParentAccess", v)}
                />
              </div>

              {formData.createParentAccess && (
                <div className="pt-2 border-t border-[#D3D1C7]/60">
                  <Input
                    label="Parent Portal Password (Default: parent123)"
                    type="password"
                    placeholder="Leave empty for default (parent123)"
                    value={formData.parentPassword}
                    onChange={(e) => updateField("parentPassword", e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outlined" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button type="submit">Next: Review & Confirm →</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <Card title="Step 4: Review Registration Details">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
                <p className="font-bold text-[#185FA5] uppercase tracking-wider text-[10px]">Program Pathway</p>
                <p className="font-bold text-sm text-[#2C2C2A]">
                  {formData.program_type === "iep" ? "IEP – Special School" : `Therapy (${formData.therapy_category})`}
                </p>
                <p className="text-[#5F5E5A]">
                  {formData.program_type === "iep" ? "24-Section IEP Assessment Protocol (No exercises)" : "Therapy Reports & Targeted Home Exercises"}
                </p>
              </div>

              <div className="space-y-1.5 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
                <p className="font-bold text-[#185FA5] uppercase tracking-wider text-[10px]">Child Information</p>
                <p className="font-bold text-[#2C2C2A]">{formData.name} ({formData.gender})</p>
                <p className="text-[#5F5E5A]">DOB: {formData.dob} ({calculateAge(formData.dob)})</p>
              </div>

              <div className="space-y-1.5 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
                <p className="font-bold text-[#185FA5] uppercase tracking-wider text-[10px]">Parent / Guardian</p>
                <p className="font-bold text-[#2C2C2A]">{formData.parentName} ({formData.relationship})</p>
                <p className="text-[#5F5E5A]">Phone: {formData.phone}</p>
              </div>

              <div className="space-y-1.5 p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
                <p className="font-bold text-[#185FA5] uppercase tracking-wider text-[10px]">Portal Access</p>
                <p className="font-bold text-[#2C2C2A]">
                  {formData.createParentAccess ? "Active (Phone + Password)" : "Not Active"}
                </p>
                <p className="text-[#5F5E5A]">Password: {formData.parentPassword || "parent123"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D3D1C7]">
              <Button type="button" variant="outlined" onClick={() => setStep(3)}>
                ← Back
              </Button>
              <Button type="button" onClick={handleSubmit} loading={isSubmitting}>
                Confirm & Complete Registration
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Success & Action Hub */}
      {step === 5 && createdChild && (
        <Card padding="p-8" className="text-center space-y-6 max-w-xl mx-auto border-[#0F6E56]/30">
          <div className="h-16 w-16 bg-[#ECFDF5] text-[#0F6E56] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#2C2C2A]">Registration Successful!</h3>
            <p className="text-xs text-[#5F5E5A] font-semibold">
              <strong>{createdChild.name}</strong> is now registered under{" "}
              <strong className="text-[#185FA5]">
                {createdChild.program_type === "iep" ? "IEP Special School" : `Therapy (${createdChild.therapy_category})`}
              </strong>
            </p>
            <p className="font-mono text-xs font-bold text-[#185FA5] pt-1">ID: {createdChild.id}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#D3D1C7]">
            {createdChild.program_type === "iep" ? (
              <>
                <Button fullWidth onClick={() => navigate(`/assessment/new/${createdChild.id}`)}>
                  Start IEP Assessment →
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate("/iep")}>
                  Go to IEP Hub
                </Button>
              </>
            ) : (
              <>
                <Button fullWidth onClick={() => navigate(`/children/${createdChild.id}`)}>
                  Open Child Profile →
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate("/therapy")}>
                  Go to Therapy Hub
                </Button>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
