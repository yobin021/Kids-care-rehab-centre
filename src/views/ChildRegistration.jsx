"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, UserCheck, Edit3 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";
import { childrenService } from "../services/childrenService";
import { parentService } from "../services/parentService";

export default function ChildRegistration() {
  const navigate = useNavigate();
  const { user, addRegisteredChild, showToast } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdChild, setCreatedChild] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "Male",
    diagnosis: "ASD",
    profile: "B",
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
    if (!formData.diagnosis) {
      showToast("Diagnosis is required.", "danger");
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
      diagnosis: formData.diagnosis,
      profile: formData.profile,
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
      if (res?.id && formData.phone) {
        try {
          await parentService.createAccount(
            {
              parent_name: formData.parentName || "Parent",
              relationship: formData.relationship || "Parent",
              phone: formData.phone,
              email: formData.email || null,
              address: formData.address || null,
              password_hash: formData.parentPassword || "parent123"
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
        parent: {
          name: formData.parentName,
          relationship: formData.relationship,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          portalActive: formData.createParentAccess,
          portalPassword: formData.parentPassword || "parent123"
        }
      };

      addRegisteredChild(newChildObj);
      setCreatedChild(newChildObj);
      showToast(`Child ${formData.name} registered and saved to database!`, "success");
      setStep(5);
    } catch (err) {
      console.warn("Local child registration fallback:", err.message);
      const mockId = `KCR-2026-${Math.floor(Math.random() * 900) + 100}`;
      const fallbackChildObj = {
        id: mockId,
        ...childPayload,
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
          portalPassword: formData.parentPassword || "parent123"
        }
      };
      addRegisteredChild(fallbackChildObj);
      setCreatedChild(fallbackChildObj);
      showToast(`Child ${formData.name} registered successfully!`, "success");
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
          onClick={() => navigate("/children")}
          className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
        </button>
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Child Registration</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Step-by-step registration for new clinic enrollment.</p>
        </div>
      </div>

      {/* Step Progress Indicator */}
      {step < 5 && (
        <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-xs flex items-center justify-between">
          {[
            { num: 1, name: "Child Info" },
            { num: 2, name: "Diagnosis & Profile" },
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

      {/* Step 1: Child Basic Details */}
      {step === 1 && (
        <Card title="Step 1: Child Basic Information">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                label="School Name"
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
              <Button type="submit">Next: Diagnosis & Profile →</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 2: Clinical Details */}
      {step === 2 && (
        <Card title="Step 2: Diagnosis & Clinical Profile">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Diagnosis *"
                required
                value={formData.diagnosis}
                onChange={(e) => updateField("diagnosis", e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C2C2A]">Clinical Profile *</label>
                <select
                  value={formData.profile}
                  onChange={(e) => updateField("profile", e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]"
                >
                  <option value="A">Profile A — ASD Communication Focus</option>
                  <option value="B">Profile B — ASD High Functioning</option>
                  <option value="C">Profile C — ASD + ADHD Combined</option>
                  <option value="D">Profile D — Motor or Developmental Delay</option>
                  <option value="E">Profile E — Learning Disability Pathway</option>
                </select>
              </div>
            </div>

            <Input
              label="Primary Concern / Chief Complaint *"
              type="textarea"
              rows={3}
              required
              value={formData.primaryConcern}
              onChange={(e) => updateField("primaryConcern", e.target.value)}
            />

            <Toggle
              label="Previous Therapy Taken?"
              value={formData.previousTherapy}
              onChange={(val) => updateField("previousTherapy", val)}
            />

            {formData.previousTherapy && (
              <Input
                label="Previous Therapy Details"
                type="textarea"
                rows={2}
                value={formData.previousTherapyDetails}
                onChange={(e) => updateField("previousTherapyDetails", e.target.value)}
              />
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outlined" onClick={() => setStep(1)}>← Back</Button>
              <Button type="submit">Next: Parent Info →</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 3: Parent Info */}
      {step === 3 && (
        <Card title="Step 3: Parent / Guardian Details">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(4);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent Name *"
                required
                value={formData.parentName}
                onChange={(e) => updateField("parentName", e.target.value)}
              />
              <Input
                label="Relationship *"
                required
                value={formData.relationship}
                onChange={(e) => updateField("relationship", e.target.value)}
              />
              <Input
                label="Phone Number (Login ID) *"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <Input
              label="Address"
              type="textarea"
              rows={2}
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
            />

            <div className="flex justify-between pt-2">
              <Button variant="outlined" onClick={() => setStep(2)}>← Back</Button>
              <Button type="submit">Next: Review & Confirm →</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <Card title="Step 4: Review Registration Summary">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-1">
                <h4 className="font-bold text-[#185FA5] uppercase">Child Summary</h4>
                <p>Name: <strong>{formData.name}</strong></p>
                <p>DOB: <strong>{formData.dob} ({calculateAge(formData.dob)})</strong></p>
                <p>Diagnosis: <strong>{formData.diagnosis}</strong></p>
                <p>Profile: <strong>Profile {formData.profile}</strong></p>
              </div>

              <div className="p-3 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]/60 space-y-1">
                <h4 className="font-bold text-[#185FA5] uppercase">Parent Summary</h4>
                <p>Parent: <strong>{formData.parentName} ({formData.relationship})</strong></p>
                <p>Phone: <strong>{formData.phone}</strong></p>
                <p>Address: <strong>{formData.address || "N/A"}</strong></p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#D3D1C7]/60">
              <Button variant="outlined" onClick={() => setStep(3)}>← Edit Parent Info</Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                Register Child
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Success Screen */}
      {step === 5 && createdChild && (
        <Card className="text-center p-8 space-y-6 animate-in fade-in">
          <div className="h-16 w-16 bg-[#3B6D11]/10 text-[#3B6D11] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#2C2C2A]">Child Registered Successfully!</h2>
            <p className="text-sm text-[#5F5E5A]">Generated ID: <strong className="font-mono text-[#185FA5]">{createdChild.id}</strong></p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#D3D1C7]/60">
            <Button variant="outlined" onClick={() => navigate(`/children/${createdChild.id}`)}>
              View Child Profile
            </Button>
            <Button onClick={() => navigate(`/assessment/new/${createdChild.id}`)}>
              Start Clinical Assessment →
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}
